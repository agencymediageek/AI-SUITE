import { useLang } from '@/context/LangContext';
import { MessageCircle } from 'lucide-react';

export function ChatbotCTA() {
  const { t } = useLang();

  return (
    <section id="chatbot" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 via-card to-card border border-primary/30 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t('Talk to our AI right now.', 'Fale com nossa IA agora mesmo.')}
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t(
              'Ask anything about your WordPress site. Our chatbot will show you exactly what TechSites AI can do for your business.',
              'Pergunte qualquer coisa sobre seu site WordPress. Nosso chatbot vai mostrar exatamente o que o TechSites AI pode fazer pelo seu negócio.'
            )}
          </p>

          <a
            href="#chat"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5" />
            {t('Open AI Chat', 'Abrir Chat com IA')}
          </a>
        </div>
      </div>
    </section>
  );
}
