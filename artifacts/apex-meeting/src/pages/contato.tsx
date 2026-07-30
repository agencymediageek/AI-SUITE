import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToTop } from '@/components/ui/back-to-top';
import { Navbar } from '@/components/layout/Navbar';
import { CheckCircle2, Mail } from 'lucide-react';
import { LandingFooter } from '@/pages/landing';
import { useI18n } from '@/lib/i18n';

type FormState = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

export default function Contato() {
  const { t } = useI18n();
  const [form, setForm] = useState<FormState>({ name: '', email: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1000);
  };

  const topics = [
    { value: 'suporte',   label: t('contato.topic.support') },
    { value: 'vendas',    label: t('contato.topic.sales') },
    { value: 'parceria',  label: t('contato.topic.partner') },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <Navbar />
      <div className="scan-lines fixed inset-0 pointer-events-none z-0" />

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
            <span className="text-xs font-mono text-primary tracking-widest uppercase">{t('contato.badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 text-foreground">
            {t('contato.title1')} <span className="matrix-text">{t('contato.title2')}</span>
          </h1>
          <p className="text-lg text-muted-foreground">{t('contato.subtitle')}</p>
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
              <h2 className="text-2xl font-bold text-foreground mb-3">{t('contato.success.title')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('contato.success.text')} <strong>{form.email}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                {t('contato.success.urgent')}{' '}
                <a href="mailto:contato@techsites.ai" className="text-primary hover:underline">
                  contato@techsites.ai
                </a>
              </p>
            </Card>
          ) : (
            <Card className="bg-card/50 border-primary/20 p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('contato.name')}</label>
                  <input
                    type="text" name="name" required value={form.name} onChange={handleChange}
                    placeholder={t('contato.name')}
                    className="w-full px-4 py-2.5 rounded-lg border border-primary/20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('contato.email')}</label>
                  <input
                    type="email" name="email" required value={form.email} onChange={handleChange}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-primary/20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('contato.topic')}</label>
                  <select
                    name="topic" required value={form.topic} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-primary/20 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  >
                    <option value="">{t('contato.topicDefault')}</option>
                    {topics.map((tp) => (
                      <option key={tp.value} value={tp.value}>{tp.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('contato.message')}</label>
                  <textarea
                    name="message" required value={form.message} onChange={handleChange}
                    placeholder={t('contato.messagePlaceholder')} rows={5}
                    className="w-full px-4 py-2.5 rounded-lg border border-primary/20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
                  />
                </div>

                <Button
                  type="submit" disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow"
                >
                  {loading ? t('contato.sending') : t('contato.send')}
                </Button>
              </form>

              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>{t('contato.orWrite')}</span>
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
