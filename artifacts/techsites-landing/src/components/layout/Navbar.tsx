import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/context/LangContext';
import { useTheme } from '@/context/ThemeContext';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useLang();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('Home', 'Início'), href: '#' },
    { name: t('Services', 'Serviços'), href: '#portfolio' },
    { name: t('Templates', 'Templates'), href: '#templates' },
    { name: t('Portfolio', 'Portfolio'), href: '#portfolio' },
    { name: t('Pricing', 'Preços'), href: '#pricing' },
    { name: t('Plugin', 'Plugin'), href: '#plugin' },
    { name: t('Help', 'Ajuda'), href: '#help' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-background/90 backdrop-blur-md border-white/10' 
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="text-foreground">TechSites</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
            <button
              onClick={() => setLang('EN')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                lang === 'EN' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('PT')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                lang === 'PT' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              PT
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          <a
            href="https://build.techsites.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-amber-400 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4" />
            {t('AI Builder', 'Builder IA')}
          </a>
          <a 
            href="#download" 
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all duration-300"
          >
            {t('Get Started', 'Começar Agora')}
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-white/10 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  className="text-base font-medium text-foreground py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="h-px bg-white/10 my-2" />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setLang('EN')}
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      lang === 'EN' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLang('PT')}
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      lang === 'PT' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    PT
                  </button>
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-muted"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
              <a 
                href="#download" 
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-lg text-base font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('Get Started', 'Começar Agora')}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
