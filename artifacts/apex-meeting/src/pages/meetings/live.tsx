import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { MatrixGlobe } from '@/components/meeting/MatrixGlobe';
import { AudioWaveform } from '@/components/meeting/AudioWaveform';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Loader2
} from 'lucide-react';

interface TranscriptEntry {
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

interface ExecutionEntry {
  action: string;
  result: string;
  timestamp: Date;
}

/** Pick the best available voice for the given lang tag, prefer neural/natural voices */
function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const tag = lang.toLowerCase();
  const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(tag.slice(0, 2)));

  // Prefer Google/Microsoft neural voices
  const preferred = langVoices.find(v => /google|microsoft|neural/i.test(v.name));
  return preferred ?? langVoices[0] ?? null;
}

function LiveMeetingContent() {
  const params = useParams();
  const meetingId = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: meeting } = useGetMeeting(meetingId, {
    query: { enabled: !!meetingId, queryKey: getGetMeetingQueryKey(meetingId) }
  });

  const startSession = useStartMeetingSession();
  const endSession = useEndMeetingSession();
  const askApex = useAskApex();

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const execScrollRef = useRef<HTMLDivElement>(null);

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
        toast({ title: 'Session started', description: 'APEX CORE is now active' });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to start session';
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      }
    };

    initSession();
  }, [meetingId, sessionId, startSession, toast]);

  // Initialize Web Speech API
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({ 
        title: 'Voice not supported', 
        description: 'Your browser does not support voice recognition',
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
      // Auto-restart if still meant to be listening
      setIsListening(prev => {
        if (prev) {
          try { recognition.start(); } catch {}
        }
        return prev;
      });
    };

    recognitionRef.current = recognition;
  }, [speechLang]);

  // Cleanup mic stream on unmount
  useEffect(() => {
    return () => {
      micStream?.getTracks().forEach(t => t.stop());
      window.speechSynthesis.cancel();
    };
  }, []);

  // Initialize camera
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraEnabled(true);
      toast({ title: 'Camera enabled', description: 'APEX CORE can now see your feed' });
    } catch (error) {
      toast({ title: 'Camera error', description: 'Failed to access camera', variant: 'destructive' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
  };

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      // Stop and release mic stream
      micStream?.getTracks().forEach(t => t.stop());
      setMicStream(null);
    } else {
      try {
        // Request mic access for waveform visualization
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStream(stream);
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        toast({ title: 'Mic error', description: 'Could not access microphone', variant: 'destructive' });
      }
    }
  };

  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to assign a good voice (voices may not be loaded yet — retry once)
    const assignVoice = () => {
      const voice = pickVoice(speechLang);
      if (voice) utterance.voice = voice;
    };
    assignVoice();
    if (!utterance.voice) {
      window.speechSynthesis.addEventListener('voiceschanged', assignVoice, { once: true });
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleVoiceCommand = async (text: string) => {
    if (!text.trim()) return;

    // Pause recognition while processing to avoid picking up the AI's own voice
    if (isListening) recognitionRef.current?.stop();

    setTranscript(prev => [...prev, { type: 'user', message: text, timestamp: new Date() }]);
    setIsProcessing(true);

    try {
      const response = await askApex.mutateAsync({
        meetingId,
        data: { message: text, sessionId: sessionId || undefined }
      });

      setTranscript(prev => [...prev, { type: 'ai', message: response.message, timestamp: new Date() }]);

      if (response.action && response.actionResult) {
        setExecutionLog(prev => [...prev, { 
          action: response.action ?? '', 
          result: response.actionResult ?? '', 
          timestamp: new Date() 
        }]);
      }

      // Speak the AI response out loud
      speakResponse(response.message);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process command';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
      // Resume recognition if still in listening mode
      if (isListening) {
        try { recognitionRef.current?.start(); } catch {}
      }
    }
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    handleVoiceCommand(manualInput);
    setManualInput('');
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

    setIsProcessing(true);
    try {
      const response = await askApex.mutateAsync({
        meetingId,
        data: { 
          message: 'Analyze this scene and describe what you see', 
          sessionId: sessionId || undefined,
          imageBase64
        }
      });

      setTranscript(prev => [...prev, { type: 'ai', message: response.message, timestamp: new Date() }]);
      speakResponse(response.message);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze scene';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;

    // Stop any ongoing speech and mic
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
          builtAssets: executionLog.map(e => e.result).join('\n')
        }
      });
      await queryClient.invalidateQueries({ queryKey: getListMeetingSessionsQueryKey(meetingId) });
      toast({ title: 'Session ended' });
      setLocation(`/meetings/${meetingId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end session';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  // Globe mode label
  const globeMode = isProcessing
    ? 'PROCESSING'
    : isSpeaking
    ? 'SPEAKING'
    : isListening
    ? 'LISTENING'
    : 'STANDBY';

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
          <p className="text-primary font-mono">Initializing APEX CORE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black text-foreground relative overflow-hidden">
      {/* Scan lines */}
      <div className="scan-lines fixed inset-0 pointer-events-none z-0" />

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-primary/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <div>
              <h1 className="text-lg font-bold matrix-text" data-testid="text-meeting-title">{meeting.title}</h1>
              <p className="text-xs text-muted-foreground font-mono">
                {meeting.company} • AI: {meeting.aiName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono">
              {meeting.language.toUpperCase()}
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndSession}
              className="terminal-glow"
              data-testid="button-end-session"
            >
              <Power className="w-4 h-4 mr-2" />
              End Session
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-6 px-6 h-[100dvh] flex gap-6">
        {/* Left Side: Matrix Globe */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative flex flex-col items-center gap-4">
            <MatrixGlobe
              size={600}
              isProcessing={isProcessing}
              isListening={isListening}
              isSpeaking={isSpeaking}
            />

            {/* Globe mode indicator */}
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

            {/* Waveform when listening */}
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

            {/* Waveform-style animation while speaking */}
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
        <div className="w-[500px] flex flex-col gap-6">
          {/* Voice Control */}
          <Card className="bg-card/50 border-primary/20 p-6 terminal-glow flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Voice Control</h2>
              {isSpeaking && (
                <Badge
                  variant="outline"
                  className="bg-cyan-400/10 text-cyan-400 border-cyan-400/30 cursor-pointer"
                  onClick={stopSpeaking}
                >
                  <VolumeX className="w-3 h-3 mr-1" />
                  Stop
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <Button
                onClick={toggleListening}
                className={`flex-1 ${isListening ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'} text-white terminal-glow h-16`}
                data-testid="button-toggle-mic"
                disabled={isProcessing}
              >
                {isListening ? <MicOff className="w-6 h-6 mr-2" /> : <Mic className="w-6 h-6 mr-2" />}
                {isListening ? 'Stop Listening' : 'Start Listening'}
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
                placeholder="Or type your command… (Ctrl+Enter to send)"
                className="bg-background/50 border-primary/30 resize-none font-mono text-sm"
                rows={3}
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
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing…
                  </>
                ) : (
                  'Send Command'
                )}
              </Button>
            </div>
          </Card>

          {/* Camera Feed */}
          <Card className="bg-card/50 border-primary/20 p-6 terminal-glow flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Camera Feed</h2>
              <Button
                onClick={cameraEnabled ? stopCamera : initCamera}
                size="sm"
                variant={cameraEnabled ? 'destructive' : 'outline'}
                className="border-secondary text-secondary hover:bg-secondary/10"
                data-testid="button-toggle-camera"
              >
                {cameraEnabled ? <VideoOff className="w-4 h-4 mr-2" /> : <Video className="w-4 h-4 mr-2" />}
                {cameraEnabled ? 'Stop' : 'Start'}
              </Button>
            </div>

            {cameraEnabled ? (
              <div className="space-y-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-48 bg-black rounded border border-primary/30 object-cover"
                />
                <Button
                  onClick={captureAndAnalyze}
                  size="sm"
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  disabled={isProcessing}
                  data-testid="button-analyze-scene"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Analyze Scene
                </Button>
              </div>
            ) : (
              <div className="w-full h-48 bg-background/30 rounded border border-primary/30 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Camera disabled</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom Panels */}
      <div className="fixed bottom-0 left-0 right-0 h-64 flex gap-6 px-6 pb-6">
        {/* Execution Log */}
        <Card className="flex-1 bg-card/90 border-primary/20 p-4 terminal-glow overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <TerminalIcon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold font-mono">EXECUTION LOG</h3>
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
                <p className="text-muted-foreground text-[10px] mt-1">
                  {entry.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
            {executionLog.length === 0 && (
              <p className="text-muted-foreground">No executions yet. Start speaking commands...</p>
            )}
          </div>
        </Card>

        {/* Conversation Transcript */}
        <Card className="flex-1 bg-card/90 border-primary/20 p-4 terminal-glow overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-secondary" />
            <h3 className="text-sm font-bold font-mono">TRANSCRIPT</h3>
          </div>
          <div
            ref={transcriptScrollRef}
            className="flex-1 overflow-y-auto space-y-3"
            data-testid="transcript"
          >
            {transcript.map((entry, i) => (
              <div key={i} className={`${entry.type === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[80%] rounded p-3 ${entry.type === 'user' ? 'bg-primary/20 text-primary' : 'bg-cyan-400/10 text-cyan-400'}`}>
                  <p className="text-sm">{entry.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {entry.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {transcript.length === 0 && (
              <p className="text-muted-foreground text-sm">No conversation yet. Start speaking...</p>
            )}
          </div>
        </Card>
      </div>

      {/* Speaking bar keyframe — injected inline for simplicity */}
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
