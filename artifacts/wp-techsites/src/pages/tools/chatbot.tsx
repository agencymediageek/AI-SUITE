import { useState, useRef, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getApiBaseUrl, getWpApiHeaders } from '@/lib/api-headers';
import { Loader2, MessageSquare, Send, Bot, User, Trash2, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

const CHATBOT_MODES = [
  { value: 'support', label: '🎧 Suporte ao Cliente' },
  { value: 'sales', label: '💰 Vendas & Conversão' },
  { value: 'faq', label: '❓ FAQ Automático' },
  { value: 'directory', label: '📍 Guia do Diretório' },
  { value: 'custom', label: '✏️ Personalizado' },
];

const QUICK_PROMPTS = [
  'Quais são os horários de funcionamento?',
  'Como posso fazer uma reserva?',
  'Quais serviços vocês oferecem?',
  'Como chego até vocês?',
];

export default function ChatbotPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Olá! Sou o assistente IA do WP TechSites. Como posso ajudar você a configurar o chatbot do seu site?',
      ts: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('support');
  const [showConfig, setShowConfig] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      role: 'user',
      content: text,
      ts: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build messages array: last 6 history turns + new user message
      const apiMessages = [
        ...messages.slice(-6).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: text },
      ];
      const res = await fetch(`${getApiBaseUrl()}wp/chatbot`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na resposta');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || data.response || data.message || 'Mensagem recebida!',
        ts: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (err: any) {
      // Fallback response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Entendi sua mensagem sobre "${text.slice(0, 50)}". Para configurar o chatbot no seu site, acesse o painel do plugin e ative o módulo Chatbot IA nas configurações.`,
        ts: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <DashboardShell>
      <div className="space-y-4 animate-slide-in-up max-w-3xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Chatbot IA</h1>
            <p className="text-sm text-muted-foreground">
              Configure e teste o chatbot inteligente do seu site — responde dúvidas, converte visitantes em clientes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/30 border">
              <Bot className="w-3 h-3 mr-1" /> IA Ativa
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)}>
              <Settings2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {showConfig && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Configurações do Chatbot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Modo de Operação</label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHATBOT_MODES.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                O modo define o contexto e o tom das respostas do chatbot no seu site WordPress.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Chat window */}
        <Card className="border-primary/10">
          <CardHeader className="pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">WP TechSites Assistant</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Online · {CHATBOT_MODES.find(m2 => m2.value === mode)?.label}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-muted-foreground h-8 w-8 p-0"
                onClick={() => setMessages([{
                  role: 'assistant',
                  content: '👋 Conversa reiniciada. Como posso ajudar?',
                  ts: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                }])}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-[380px] overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn('flex items-start gap-2', msg.role === 'user' ? 'flex-row-reverse' : '')}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                    msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}>
                    {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                    msg.role === 'assistant'
                      ? 'bg-muted/60 text-foreground rounded-tl-sm'
                      : 'bg-primary text-primary-foreground rounded-tr-sm'
                  )}>
                    <p className="leading-relaxed">{msg.content}</p>
                    <p className={cn('text-[10px] mt-1', msg.role === 'assistant' ? 'text-muted-foreground' : 'text-primary-foreground/60')}>
                      {msg.ts}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap border-t border-border pt-2">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => sendMessage(p)}
                  disabled={loading}
                  className="text-xs px-2.5 py-1 rounded-full border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-border flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Digite uma mensagem..."
                disabled={loading}
                className="flex-1 h-9 text-sm"
              />
              <Button type="submit" size="sm" disabled={loading || !input.trim()} className="h-9 px-3">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-primary" /> Como ativar no seu site
            </p>
            <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
              <li>No painel WordPress, acesse WP TechSites → Chatbot IA</li>
              <li>Ative o widget flutuante e configure o modo de operação</li>
              <li>O chatbot aparece automaticamente em todas as páginas</li>
              <li>Monitore as conversas neste painel em tempo real</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
