import { useLang } from '@/context/LangContext';

export function Footer() {
  const { t } = useLang();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: t('Plugin', 'Plugin'), href: '#plugin' },
        { name: t('Templates', 'Templates'), href: '#templates' },
        { name: t('Hosting', 'Hospedagem'), href: '#pricing' },
        { name: t('Portfolio', 'Portfolio'), href: '#portfolio' },
      ],
    },
    {
      title: 'Services',
      links: [
        { name: t('Site Builds', 'Construção de Sites'), href: '#portfolio' },
        { name: 'SEO', href: '#plugin' },
        { name: t('AI Chatbot', 'Chatbot IA'), href: '#plugin' },
        { name: 'WhatsApp', href: '#plugin' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: t('About', 'Sobre'), href: '#' },
        { name: 'ThemeForest', href: '#templates' },
        { name: 'Blog', href: '#' },
        { name: t('Contact', 'Contato'), href: '#help' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: t('Privacy', 'Privacidade'), href: '#' },
        { name: t('Terms', 'Termos'), href: '#' },
        { name: 'Cookies', href: '#' },
      ],
    },
  ];

  return (
    <footer id="help" className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-6">
        {/* Top Section */}
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Logo + Brand */}
          <div className="md:col-span-1">
            <div className="text-2xl font-bold text-white mb-2">TechSites</div>
            <div className="text-sm text-muted-foreground">
              {t('Powered by MediaGeek', 'Powered by MediaGeek')}
            </div>
          </div>

          {/* Footer Columns */}
          {footerSections.map((section, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          {t('© 2025 TechSites AI. All rights reserved.', '© 2025 TechSites AI. Todos os direitos reservados.')}
          {' | '}
          {t('Powered by MediaGeek', 'Powered by MediaGeek')}
        </div>
      </div>
    </footer>
  );
}
