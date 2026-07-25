import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Loader2 } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const emailTypes = [
  { value: "cold-outreach", label: "Prospecção Fria" },
  { value: "follow-up", label: "Acompanhamento" },
  { value: "response", label: "Resposta" },
  { value: "introduction", label: "Apresentação" },
  { value: "thank-you", label: "Agradecimento" },
  { value: "meeting-request", label: "Solicitar Reunião" }
];

export default function EmailPage() {
  const [emailType, setEmailType] = useState("");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");

  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleGenerateEmail = async () => {
    if (!emailType || !recipient || !context) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prompt = `Generate a ${emailType} email:
      
Recipient: ${recipient}
Subject: ${subject || "Please suggest an appropriate subject"}
Context: ${context}

Please create a professional, engaging, and appropriate email.`;

      const response = await generateStream(systemPrompts.email, prompt, undefined, undefined, 'email');
      setGeneratedEmail(response.text);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Falha ao gerar e-mail. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold ai-gradient-text">Assistente de E-mails IA</h1>
        <p className="text-muted-foreground mt-2">
          Crie e-mails profissionais para prospecção, acompanhamento, respostas e muito mais.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-ai-primary" />
              Detalhes do E-mail
            </CardTitle>
            <CardDescription>
              Preencha os detalhes para gerar seu e-mail profissional.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-type">Tipo de E-mail *</Label>
              <Select value={emailType} onValueChange={setEmailType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {emailTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Destinatário *</Label>
              <Input
                id="recipient"
                placeholder="Ex: João Silva, CEO da TechCorp"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Assunto (Opcional)</Label>
              <Input
                id="subject"
                placeholder="Assunto do e-mail"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Contexto/Objetivo *</Label>
              <Textarea
                id="context"
                placeholder="Descreva o objetivo do e-mail, o que quer alcançar e informações relevantes..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>

            <Button
              onClick={handleGenerateEmail}
              disabled={isStreaming || !emailType || !recipient || !context}
              className="w-full"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Gerar E-mail
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-ai-secondary" />
              E-mail Gerado
            </CardTitle>
            <CardDescription>
              Your AI-generated professional email will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <Tabs defaultValue="preview" className="flex-1 flex flex-col">
              <div className="flex justify-end mb-2">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 min-h-[400px] border rounded-md p-4 bg-background overflow-auto">
                {(isStreaming ? streamedText : generatedEmail) ? (
                  <>
                    <TabsContent value="preview" className="mt-0 h-full">
                      <MarkdownRenderer content={isStreaming ? streamedText : generatedEmail} />
                    </TabsContent>
                    <TabsContent value="edit" className="mt-0 h-full">
                      <div className="space-y-4 h-full flex flex-col">
                        <Textarea
                          value={isStreaming ? streamedText : generatedEmail}
                          onChange={(e) => setGeneratedEmail(e.target.value)}
                          className="flex-1 resize-none border-0 focus-visible:ring-0 p-0"
                          readOnly={isStreaming}
                        />
                      </div>
                    </TabsContent>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Seu e-mail profissional aparecerá aqui</p>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Email Types Info */}
      <Card className="ai-card">
        <CardHeader>
          <CardTitle>Tipos de E-mail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailTypes.map((type) => (
              <div key={type.value} className="text-center p-4 border rounded-lg">
                <Mail className="w-8 h-8 mx-auto mb-2 text-ai-primary" />
                <h3 className="font-semibold mb-1">{type.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {type.value === "cold-outreach" && "Contate novos clientes ou parceiros"}
                  {type.value === "follow-up" && "Retome conversas anteriores"}
                  {type.value === "response" && "Responda e-mails recebidos"}
                  {type.value === "introduction" && "Apresente-se ou apresente alguém"}
                  {type.value === "thank-you" && "Expresse gratidão de forma profissional"}
                  {type.value === "meeting-request" && "Solicite reuniões ou ligações"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
