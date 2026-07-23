"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// ScrollArea replaced with plain div for reliable auto-scroll
import { cn } from "@/lib/utils";
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const STRINGS = {
    pt: {
        title: "Suporte ao Vivo",
        subtitle: (name: string) => `Desenvolvido por ${name}`,
        welcome: (email?: string) =>
            `Olá! Sou seu Assistente de Suporte.${email ? ` (Modo Suporte: ${email})` : ''} Como posso ajudar você hoje?`,
        placeholder: "Digite sua mensagem...",
        thinking: "Assistente digitando...",
        errorConnect: "Desculpe, tive um problema ao conectar com o servidor de suporte.",
        errorTokens: "Você não tem tokens suficientes para usar o suporte.",
    },
    en: {
        title: "Live Support",
        subtitle: (name: string) => `Powered by ${name}`,
        welcome: (email?: string) =>
            `Hello! I'm your Live Support Assistant.${email ? ` (Support Mode: ${email})` : ''} How can I help you today?`,
        placeholder: "Type your message...",
        thinking: "Assistant is thinking...",
        errorConnect: "Sorry, I had trouble connecting to the support server.",
        errorTokens: "You don't have enough tokens to use live support.",
    },
    es: {
        title: "Soporte en Vivo",
        subtitle: (name: string) => `Desarrollado por ${name}`,
        welcome: (email?: string) =>
            `¡Hola! Soy tu Asistente de Soporte.${email ? ` (Modo Soporte: ${email})` : ''} ¿En qué puedo ayudarte hoy?`,
        placeholder: "Escribe tu mensaje...",
        thinking: "El asistente está escribiendo...",
        errorConnect: "Lo siento, tuve un problema al conectar con el servidor de soporte.",
        errorTokens: "No tienes suficientes tokens para usar el soporte en vivo.",
    },
};

function getLang(locale: string) {
    if (locale?.startsWith('pt')) return 'pt';
    if (locale?.startsWith('es')) return 'es';
    return 'en';
}

export default function ChatWidget({ embedded = false, supportEmail }: { embedded?: boolean; supportEmail?: string }) {
    const { settings } = useSettings();
    const { locale } = useLanguage();
    const lang = getLang(locale);
    const s = STRINGS[lang];

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: s.welcome(supportEmail) }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Sync welcome message when language changes
    useEffect(() => {
        setMessages(prev => {
            if (prev.length === 1 && prev[0].role === 'assistant') {
                return [{ role: 'assistant', content: s.welcome(supportEmail) }];
            }
            return prev;
        });
    }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-scroll to bottom on every new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            // Build history: all messages except the welcome (index 0)
            const history = messages.slice(1).map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await fetch('/api/chat/rag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMsg, supportEmail, history })
            });

            const data = await response.json();

            if (data.error) {
                const msg = data.error.toLowerCase().includes('token')
                    ? s.errorTokens
                    : data.error;
                setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: s.errorConnect }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen && !embedded) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 rounded-full shadow-2xl bg-teal-600 hover:bg-teal-700 transition-all duration-300 z-[9999]"
                aria-label={s.title}
            >
                <MessageSquare className="h-6 w-6 text-white" />
            </Button>
        );
    }

    return (
        <div className={cn(
            "flex flex-col bg-background/95 backdrop-blur-md border border-border shadow-2xl transition-all duration-300 overflow-hidden",
            embedded
                ? "w-full h-full"
                : "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100dvh-6rem)] sm:h-[600px] max-h-[85vh] sm:max-h-[600px] rounded-2xl z-[9999]"
        )}>
            {/* Header */}
            <div className="p-4 border-b bg-teal-600 flex items-center justify-between text-white flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">{s.title}</h3>
                        <p className="text-[10px] opacity-80">
                            {s.subtitle(settings?.metadata?.siteName || "AI Suite")}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        if (embedded) {
                            window.parent.postMessage('close-chat-widget', '*');
                        } else {
                            setIsOpen(false);
                        }
                    }}
                    className="text-white hover:bg-white/10"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={cn(
                            "flex items-start gap-2",
                            m.role === 'user' ? "flex-row-reverse" : ""
                        )}>
                            <div className={cn(
                                "p-2 rounded-lg text-sm max-w-[80%]",
                                m.role === 'user'
                                    ? "bg-teal-600 text-white rounded-tr-none"
                                    : "bg-muted rounded-tl-none border border-border"
                            )}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground text-xs italic">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            {s.thinking}
                        </div>
                    )}
                    {/* Scroll anchor */}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-muted/30 flex-shrink-0">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                >
                    <Input
                        placeholder={s.placeholder}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="bg-background border-border"
                    />
                    <Button type="submit" size="icon" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
