import { useState } from "react";
import { generateImageAction } from "@/actions/image-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [numberOfImages, setNumberOfImages] = useState("1");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { refreshUser } = useAuth();

    const generateImage = async () => {

    if (!prompt.trim()) {
      toast({
        title: "Prompt Necessário",
        description: "Por favor, insira um prompt para gerar uma imagem.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      // Call the Server Action
      const result = await generateImageAction(prompt, {
        numberOfImages: parseInt(numberOfImages),
        aspectRatio: aspectRatio,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.image) {
        setGeneratedImage(result.image);
        await refreshUser(); // Update token balance UI

        toast({
          title: "Sucesso",
          description: "Imagem gerada com sucesso!",
        });
      } else {
        throw new Error("Nenhuma imagem recebida da API.");
      }

    } catch (error: any) {
      console.error("Image generation error:", error);
      toast({
        title: "Falha na Geração",
        description: error.message || "Falha ao gerar imagem.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${generatedImage}`;
    link.download = `generated-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Concluído",
      description: "Imagem salva com sucesso!",
    });
  };

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gerador de Imagens IA</h1>
        <p className="text-muted-foreground">
          Crie imagens impressionantes com geração por IA usando Gemini
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-ai-primary" />
              Configuração de Imagem
            </CardTitle>
            <CardDescription>
              Digite seu prompt e selecione as opções para gerar imagens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Descreva a imagem que você quer gerar. Ex: Um relógio de luxo futurista sobre um pedestal de mármore com iluminação dramática..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspectRatio">Proporção</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger id="aspectRatio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
                  <SelectItem value="3:4">3:4 (Retrato)</SelectItem>
                  <SelectItem value="4:3">4:3 (Paisagem)</SelectItem>
                  <SelectItem value="9:16">9:16 (Alto)</SelectItem>
                  <SelectItem value="16:9">16:9 (Largo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfImages">Número de Imagens</Label>
              <Select value={numberOfImages} onValueChange={setNumberOfImages}>
                <SelectTrigger id="numberOfImages">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Imagem</SelectItem>
                  <SelectItem value="2">2 Imagens</SelectItem>
                  <SelectItem value="3">3 Imagens</SelectItem>
                  <SelectItem value="4">4 Imagens</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateImage}
              disabled={isLoading || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Gerar Imagem
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Imagem Gerada</CardTitle>
            <CardDescription>
              Sua imagem gerada por IA aparecerá aqui
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-lg">
                <div className="text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-ai-primary" />
                  <p className="text-sm text-muted-foreground">Gerando sua imagem...</p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-muted/30">
                  <img
                    src={`data:image/jpeg;base64,${generatedImage}`}
                    alt="Generated"
                    className="w-full h-auto"
                  />
                </div>
                <Button
                  onClick={downloadImage}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Imagem
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-lg">
                <div className="text-center space-y-2">
                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma imagem gerada ainda
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
