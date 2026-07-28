import { useLang } from '@/context/LangContext';

export function Footer() {
  const { t } = useLang();

  const links = [
    { name: t('Home', 'Início'), href: '#' },
    { name: t('Plugin', 'Plugin'), href: '#plugin' },
    { name: t('Pricing', 'Preços'), href: '#pricing' },
    { name: t('How it works', 'Como Funciona'), href: '#how-it-works' },
  ];

  return (
    <footer id="help" className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold text-white mb-2">TechSites</div>
            <div className="text-sm text-muted-foreground">
              {t('Powered by MediaGeek', 'Powered by MediaGeek')}
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          {t('© 2025 TechSites AI. All rights reserved.', '© 2025 TechSites AI. Todos os direitos reservados.')}
        </div>
      </div>
    </footer>
  );
}
