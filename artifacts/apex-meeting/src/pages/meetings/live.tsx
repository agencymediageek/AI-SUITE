import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { MatrixGlobe } from '@/components/meeting/MatrixGlobe';
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
  VolumeX
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    recognition.lang = meeting?.language === 'pt' ? 'pt-BR' : meeting?.language === 'es' ? 'es-ES' : 'en-US';

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

    recognitionRef.current = recognition;
  }, [meeting?.language]);

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

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleVoiceCommand = async (text: string) => {
    if (!text.trim()) return;

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
          action: response.action, 
          result: response.actionResult, 
          timestamp: new Date() 
        }]);
      }

      // Speak response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.message);
        utterance.lang = meeting?.language === 'pt' ? 'pt-BR' : meeting?.language === 'es' ? 'es-ES' : 'en-US';
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process command';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze scene';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;

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
      toast({ title: 'Session ended' });
      setLocation(`/meetings/${meetingId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end session';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

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
          <div className="relative">
            <MatrixGlobe size={600} isProcessing={isProcessing || isSpeaking} isListening={isListening} />
            {isProcessing && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <p className="text-primary font-mono text-sm animate-pulse">PROCESSING...</p>
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
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
                  <Volume2 className="w-3 h-3 mr-1" />
                  Speaking
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <Button
                onClick={toggleListening}
                className={`flex-1 ${isListening ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'} text-white terminal-glow h-16`}
                data-testid="button-toggle-mic"
              >
                {isListening ? <MicOff className="w-6 h-6 mr-2" /> : <Mic className="w-6 h-6 mr-2" />}
                {isListening ? 'Stop Listening' : 'Start Listening'}
              </Button>
            </div>

            {isListening && currentTranscript && (
              <div className="bg-background/50 border border-primary/30 rounded p-3 mb-4">
                <p className="text-sm text-muted-foreground font-mono">{currentTranscript}</p>
              </div>
            )}

            <div className="space-y-2">
              <Textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Or type your command..."
                className="bg-background/50 border-primary/30 resize-none font-mono text-sm"
                rows={3}
                data-testid="input-manual-command"
              />
              <Button
                onClick={handleManualSubmit}
                size="sm"
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                disabled={!manualInput.trim()}
                data-testid="button-submit-command"
              >
                Send Command
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
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs" data-testid="execution-log">
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
          <div className="flex-1 overflow-y-auto space-y-3" data-testid="transcript">
            {transcript.map((entry, i) => (
              <div key={i} className={`${entry.type === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[80%] rounded p-3 ${entry.type === 'user' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
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
