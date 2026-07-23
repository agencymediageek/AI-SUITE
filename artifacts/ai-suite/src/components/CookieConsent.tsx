"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Cookie, X, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

type ConsentLevel = "all" | "essential" | "custom" | null;

interface CookiePrefs {
  essential: boolean; // always true
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = "mg_cookie_consent";

const labels = {
  en: {
    title: "We use cookies 🍪",
    description:
      "We use cookies to keep you logged in, remember your preferences, and improve the platform. You can choose what to accept.",
    acceptAll: "Accept All",
    essentialOnly: "Essential Only",
    customize: "Customize",
    save: "Save preferences",
    essential: "Essential",
    essentialDesc: "Required for the platform to work (login, language, theme). Cannot be disabled.",
    analytics: "Analytics",
    analyticsDesc: "Anonymous usage stats that help us improve MediaGeek A.I.",
    marketing: "Marketing",
    marketingDesc: "Used for A/B tests and referral tracking.",
    learnMore: "Cookie Policy",
  },
  pt: {
    title: "Usamos cookies 🍪",
    description:
      "Usamos cookies para mantê-lo conectado, lembrar suas preferências e melhorar a plataforma. Você pode escolher o que aceitar.",
    acceptAll: "Aceitar Todos",
    essentialOnly: "Somente Essenciais",
    customize: "Personalizar",
    save: "Salvar preferências",
    essential: "Essenciais",
    essentialDesc: "Necessários para o funcionamento da plataforma (login, idioma, tema). Não podem ser desativados.",
    analytics: "Analíticos",
    analyticsDesc: "Estatísticas anônimas de uso que nos ajudam a melhorar a MediaGeek A.I.",
    marketing: "Marketing",
    marketingDesc: "Usados para testes A/B e rastreamento de referências.",
    learnMore: "Política de Cookies",
  },
  es: {
    title: "Usamos cookies 🍪",
    description:
      "Usamos cookies para mantenerle conectado, recordar sus preferencias y mejorar la plataforma. Puede elegir qué aceptar.",
    acceptAll: "Aceptar Todo",
    essentialOnly: "Solo Esenciales",
    customize: "Personalizar",
    save: "Guardar preferencias",
    essential: "Esenciales",
    essentialDesc: "Necesarias para el funcionamiento de la plataforma (inicio de sesión, idioma, tema). No se pueden deshabilitar.",
    analytics: "Analíticas",
    analyticsDesc: "Estadísticas anónimas de uso que nos ayudan a mejorar MediaGeek A.I.",
    marketing: "Marketing",
    marketingDesc: "Utilizadas para pruebas A/B y seguimiento de referidos.",
    learnMore: "Política de Cookies",
  },
};

export function CookieConsent() {
  const { currentLanguage } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>({
    essential: true,
    analytics: true,
    marketing: false,
  });

  const lang = (currentLanguage?.code?.toLowerCase?.() || "en") as "en" | "pt" | "es";
  const L = labels[lang] ?? labels["en"];

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Delay banner by 1s so page loads first
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const save = (level: ConsentLevel, customPrefs?: CookiePrefs) => {
    const final: CookiePrefs =
      level === "all"
        ? { essential: true, analytics: true, marketing: true }
        : level === "essential"
        ? { essential: true, analytics: false, marketing: false }
        : customPrefs ?? prefs;

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ level, prefs: final, date: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 flex justify-center pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/20"
        style={{ animation: "slideUpFade 0.4s ease-out" }}
      >
        {/* Main row */}
        <div className="p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary flex-shrink-0 mt-0.5">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-base mb-1">{L.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {L.description}{" "}
                <Link href="/cookies" className="text-primary hover:underline inline-block">
                  {L.learnMore}
                </Link>
              </p>
            </div>
            <button
              onClick={() => save("essential")}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Expand / collapse customization */}
          {expanded && (
            <div className="mt-5 space-y-3 border-t border-border/40 pt-4">
              {/* Essential */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{L.essential}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{L.essentialDesc}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-10 h-5 rounded-full bg-primary/40 flex items-center justify-end px-0.5 cursor-not-allowed opacity-60">
                    <div className="w-4 h-4 rounded-full bg-primary" />
                  </div>
                </div>
              </div>
              {/* Analytics */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{L.analytics}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{L.analyticsDesc}</p>
                </div>
                <button
                  onClick={() => setPrefs((p) => ({ ...p, analytics: !p.analytics }))}
                  className={`flex-shrink-0 w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                    prefs.analytics ? "bg-primary justify-end" : "bg-muted justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow" />
                </button>
              </div>
              {/* Marketing */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{L.marketing}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{L.marketingDesc}</p>
                </div>
                <button
                  onClick={() => setPrefs((p) => ({ ...p, marketing: !p.marketing }))}
                  className={`flex-shrink-0 w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                    prefs.marketing ? "bg-primary justify-end" : "bg-muted justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow" />
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              onClick={() => save("all")}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {L.acceptAll}
            </button>
            <button
              onClick={() => save("essential")}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/60 transition-colors"
            >
              {L.essentialOnly}
            </button>
            {!expanded ? (
              <button
                onClick={() => setExpanded(true)}
                className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {L.customize} <ChevronDown className="w-3 h-3" />
              </button>
            ) : (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => save("custom", prefs)}
                  className="px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                >
                  {L.save}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
