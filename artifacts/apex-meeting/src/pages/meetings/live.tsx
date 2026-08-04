import { useState, useEffect, useRef, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { useParams, useLocation } from 'wouter';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { MatrixGlobe } from '@/components/meeting/MatrixGlobe';
import { AudioWaveform } from '@/components/meeting/AudioWaveform';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  useGetMeeting,
  useStartMeetingSession,
  useEndMeetingSession,
  useAskApex,
  getGetMeetingQueryKey,
  getListMeetingSessionsQueryKey
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  Terminal as TerminalIcon,
  MessageSquare,
  Power,
  Volume2,
  VolumeX,
  Loader2,
  Link,
  Upload,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Globe,
  CheckCircle2,
  Download,
} from 'lucide-react';

const TOKEN_KEY = 'apex_meeting_token';

interface TranscriptEntry {
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  streaming?: boolean;
}

interface ExecutionEntry {
  action: string;
  result: string;
  timestamp: Date;
}

interface Slide {
  title: string;
  bullets: string[];
  notes?: string;
}

interface IndexedDoc {
  name: string;
  text: string;
}

interface AnalyzedUrl {
  url: string;
  domain: string;
  text: string;
  title?: string;
}

/** Pick the best available voice for the given lang tag, prefer neural/natural voices */
function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const tag = lang.toLowerCase();
  const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(tag.slice(0, 2)));
  const preferred = langVoices.find(v => /google|microsoft|neural/i.test(v.name));
  return preferred ?? langVoices[0] ?? null;
}

/** Authenticated fetch helper using the JWT stored in localStorage */
async function apexFetch<T = unknown>(path: string, body: object): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as any).error || `HTTP ${res.status}`);
  return data as T;
}

function LiveMeetingContent() {
  const params = useParams();
  const meetingId = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const { data: meeting } = useGetMeeting(meetingId, {
    query: { enabled: !!meetingId, queryKey: getGetMeetingQueryKey(meetingId) }
  });

  const startSession = useStartMeetingSession();
  const endSession = useEndMeetingSession();
  const askApex = useAskApex();

  // ── Core session state ─────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [executionLog, setExecutionLog] = useState<ExecutionEntry[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  // ── URL & document context ─────────────────────────────────────────────────
  const [indexedDoc, setIndexedDoc] = useState<IndexedDoc | null>(null);
  const [analyzedUrl, setAnalyzedUrl] = useState<AnalyzedUrl | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [isIndexingDoc, setIsIndexingDoc] = useState(false);

  // ── Presentation mode ──────────────────────────────────────────────────────
  const [presentationMode, setPresentationMode] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const execScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref mirrors isListening state for use inside callbacks without stale closures
  const isListeningRef = useRef(false);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

  const speechLang = meeting?.language === 'pt' ? 'pt-BR' : meeting?.language === 'es' ? 'es-ES' : 'en-US';

  // Auto-scroll transcript and execution log
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [transcript]);

  useEffect(() => {
    if (execScrollRef.current) {
      execScrollRef.current.scrollTop = execScrollRef.current.scrollHeight;
    }
  }, [executionLog]);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    if (!presentationMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        setPresentationMode(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [presentationMode, slides.length]);

  // Auto-speak when slide changes in presentation mode
  useEffect(() => {
    if (!presentationMode || slides.length === 0) return;
    const slide = slides[currentSlide];
    if (!slide) return;
    const text = `${slide.title}. ${slide.bullets.join('. ')}`;
    speakResponse(text);
  }, [currentSlide, presentationMode]);

  // Start session on mount
  useEffect(() => {
    if (!meetingId || sessionId) return;
    const initSession = async () => {
      try {
        const session = await startSession.mutateAsync({
          meetingId,
          data: { notes: `Started at ${new Date().toISOString()}` }
        });
        setSessionId(session.id);
        toast({ title: t('live.session.started'), description: t('live.session.active') });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : t('live.session.failStart');
        toast({ title: t('common.error'), description: errorMessage, variant: 'destructive' });
      }
    };
    initSession();
  }, [meetingId, sessionId, startSession, toast]);

  // Initialize Web Speech API
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: t('live.voice.notSupported'),
        description: t('live.voice.notSupportedDesc'),
        variant: 'destructive'
      });
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechLang;

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setCurrentTranscript(transcriptText);
      if (event.results[current].isFinal) {
        handleVoiceCommand(transcriptText);
        setCurrentTranscript('');
      }
    };
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(prev => {
        if (prev) { try { recognition.start(); } catch {} }
        return prev;
      });
    };
    recognitionRef.current = recognition;
  }, [speechLang]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      micStream?.getTracks().forEach(t => t.stop());
      window.speechSynthesis.cancel();
    };
  }, []);

  // ── Camera ─────────────────────────────────────────────────────────────────
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraEnabled(true);
      toast({ title: t('live.camera.enabled'), description: t('live.camera.enabledDesc') });
    } catch {
      toast({ title: t('live.camera.error'), description: t('live.camera.errorDesc'), variant: 'destructive' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
  };

  // ── Voice control ──────────────────────────────────────────────────────────
  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      micStream?.getTracks().forEach(t => t.stop());
      setMicStream(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStream(stream);
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        toast({ title: t('live.mic.error'), description: t('live.mic.errorDesc'), variant: 'destructive' });
      }
    }
  };

  const speakResponse = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    const assignVoice = () => {
      const voice = pickVoice(speechLang);
      if (voice) utterance.voice = voice;
    };
    assignVoice();
    if (!utterance.voice) {
      window.speechSynthesis.addEventListener('voiceschanged', assignVoice, { once: true });
    }
    utterance.onstart = () => {
      setIsSpeaking(true);
      // Stop recognition while TTS plays to prevent mic-loop feedback (#37)
      if (isListeningRef.current) {
        try { recognitionRef.current?.stop(); } catch {}
      }
    };
    const resumeAfterSpeech = () => {
      setIsSpeaking(false);
      // Resume recognition after TTS finishes (brief delay lets the speaker settle)
      if (isListeningRef.current) {
        setTimeout(() => { try { recognitionRef.current?.start(); } catch {} }, 350);
      }
    };
    utterance.onend = resumeAfterSpeech;
    utterance.onerror = resumeAfterSpeech;
    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [speechLang]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // ── Main APEX handler — SSE streaming with fallback ──────────────────────
  const handleVoiceCommand = async (text: string) => {
    if (!text.trim()) return;
    if (isListening) recognitionRef.current?.stop();

    // Inject indexed document or URL context as prefix
    let contextualMessage = text;
    const contextSource = indexedDoc || analyzedUrl;
    if (contextSource) {
      const label = indexedDoc
        ? `Documento indexado: "${indexedDoc.name}"`
        : `Conteúdo da URL: ${(analyzedUrl as AnalyzedUrl).url}`;
      const contextText = indexedDoc ? indexedDoc.text : (analyzedUrl as AnalyzedUrl).text;
      const excerpt = contextText.slice(0, 3000);
      contextualMessage = `[${label}]\n${excerpt}\n\n---\nInstrução do usuário: ${text}`;
    }

    setTranscript(prev => [...prev, { type: 'user', message: text, timestamp: new Date() }]);
    setIsProcessing(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`/api/meetings/${meetingId}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: contextualMessage, sessionId: sessionId || undefined }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Detect whether server responded with SSE or plain JSON
      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('event-stream')) {
        // Fallback: plain JSON (e.g. proxied, no SSE support)
        const data = await res.json();
        const msg = data.message ?? data.reply ?? "I'm processing your request.";
        setTranscript(prev => [...prev, { type: 'ai', message: msg, timestamp: new Date() }]);
        speakResponse(msg);
        return;
      }

      // ── SSE streaming ──────────────────────────────────────────────────────
      // Add placeholder entry that will be updated token-by-token
      setTranscript(prev => [...prev, { type: 'ai', message: '', timestamp: new Date(), streaming: true }]);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      try {
        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const raw = decoder.decode(value, { stream: true });
          for (const line of raw.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            try {
              const chunk = JSON.parse(payload);
              if (chunk.error) throw new Error(chunk.error);
              if (chunk.done) break outer;
              if (chunk.delta) {
                fullText += chunk.delta;
                setTranscript(prev => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.streaming) last.message = fullText;
                  return updated;
                });
              }
            } catch (parseErr) {
              if ((parseErr as Error).message?.includes('HTTP') || (parseErr as Error).message?.includes('error')) throw parseErr;
              // skip parse errors for individual chunks
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Mark stream complete (remove streaming flag)
      setTranscript(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.streaming) { last.streaming = false; last.message = fullText || last.message; }
        return updated;
      });

      if (fullText) speakResponse(fullText);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('live.command.failed');
      toast({ title: t('common.error'), description: errorMessage, variant: 'destructive' });
      // Remove empty streaming entry if present
      setTranscript(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.streaming) updated.pop();
        return updated;
      });
    } finally {
      setIsProcessing(false);
      if (isListeningRef.current) { try { recognitionRef.current?.start(); } catch {} }
    }
  };

  // ── PDF / print slides ─────────────────────────────────────────────────────
  const printSlides = () => {
    const lang = meeting?.language ?? 'pt';
    const html = `<!DOCTYPE html>
<html lang="${lang === 'pt' ? 'pt-BR' : lang}">
<head>
  <meta charset="UTF-8">
  <title>${meeting?.title ?? 'APEX Slides'}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Helvetica Neue',Arial,sans-serif;background:#000;color:#fff}
    .slide{width:100vw;height:100vh;display:flex;flex-direction:column;justify-content:center;
           padding:40px 60px;page-break-after:always;background:#000}
    .slide-meta{font-size:10px;color:#00ff41;font-family:monospace;margin-bottom:20px;letter-spacing:2px}
    h1{font-size:36px;font-weight:900;color:#00ff41;margin-bottom:28px;line-height:1.2}
    ul{list-style:none}
    li{font-size:18px;color:#d1d5db;margin-bottom:14px;display:flex;align-items:flex-start;gap:12px}
    li::before{content:'>';color:#00ff41;font-family:monospace;flex-shrink:0;margin-top:3px}
    .notes{margin-top:24px;font-size:11px;color:#6b7280;border-top:1px solid #1f2937;padding-top:12px;font-style:italic}
    @media print{
      body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .slide{page-break-after:always}
    }
  </style>
</head>
<body>
${slides.map((s, i) => `
  <div class="slide">
    <div class="slide-meta">APEX CORE · ${i + 1}/${slides.length}${meeting?.company ? ' · ' + meeting.company : ''}</div>
    <h1>${s.title}</h1>
    <ul>${s.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
    ${s.notes ? `<div class="notes">${s.notes}</div>` : ''}
  </div>`).join('')}
  <script>window.onload=()=>{window.print()}<\/script>
</body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    handleVoiceCommand(manualInput);
    setManualInput('');
  };

  // ── Camera capture ─────────────────────────────────────────────────────────
  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

    setIsProcessing(true);
    try {
      const response = await askApex.mutateAsync({
        meetingId,
        data: { message: t('live.scene.prompt'), sessionId: sessionId || undefined, imageBase64 }
      });
      setTranscript(prev => [...prev, { type: 'ai', message: response.message, timestamp: new Date() }]);
      speakResponse(response.message);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('live.scene.failed');
      toast({ title: t('common.error'), description: errorMessage, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  // ── URL analysis ───────────────────────────────────────────────────────────
  const handleAnalyzeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    let url = urlInput.trim();
    if (!url.startsWith('http')) url = `https://${url}`;

    setIsAnalyzingUrl(true);
    try {
      const result = await apexFetch<{ text: string; title?: string; url: string }>(`/api/meetings/${meetingId}/analyze-url`, { url });
      const domain = new URL(url).hostname;
      setAnalyzedUrl({ url, domain, text: result.text, title: result.title });
      setUrlInput('');
      toast({ title: `✅ URL analisada: ${domain}`, description: `${result.text.length} caracteres extraídos` });
      // Log in execution panel
      setExecutionLog(prev => [...prev, {
        action: `scrape_url(${url})`,
        result: `Extraídos ${result.text.length} caracteres de ${domain}`,
        timestamp: new Date()
      }]);
    } catch (err: any) {
      toast({ title: 'Erro ao analisar URL', description: err.message, variant: 'destructive' });
    } finally {
      setIsAnalyzingUrl(false);
    }
  };

  // ── Document upload ────────────────────────────────────────────────────────
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsIndexingDoc(true);
    try {
      // Read as base64
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = ev => {
          const result = ev.target?.result as string;
          // Strip data URL prefix
          resolve(result.split(',')[1] ?? '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await apexFetch<{ text: string; characterCount: number }>(`/api/meetings/${meetingId}/index-document`, {
        filename: file.name,
        content,
        mimeType: file.type || 'text/plain',
      });

      setIndexedDoc({ name: file.name, text: result.text });
      toast({ title: `📄 Documento indexado: ${file.name}`, description: `${result.characterCount.toLocaleString()} caracteres prontos para uso` });
      setExecutionLog(prev => [...prev, {
        action: `index_document("${file.name}")`,
        result: `${result.characterCount} caracteres indexados com sucesso`,
        timestamp: new Date()
      }]);
    } catch (err: any) {
      toast({ title: 'Erro ao indexar documento', description: err.message, variant: 'destructive' });
    } finally {
      setIsIndexingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Slide generation ───────────────────────────────────────────────────────
  const handleGenerateSlides = async () => {
    if (!indexedDoc) return;
    setIsGeneratingSlides(true);
    try {
      const result = await apexFetch<{ slides: Slide[] }>(`/api/meetings/${meetingId}/generate-slides`, {
        documentText: indexedDoc.text,
        language: meeting?.language || 'pt',
        filename: indexedDoc.name,
      });
      setSlides(result.slides);
      setCurrentSlide(0);
      setPresentationMode(true);
    } catch (err: any) {
      toast({ title: 'Erro ao gerar slides', description: err.message, variant: 'destructive' });
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  // ── End session ────────────────────────────────────────────────────────────
  const handleEndSession = async () => {
    if (!sessionId) return;
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
    micStream?.getTracks().forEach(t => t.stop());

    try {
      await endSession.mutateAsync({
        meetingId,
        sessionId,
        data: {
          status: 'ended',
          endedAt: new Date().toISOString(),
          transcript: JSON.stringify(transcript),
          builtAssets: executionLog.map(e => e.result)
        }
      });
      await queryClient.invalidateQueries({ queryKey: getListMeetingSessionsQueryKey(meetingId) });
      toast({ title: t('live.session.ended') });
      setLocation(`/meetings/${meetingId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('live.session.failEnd');
      toast({ title: t('common.error'), description: errorMessage, variant: 'destructive' });
    }
  };

  // ── Globe state ────────────────────────────────────────────────────────────
  const globeMode = isProcessing
    ? t('live.mode.processing')
    : isSpeaking
    ? t('live.mode.speaking')
    : isListening
    ? t('live.mode.listening')
    : t('live.mode.standby');

  const globeModeColor = isProcessing
    ? 'text-primary'
    : isSpeaking
    ? 'text-cyan-400'
    : isListening
    ? 'text-green-400'
    : 'text-muted-foreground';

  if (!meeting) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-primary font-mono">{t('live.initializing')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black text-foreground relative overflow-hidden">
      {/* Scan lines */}
      <div className="scan-lines fixed inset-0 pointer-events-none z-0" />

      {/* ── Presentation Mode Overlay ─────────────────────────────────────── */}
      {presentationMode && slides.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          {/* Slide header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="font-mono text-sm text-primary tracking-widest">APRESENTAÇÃO · {meeting.aiName}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">
                {currentSlide + 1} / {slides.length}
              </span>
              <Badge variant="outline" className="border-primary/30 text-primary font-mono text-xs">
                {indexedDoc?.name}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setPresentationMode(false); stopSpeaking(); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />ESC
              </Button>
            </div>
          </div>

          {/* Slide body */}
          <div className="flex-1 flex flex-col items-center justify-center px-12 py-8 relative">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              />
            </div>

            <div className="max-w-4xl w-full">
              <h1 className="text-4xl md:text-5xl font-black matrix-text mb-8 leading-tight">
                {slides[currentSlide]?.title}
              </h1>
              <ul className="space-y-4">
                {slides[currentSlide]?.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3 text-lg text-muted-foreground">
                    <span className="text-primary font-mono text-sm mt-1.5 flex-shrink-0">{'>'}</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {slides[currentSlide]?.notes && (
                <p className="mt-8 text-xs text-muted-foreground/50 font-mono border-t border-primary/10 pt-4">
                  {slides[currentSlide]?.notes}
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-8 py-6 border-t border-primary/20">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="border-primary/30 text-primary hover:bg-primary/10 font-mono"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />← Anterior
            </Button>

            {/* Slide dots */}
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentSlide ? 'bg-primary w-6' : 'bg-primary/30'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="border-primary/30 text-primary hover:bg-primary/10 font-mono"
            >
              Próximo →<ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Keyboard hint */}
          <p className="text-center text-xs text-muted-foreground/40 font-mono pb-2">
            ← → para navegar · ESC para fechar · voz lê automaticamente
          </p>
        </div>
      )}

      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-primary/20 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <div>
              <h1 className="text-lg font-bold matrix-text" data-testid="text-meeting-title">{meeting.title}</h1>
              <p className="text-xs text-muted-foreground font-mono">
                {meeting.company} • {t('meeting.aiLabel')}{meeting.aiName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Context badges */}
            {indexedDoc && (
              <Badge
                variant="outline"
                className="bg-cyan-400/10 text-cyan-400 border-cyan-400/30 font-mono text-xs cursor-pointer"
                onClick={() => setIndexedDoc(null)}
                title="Clique para remover"
              >
                <FileText className="w-3 h-3 mr-1" />
                {indexedDoc.name.slice(0, 20)}{indexedDoc.name.length > 20 ? '…' : ''}
                <X className="w-2.5 h-2.5 ml-1" />
              </Badge>
            )}
            {analyzedUrl && (
              <Badge
                variant="outline"
                className="bg-green-400/10 text-green-400 border-green-400/30 font-mono text-xs cursor-pointer"
                onClick={() => setAnalyzedUrl(null)}
                title="Clique para remover"
              >
                <Globe className="w-3 h-3 mr-1" />
                {analyzedUrl.domain}
                <X className="w-2.5 h-2.5 ml-1" />
              </Badge>
            )}

            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono">
              {meeting.language.toUpperCase()}
            </Badge>

            {/* Presentation button */}
            {indexedDoc && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateSlides}
                disabled={isGeneratingSlides}
                className="border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 font-mono text-xs"
              >
                {isGeneratingSlides ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                )}
                Apresentar
              </Button>
            )}
            {slides.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={printSlides}
                className="border-green-400/40 text-green-400 hover:bg-green-400/10 font-mono text-xs"
                title="Baixar slides como PDF"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                PDF
              </Button>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndSession}
              className="terminal-glow"
              data-testid="button-end-session"
            >
              <Power className="w-4 h-4 mr-2" />
              {t('meeting.endSession')}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="pt-28 pb-6 px-6 h-[100dvh] flex gap-6">
        {/* Left Side: Matrix Globe */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative flex flex-col items-center gap-4">
            <MatrixGlobe
              size={600}
              isProcessing={isProcessing}
              isListening={isListening}
              isSpeaking={isSpeaking}
            />

            <div className="flex items-center gap-2">
              {isProcessing && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
              {isSpeaking && <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />}
              {isListening && !isProcessing && !isSpeaking && (
                <Mic className="w-4 h-4 text-green-400 animate-pulse" />
              )}
              <span className={`font-mono text-sm font-bold tracking-widest ${globeModeColor}`}>
                {globeMode}
              </span>
            </div>

            {isListening && (
              <div className="flex flex-col items-center gap-1">
                <AudioWaveform
                  isActive={isListening}
                  stream={micStream}
                  color="#00ff41"
                  height={48}
                  width={320}
                />
                {currentTranscript && (
                  <p className="text-primary font-mono text-xs text-center max-w-xs animate-pulse px-2">
                    "{currentTranscript}"
                  </p>
                )}
              </div>
            )}

            {isSpeaking && (
              <div className="flex items-end gap-[3px] h-12 justify-center">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-cyan-400"
                    style={{
                      height: `${20 + Math.random() * 28}px`,
                      animation: `speaking-bar 0.5s ease-in-out ${(i * 0.05).toFixed(2)}s infinite alternate`,
                      opacity: 0.8
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Controls + Feed */}
        <div className="w-[500px] flex flex-col gap-4 overflow-y-auto">
          {/* Voice Control */}
          <Card className="bg-card/50 border-primary/20 p-5 terminal-glow flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">{t('live.voiceControl')}</h2>
              {isSpeaking && (
                <Badge
                  variant="outline"
                  className="bg-cyan-400/10 text-cyan-400 border-cyan-400/30 cursor-pointer"
                  onClick={stopSpeaking}
                >
                  <VolumeX className="w-3 h-3 mr-1" />
                  {t('live.stop')}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <Button
                onClick={toggleListening}
                className={`flex-1 ${isListening ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'} text-white terminal-glow h-14`}
                data-testid="button-toggle-mic"
                disabled={isProcessing}
              >
                {isListening ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                {isListening ? t('live.stopListening') : t('live.startListening')}
              </Button>
            </div>

            <div className="space-y-2">
              <Textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleManualSubmit();
                  }
                }}
                placeholder={t('live.typePlaceholder')}
                className="bg-background/50 border-primary/30 resize-none font-mono text-sm"
                rows={2}
                data-testid="input-manual-command"
              />
              <Button
                onClick={handleManualSubmit}
                size="sm"
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                disabled={!manualInput.trim() || isProcessing}
                data-testid="button-submit-command"
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('meeting.processing')}</>
                ) : t('live.sendCommand')}
              </Button>
            </div>
          </Card>

          {/* ── URL & Document Context ─────────────────────────────────── */}
          <Card className="bg-card/50 border-primary/20 p-5 terminal-glow flex-shrink-0">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Contexto & Documentos
            </h2>

            {/* URL Analysis */}
            <form onSubmit={handleAnalyzeUrl} className="space-y-2 mb-4">
              <p className="text-xs text-muted-foreground font-mono mb-1">URL EXTERNA</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://empresa.com"
                    className="pl-8 bg-background/50 border-primary/30 font-mono text-xs h-9"
                    disabled={isAnalyzingUrl}
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  disabled={isAnalyzingUrl || !urlInput.trim()}
                  className="border-primary/40 text-primary hover:bg-primary/10 h-9 px-3"
                >
                  {isAnalyzingUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                </Button>
              </div>
              {analyzedUrl && (
                <div className="flex items-center gap-1.5 text-xs text-green-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  {analyzedUrl.domain} · {analyzedUrl.text.length.toLocaleString()} chars
                </div>
              )}
            </form>

            <div className="border-t border-primary/10 pt-4">
              <p className="text-xs text-muted-foreground font-mono mb-2">INDEXAR DOCUMENTO</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,.md,.pdf,.docx"
                onChange={handleDocUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isIndexingDoc}
                className="w-full border-primary/30 text-primary hover:bg-primary/10 font-mono text-xs h-10"
              >
                {isIndexingDoc ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Indexando...</>
                ) : (
                  <><Upload className="w-3.5 h-3.5 mr-2" />PDF · DOCX · TXT · CSV</>
                )}
              </Button>
              {indexedDoc && (
                <div className="flex items-center justify-between mt-2 px-2 py-1.5 rounded bg-cyan-400/5 border border-cyan-400/20">
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[180px]">{indexedDoc.name}</span>
                  </div>
                  <button
                    onClick={() => setIndexedDoc(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground/60 font-mono mt-2">
                O APEX lerá o documento em todos os próximos turnos da sessão.
              </p>
            </div>
          </Card>

          {/* Camera Feed */}
          <Card className="bg-card/50 border-primary/20 p-5 terminal-glow flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">{t('live.cameraFeed')}</h2>
              <Button
                onClick={cameraEnabled ? stopCamera : initCamera}
                size="sm"
                variant={cameraEnabled ? 'destructive' : 'outline'}
                className="border-secondary text-secondary hover:bg-secondary/10"
                data-testid="button-toggle-camera"
              >
                {cameraEnabled ? <VideoOff className="w-4 h-4 mr-2" /> : <Video className="w-4 h-4 mr-2" />}
                {cameraEnabled ? t('live.stop') : t('meeting.startSession')}
              </Button>
            </div>

            {cameraEnabled ? (
              <div className="space-y-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-36 bg-black rounded border border-primary/30 object-cover"
                />
                <Button
                  onClick={captureAndAnalyze}
                  size="sm"
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  disabled={isProcessing}
                  data-testid="button-analyze-scene"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {t('live.analyzeScene')}
                </Button>
              </div>
            ) : (
              <div className="w-full h-28 bg-background/30 rounded border border-primary/30 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">{t('live.cameraDisabled')}</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Bottom Panels ────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 h-56 flex gap-6 px-6 pb-6">
        {/* Execution Log */}
        <Card className="flex-1 bg-card/90 border-primary/20 p-4 terminal-glow overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <TerminalIcon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold font-mono">{t('live.execLog')}</h3>
          </div>
          <div
            ref={execScrollRef}
            className="flex-1 overflow-y-auto space-y-2 font-mono text-xs"
            data-testid="execution-log"
          >
            {executionLog.map((entry, i) => (
              <div key={i} className="bg-background/30 rounded p-2 border border-primary/20">
                <p className="text-primary">&gt; {entry.action}</p>
                <p className="text-secondary">{entry.result}</p>
                <p className="text-muted-foreground text-[10px] mt-1">{entry.timestamp.toLocaleTimeString()}</p>
              </div>
            ))}
            {executionLog.length === 0 && (
              <p className="text-muted-foreground">{t('live.noExecutions')}</p>
            )}
          </div>
        </Card>

        {/* Conversation Transcript */}
        <Card className="flex-1 bg-card/90 border-primary/20 p-4 terminal-glow overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-secondary" />
            <h3 className="text-sm font-bold font-mono">{t('live.transcript')}</h3>
          </div>
          <div
            ref={transcriptScrollRef}
            className="flex-1 overflow-y-auto space-y-3"
            data-testid="transcript"
          >
            {transcript.map((entry, i) => (
              <div key={i} className={`${entry.type === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[80%] rounded p-3 ${entry.type === 'user' ? 'bg-primary/20 text-primary' : 'bg-cyan-400/10 text-cyan-400'}`}>
                  <p className="text-sm whitespace-pre-wrap">
                    {entry.message}
                    {entry.streaming && (
                      <span className="inline-block w-[2px] h-[1em] bg-current ml-0.5 animate-pulse" />
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">{entry.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {transcript.length === 0 && (
              <p className="text-muted-foreground text-sm">{t('live.noConversation')}</p>
            )}
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes speaking-bar {
          from { transform: scaleY(0.3); opacity: 0.5; }
          to   { transform: scaleY(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
}

export default function LiveMeeting() {
  return (
    <ProtectedRoute>
      <LiveMeetingContent />
    </ProtectedRoute>
  );
}
