"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const TOOLS = [
  { id: "chat", label: "Chat IA", category: "Texto", route: "/chat" },
  { id: "writer", label: "Escritor IA", category: "Texto", route: "/writer" },
  { id: "summary", label: "Resumidor", category: "Texto", route: "/summary" },
  { id: "translator", label: "Tradutor", category: "Texto", route: "/translator" },
  { id: "grammar", label: "Corretor de Gramática", category: "Texto", route: "/grammar" },
  { id: "email", label: "Gerador de E-mail", category: "Texto", route: "/email" },
  { id: "story", label: "Gerador de Histórias", category: "Texto", route: "/story" },
  { id: "code", label: "Assistente de Código", category: "Código", route: "/code" },
  { id: "sql", label: "Gerador SQL", category: "Código", route: "/sql" },
  { id: "image-generator", label: "Gerador de Imagens", category: "Imagem", route: "/image-generator" },
  { id: "ocr", label: "OCR / Extração de Texto", category: "Documentos", route: "/ocr" },
  { id: "resume", label: "Criador de Currículo", category: "Documentos", route: "/resume" },
  { id: "quiz", label: "Gerador de Quiz", category: "Educação", route: "/quiz" },
  { id: "interview", label: "Prep. para Entrevistas", category: "Educação", route: "/interview" },
  { id: "social", label: "Posts para Redes Sociais", category: "Marketing", route: "/social" },
  { id: "recipe", label: "Gerador de Receitas", category: "Lifestyle", route: "/recipe" },
  { id: "sentiment", label: "Análise de Sentimento", category: "Análise", route: "/sentiment" },
  { id: "trading", label: "Terminal de Trading", category: "Finanças", route: "/trading" },
  { id: "ai-meeting", label: "Reuniões IA", category: "Produtividade", route: "/ai-meeting" },
  { id: "ai-marketing", label: "Suite de Marketing IA", category: "Marketing", route: "/ai-marketing" },
];

const categories = [...new Set(TOOLS.map((t) => t.category))];

export default function ToolsPage() {
  const [disabled, setDisabled] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin-mg/config")
      .then((r) => r.json())
      .then((d) => {
        setDisabled(d?.metadata?.disabledTools || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleTool = (id: string) => {
    setDisabled((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentRes = await fetch("/api/admin-mg/config");
      const current = await currentRes.json();
      const updated = { ...current, metadata: { ...(current.metadata || {}), disabledTools: disabled } };
      const res = await fetch("/api/admin-mg/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      toast.success(`${disabled.length} ferramentas desativadas. Reload para aplicar.`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i=><div key={i} className="h-32 bg-muted rounded-xl"/>)}</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ferramentas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {TOOLS.length - disabled.length} de {TOOLS.length} ferramentas ativas
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Salvar
        </Button>
      </div>

      {categories.map((cat) => {
        const tools = TOOLS.filter((t) => t.category === cat);
        return (
          <Card key={cat} className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{cat}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {tools.map((tool) => {
                const isActive = !disabled.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                      <div>
                        <p className="text-sm font-medium">{tool.label}</p>
                        <p className="text-xs text-muted-foreground font-mono">{tool.route}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => toggleTool(tool.id)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
