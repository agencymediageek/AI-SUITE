import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'EN' | 'PT';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string, pt: string) => string;
}

export const LangContext = createContext<LangContextType>({
  lang: 'EN',
  setLang: () => {},
  t: (en) => en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('EN');
  const t = (en: string, pt: string) => (lang === 'EN' ? en : pt);
  
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
