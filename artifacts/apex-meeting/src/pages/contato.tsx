import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToTop } from '@/components/ui/back-to-top';
import { Navbar } from '@/components/layout/Navbar';
import { CheckCircle2, Mail, MessageSquare, Users, Handshake } from 'lucide-react';
import { LandingFooter } from '@/pages/landing';

type FormState = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

export default function Contato() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  const topics = [
    { value: 'suporte', label: 'Suporte técnico', icon: MessageSquare },
    { value: 'vendas', label: 'Vendas / Planos', icon: Users },
    { value: 'parceria', label: 'Parceria', icon: Handshake },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <Navbar />
      <div className="scan-lines fixed inset-0 pointer-events-none z-0" />

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
            <span className="text-xs font-mono text-primary tracking-widest uppercase">Contato</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 text-foreground">
            Fale com a <span className="matrix-text">equipe</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Responderemos em até 24h úteis. Para vendas e parcerias, geralmente respondemos mais rápido.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-xl">
          {submitted ? (
            <Card className="bg-card/60 border-primary/30 p-10 text-center terminal-glow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Mensagem enviada!</h2>
              <p className="text-muted-foreground mb-6">
                Recebemos sua mensagem. Retornaremos em breve pelo email <strong>{form.email}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                Em caso de urgência:{' '}
                <a href="mailto:contato@techsites.ai" className="text-primary hover:underline">
                  contato@techsites.ai
                </a>
              </p>
            </Card>
          ) : (
            <Card className="bg-card/50 border-primary/20 p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nome completo</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    className="w-full px-4 py-2.5 rounded-lg border border-primary/20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-primary/20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Assunto</label>
                  <select
                    name="topic"
                    required
                    value={form.topic}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-primary/20 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  >
                    <option value="">Selecione um assunto</option>
                    {topics.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Mensagem</label>
                  <textarea
                    name="message"
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Descreva sua dúvida ou necessidade..."
                    rows={5}
                    className="w-full px-4 py-2.5 rounded-lg border border-primary/20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow"
                >
                  {loading ? 'Enviando...' : 'Enviar mensagem'}
                </Button>
              </form>

              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>Ou escreva diretamente para </span>
                <a href="mailto:contato@techsites.ai" className="text-primary hover:underline">
                  contato@techsites.ai
                </a>
              </div>
            </Card>
          )}
        </div>
      </section>

      <LandingFooter />
      <BackToTop />
    </div>
  );
}
