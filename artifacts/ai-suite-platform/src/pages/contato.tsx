import { PublicLayout } from "@/components/layout/public-layout";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Send, CheckCircle, Clock, HeadphonesIcon } from "lucide-react";

export default function Contato() {
  const { locale } = useI18n();
  const isPt = locale === "pt";

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission (in production connect to your email/CRM)
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: isPt ? "E-mail" : "Email",
      value: "suporte@mediageek.io",
      desc: isPt ? "Respondemos em até 24h úteis" : "We respond within 24 business hours",
    },
    {
      icon: MessageSquare,
      title: isPt ? "Chat com IA" : "AI Chat",
      value: isPt ? "Disponível agora" : "Available now",
      desc: isPt ? "Clique no ícone de chat no canto inferior direito" : "Click the chat icon in the bottom right corner",
    },
    {
      icon: Clock,
      title: isPt ? "Horário de Suporte" : "Support Hours",
      value: isPt ? "Seg–Sex, 9h–18h (BRT)" : "Mon–Fri, 9am–6pm (BRT)",
      desc: isPt ? "IA disponível 24/7" : "AI available 24/7",
    },
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-20 pb-12 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6">
            <HeadphonesIcon className="w-4 h-4" />
            {isPt ? "Suporte" : "Support"}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
            {isPt ? (
              <>Fale com a <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">nossa equipe</span></>
            ) : (
              <>Talk to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">our team</span></>
            )}
          </h1>
          <p className="text-lg text-muted-foreground">
            {isPt
              ? "Tem dúvidas, sugestões ou precisa de suporte? Estamos aqui para ajudar."
              : "Have questions, suggestions, or need support? We're here to help."}
          </p>
        </div>
      </section>

      <section className="py-8 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-5">
              {contactInfo.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="p-5 rounded-xl bg-card border border-border/50 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-0.5">{item.title}</p>
                      <p className="text-sm text-primary font-medium">{item.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </div>
                );
              })}

              <div className="p-5 rounded-xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-primary/20">
                <p className="text-sm font-semibold mb-2">
                  {isPt ? "💡 Dica rápida" : "💡 Quick tip"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isPt
                    ? "Para problemas técnicos urgentes, use o chat de IA na plataforma — ele tem acesso ao status do sistema e pode resolver a maioria dos problemas na hora."
                    : "For urgent technical issues, use the AI chat on the platform — it has access to system status and can resolve most issues on the spot."}
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="p-6 md:p-8 rounded-2xl bg-card border border-border/50">
                {sent ? (
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">
                      {isPt ? "Mensagem enviada!" : "Message sent!"}
                    </h3>
                    <p className="text-muted-foreground max-w-sm">
                      {isPt
                        ? "Recebemos sua mensagem e responderemos em até 24 horas úteis. Obrigado pelo contato!"
                        : "We received your message and will respond within 24 business hours. Thank you for reaching out!"}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                          {isPt ? "Seu nome" : "Your name"} <span className="text-destructive">*</span>
                        </label>
                        <Input
                          required
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          placeholder={isPt ? "João Silva" : "John Doe"}
                          className="bg-background border-border/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                          {isPt ? "E-mail" : "Email"} <span className="text-destructive">*</span>
                        </label>
                        <Input
                          required
                          type="email"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          placeholder="joao@empresa.com"
                          className="bg-background border-border/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        {isPt ? "Assunto" : "Subject"} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        required
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        placeholder={isPt ? "Ex: Dúvida sobre o plano Pro" : "E.g. Question about the Pro plan"}
                        className="bg-background border-border/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        {isPt ? "Mensagem" : "Message"} <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        required
                        rows={6}
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        placeholder={isPt ? "Descreva sua dúvida ou solicitação em detalhes..." : "Describe your question or request in detail..."}
                        className="bg-background border-border/50 resize-none"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {isPt ? "Enviando..." : "Sending..."}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          {isPt ? "Enviar Mensagem" : "Send Message"}
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
