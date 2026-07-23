"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenTool, Copy, Download, Wand2 } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const contentTypes = [
  { value: "blog", label: "Post de Blog" },
  { value: "marketing", label: "Texto de Marketing" },
  { value: "product", label: "Descrição de Produto" },
  { value: "social", label: "Post para Redes Sociais" },
  { value: "email", label: "Newsletter por Email" },
  { value: "article", label: "Artigo" },
];

export default function WriterPage() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("");

  const [output, setOutput] = useState("");
  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleGenerate = async () => {
    if (!topic.trim() || !contentType) {
      toast({
        title: "Informação Faltando",
        description: "Por favor, informe um tópico e selecione o tipo de conteúdo.",
        variant: "destructive"
      });
      return;
    }

    const prompt = `Create ${contentType} content about: ${topic}
    ${keywords ? `Keywords to include: ${keywords}` : ""}
    ${tone ? `Tone: ${tone}` : ""}
    
    Please make it engaging, SEO-friendly, and professionally written.`;

    try {
      const response = await generateStream(systemPrompts.writer, prompt, undefined, undefined, 'writer');

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive"
        });
      } else {
        setOutput(response.text);
        toast({
          title: "Conteúdo Gerado!",
          description: "Seu conteúdo foi criado com sucesso.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência.",
    });
  };

  const downloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([output], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${contentType}-${topic.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <PenTool className="w-6 h-6 text-ai-primary" />
          <h1 className="text-2xl font-bold">Escritor de Conteúdo IA</h1>
        </div>
        <p className="text-muted-foreground">
          Gere conteúdo de alta qualidade: posts de blog, textos de marketing, descrições de produtos e muito mais.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-120px)]">
        {/* Input Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Content Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Tópico/Assunto *</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Benefits of Remote Work"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content-type">Tipo de Conteúdo *</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Palavras-chave (Opcional)</Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., productivity, efficiency, work-life balance"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tom (Opcional)</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Amigável</SelectItem>
                  <SelectItem value="authoritative">Autoritativo</SelectItem>
                  <SelectItem value="persuasive">Persuasivo</SelectItem>
                  <SelectItem value="informative">Informativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isStreaming}
              className="w-full"
            >
              {isStreaming ? "Gerando..." : "Gerar Conteúdo"}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="ai-card flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Conteúdo Gerado
              {output && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadText}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <Tabs defaultValue="preview" className="flex-1 flex flex-col">
              <div className="flex justify-end mb-2">
                <TabsList>
                  <TabsTrigger value="preview">Visualizar</TabsTrigger>
                  <TabsTrigger value="edit">Editar</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 min-h-[400px] border rounded-md p-4 bg-background overflow-auto">
                {(isStreaming ? streamedText : output) ? (
                  <>
                    <TabsContent value="preview" className="mt-0 h-full">
                      <MarkdownRenderer content={isStreaming ? streamedText : output} />
                    </TabsContent>
                    <TabsContent value="edit" className="mt-0 h-full">
                      <Textarea
                        value={isStreaming ? streamedText : output}
                        onChange={(e) => setOutput(e.target.value)}
                        className="h-full resize-none border-0 focus-visible:ring-0 p-0"
                        placeholder="Seu conteúdo gerado aparecerá aqui..."
                        readOnly={isStreaming}
                      />
                    </TabsContent>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <PenTool className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Seu conteúdo gerado aparecerá aqui</p>
                      <p className="text-sm mt-2">Preencha os detalhes e clique em "Gerar Conteúdo" para começar</p>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
