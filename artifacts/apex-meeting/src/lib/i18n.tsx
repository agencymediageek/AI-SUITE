import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'es';

interface Translations {
  [key: string]: {
    pt: string;
    en: string;
    es: string;
  };
}

const translations: Translations = {
  'nav.home': { pt: 'Início', en: 'Home', es: 'Inicio' },
  'nav.dashboard': { pt: 'Painel', en: 'Dashboard', es: 'Panel' },
  'nav.meetings': { pt: 'Reuniões', en: 'Meetings', es: 'Reuniones' },
  'nav.pricing': { pt: 'Planos', en: 'Pricing', es: 'Precios' },
  'nav.settings': { pt: 'Configurações', en: 'Settings', es: 'Configuración' },
  'nav.admin': { pt: 'Admin', en: 'Admin', es: 'Admin' },
  'nav.logout': { pt: 'Sair', en: 'Logout', es: 'Salir' },
  'nav.login': { pt: 'Entrar', en: 'Login', es: 'Entrar' },
  'nav.register': { pt: 'Criar Conta', en: 'Sign Up', es: 'Registrarse' },
  'hero.title': { pt: 'IA que executa enquanto você fala', en: 'AI that executes while you speak', es: 'IA que ejecuta mientras hablas' },
  'hero.subtitle': { pt: 'APEX CORE não apenas assiste reuniões — ele constrói sites, publica documentos e configura infraestrutura antes da reunião terminar.', en: 'APEX CORE doesn\'t just attend meetings — it builds websites, publishes documents, and configures infrastructure before the meeting ends.', es: 'APEX CORE no solo asiste a reuniones — construye sitios web, publica documentos y configura infraestructura antes de que termine la reunión.' },
  'hero.cta': { pt: 'Iniciar Sessão', en: 'Start Session', es: 'Iniciar Sesión' },
  'hero.demo': { pt: 'Ver Demo', en: 'Watch Demo', es: 'Ver Demo' },
  'login.title': { pt: 'Acesse APEX CORE', en: 'Access APEX CORE', es: 'Acceda a APEX CORE' },
  'login.email': { pt: 'Email', en: 'Email', es: 'Correo electrónico' },
  'login.password': { pt: 'Senha', en: 'Password', es: 'Contraseña' },
  'login.submit': { pt: 'Entrar', en: 'Login', es: 'Entrar' },
  'login.noAccount': { pt: 'Não tem conta?', en: 'No account?', es: '¿No tienes cuenta?' },
  'login.signUp': { pt: 'Criar agora', en: 'Create now', es: 'Crear ahora' },
  'register.title': { pt: 'Criar Conta APEX CORE', en: 'Create APEX CORE Account', es: 'Crear Cuenta APEX CORE' },
  'register.name': { pt: 'Nome completo', en: 'Full name', es: 'Nombre completo' },
  'register.submit': { pt: 'Criar Conta', en: 'Create Account', es: 'Crear Cuenta' },
  'register.hasAccount': { pt: 'Já tem conta?', en: 'Already have an account?', es: '¿Ya tienes cuenta?' },
  'register.signIn': { pt: 'Entrar', en: 'Sign in', es: 'Entrar' },
  'dashboard.title': { pt: 'Centro de Comando', en: 'Command Center', es: 'Centro de Comando' },
  'dashboard.newMeeting': { pt: 'Nova Reunião', en: 'New Meeting', es: 'Nueva Reunión' },
  'dashboard.meetings': { pt: 'Suas Reuniões', en: 'Your Meetings', es: 'Tus Reuniones' },
  'dashboard.overview': { pt: 'Visão Geral', en: 'Overview', es: 'Resumen' },
  'dashboard.totalMeetings': { pt: 'Total de Reuniões', en: 'Total Meetings', es: 'Reuniones Totales' },
  'dashboard.totalSessions': { pt: 'Sessões Realizadas', en: 'Sessions Completed', es: 'Sesiones Completadas' },
  'dashboard.activeSessions': { pt: 'Sessões Ativas', en: 'Active Sessions', es: 'Sesiones Activas' },
  'dashboard.avgDuration': { pt: 'Duração Média', en: 'Avg Duration', es: 'Duración Media' },
  'meeting.startSession': { pt: 'Iniciar Sessão', en: 'Start Session', es: 'Iniciar Sesión' },
  'meeting.endSession': { pt: 'Encerrar Sessão', en: 'End Session', es: 'Finalizar Sesión' },
  'meeting.configure': { pt: 'Configurar', en: 'Configure', es: 'Configurar' },
  'meeting.delete': { pt: 'Excluir', en: 'Delete', es: 'Eliminar' },
  'meeting.sessions': { pt: 'Sessões', en: 'Sessions', es: 'Sesiones' },
  'settings.title': { pt: 'Configurações', en: 'Settings', es: 'Configuración' },
  'settings.whiteLabel': { pt: 'White Label', en: 'White Label', es: 'Marca Blanca' },
  'settings.aiName': { pt: 'Nome da IA', en: 'AI Name', es: 'Nombre de la IA' },
  'settings.save': { pt: 'Salvar', en: 'Save', es: 'Guardar' },
};

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('apex_language');
    return (stored as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('apex_language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
