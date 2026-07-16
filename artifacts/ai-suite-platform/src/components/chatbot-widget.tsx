import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { t, locale } = useI18n();
  const { token } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add welcome message when first opened
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: t("chatbot.welcome"),
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Lang": locale,
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          lang: locale,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const reply = data.reply || data.content || data.text || "...";

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "_a", role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "_e", role: "assistant", content: t("chatbot.error") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
            style={{ height: "480px" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm leading-none">{t("chatbot.title")}</p>
                  <p className="text-white/70 text-xs mt-0.5">{t("chatbot.subtitle")}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t("chatbot.thinking")}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-background/50">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={t("chatbot.placeholder")}
                  className="flex-1 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary text-sm"
                  disabled={loading}
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="shrink-0 rounded-xl"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 flex items-center justify-center text-white relative"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
        )}
      </motion.button>
    </div>
  );
}
