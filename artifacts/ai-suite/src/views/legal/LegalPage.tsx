"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

interface LegalSection {
  title: string;
  content: string | string[];
}

interface LegalContent {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: LegalSection[];
}

interface LegalPageLayoutProps {
  content: {
    en: LegalContent;
    pt: LegalContent;
    es: LegalContent;
  };
  icon?: React.ReactNode;
}

export function LegalPageLayout({ content, icon }: LegalPageLayoutProps) {
  const { currentLanguage } = useLanguage();

  const lang = (currentLanguage?.code?.toLowerCase?.() || "en") as "en" | "pt" | "es";
  const data: LegalContent = content[lang] ?? content["en"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === "pt" ? "Voltar ao início" : lang === "es" ? "Volver al inicio" : "Back to home"}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            {icon ?? <Shield className="w-7 h-7" />}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{data.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{data.lastUpdated}</p>
          </div>
        </div>

        {data.intro && (
          <p className="text-muted-foreground text-base mb-10 leading-relaxed border-l-4 border-primary/30 pl-4 mt-6">
            {data.intro}
          </p>
        )}

        <div className="space-y-10 mt-10">
          {data.sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                {section.title}
              </h2>
              {Array.isArray(section.content) ? (
                <ul className="space-y-2 pl-4">
                  {section.content.map((item, j) => (
                    <li key={j} className="text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border/40 text-sm text-muted-foreground">
          <p>
            {lang === "pt"
              ? "Para dúvidas, entre em contato: "
              : lang === "es"
              ? "Para consultas, contáctenos: "
              : "For inquiries, contact us: "}
            <a href="mailto:contato@mediageek.io" className="text-primary hover:underline">
              contato@mediageek.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
