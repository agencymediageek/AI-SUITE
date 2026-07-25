"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Loader2 } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SummarizerPage() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");

  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to summarize.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await generateStream(systemPrompts.summary, `Please summarize this text:\n\n${text}`, undefined, undefined, 'summary');
      setSummary(response.text);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to summarize text. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold ai-gradient-text">Resumidor de Documentos IA</h1>
        <p className="text-muted-foreground mt-2">
          Resuma rapidamente documentos longos, artigos ou textos preservando as informações principais.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-ai-primary" />
              Texto de Entrada
            </CardTitle>
            <CardDescription>
              Cole seu conteúdo abaixo para obter um resumo completo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Cole seu texto longo, artigo ou conteúdo aqui..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[300px] resize-none"
            />
            <Button
              onClick={handleSummarize}
              disabled={isStreaming || !text.trim()}
              className="w-full"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resumindo...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Resumir Texto
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="ai-card flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-ai-secondary" />
              Summary
            </CardTitle>
            <CardDescription>
              Seu resumo gerado pela IA aparecerá aqui.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <Tabs defaultValue="preview" className="flex-1 flex flex-col">
              <div className="flex justify-end mb-2">
                <TabsList>
                  <TabsTrigger value="preview">Visualizar</TabsTrigger>
                  <TabsTrigger value="edit">Editar</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 min-h-[300px] border rounded-md p-4 bg-background overflow-auto">
                {(isStreaming ? streamedText : summary) ? (
                  <>
                    <TabsContent value="preview" className="mt-0 h-full">
                      <MarkdownRenderer content={isStreaming ? streamedText : summary} />
                    </TabsContent>
                    <TabsContent value="edit" className="mt-0 h-full">
                      <Textarea
                        value={isStreaming ? streamedText : summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="h-full resize-none border-0 focus-visible:ring-0 p-0"
                        readOnly={isStreaming}
                      />
                    </TabsContent>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>O resumo aparecerá aqui após o processamento</p>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <Card className="ai-card">
        <CardHeader>
          <CardTitle>Recursos do Resumidor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <FileText className="w-8 h-8 mx-auto mb-2 text-ai-primary" />
              <h3 className="font-semibold mb-1">Pontos Principais</h3>
              <p className="text-sm text-muted-foreground">Extrai ideias principais e detalhes importantes</p>
            </div>
            <div className="text-center p-4">
              <Upload className="w-8 h-8 mx-auto mb-2 text-ai-secondary" />
              <h3 className="font-semibold mb-1">Processamento Inteligente</h3>
              <p className="text-sm text-muted-foreground">Processa textos longos com compressão inteligente</p>
            </div>
            <div className="text-center p-4">
              <FileText className="w-8 h-8 mx-auto mb-2 text-ai-primary" />
              <h3 className="font-semibold mb-1">Saída Estruturada</h3>
              <p className="text-sm text-muted-foreground">Resumos claros e organizados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
