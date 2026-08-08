import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Feather, Loader2, Copy, Wand2 } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/contexts/LanguageContext';

const genres = [
  { value: "fantasy", label: "Fantasia" },
  { value: "sci-fi", label: "Ficção Científica" },
  { value: "mystery", label: "Mistério" },
  { value: "romance", label: "Romance" },
  { value: "thriller", label: "Suspense" },
  { value: "horror", label: "Terror" },
  { value: "adventure", label: "Aventura" },
  { value: "drama", label: "Drama" },
  { value: "comedy", label: "Comédia" },
  { value: "historical", label: "Ficção Histórica" }
];

const lengths = [
  { value: "short", label: "Conto (500-1000 palavras)" },
  { value: "medium", label: "História Média (1000-2500 palavras)" },
  { value: "outline", label: "Esboço da História" },
  { value: "script", label: "Formato de Roteiro" }
];

export default function StoryPage() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [length, setLength] = useState("");
  const [characters, setCharacters] = useState("");
  const [plot, setPlot] = useState("");
  const [setting, setSetting] = useState("");
  const [tone, setTone] = useState("");
  const [generatedContent, setGeneratedContent] = useState({
    story: ""
  });
  const { toast } = useToast();
  const { t } = useLanguage();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleGenerateStory = async () => {
    if (!genre || !plot) {
      toast({
        title: "Erro",
        description: "Selecione um gênero e forneça uma descrição do enredo.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prompt = `Escreva uma história criativa em PORTUGUÊS BRASILEIRO com os seguintes elementos (a menos que o enredo/plot esteja escrito em outro idioma, nesse caso use esse idioma):
      
Genre: ${genre}
Theme: ${tone || 'Match the genre appropriately'}
Characters: ${characters || 'Create interesting characters as needed'}
Setting: ${setting || 'Choose an appropriate setting'}
Plot Outlet: ${plot}

Please write an engaging story with a clear beginning, middle, and end.`;

      const response = await generateStream("Você é um especialista em escrita criativa. Escreva histórias envolventes e bem estruturadas com personagens cativantes e descrições vívidas. Siga técnicas de narrativa adequadas e mantenha consistência no tom e estilo. Sempre escreva no mesmo idioma que foi utilizado no prompt do usuário.", prompt);
      setGeneratedContent({ ...generatedContent, story: response.text });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Falha ao gerar história. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleCopyStory = () => {
    navigator.clipboard.writeText(generatedContent.story);
    toast({
      title: "Copiado",
      description: "História copiada para a área de transferência.",
    });
  }


  const generateRandomPrompt = () => {
    const prompts = [
      "A detective discovers that their reflection has been solving crimes independently",
      "In a world where emotions are currency, someone becomes incredibly wealthy overnight",
      "A librarian finds that certain books can transport readers into their stories",
      "A time traveler keeps arriving one day late to every important historical event",
      "A small town where everyone's dreams become visible in the morning sky"
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setPlot(randomPrompt);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-xl lg:text-3xl font-bold ai-gradient-text">{t("story.title")}</h1>
        <p className="text-muted-foreground mt-2">
          Create compelling stories and scripts with AI assistance. Choose your genre, characters, and plot elements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-ai-primary" />
              Story Details
            </CardTitle>
            <CardDescription>
              Customize your story elements and let AI create your narrative.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("story.storyTitle")}</Label>
              <Input
                id="title"
                placeholder={t("story.titlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genre">{t("story.genre")}</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("story.selectGenre")} />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Format</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("story.selectFormat")} />
                  </SelectTrigger>
                  <SelectContent>
                    {lengths.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plot">{t("story.plotPremise")}</Label>
              <Textarea
                id="plot"
                placeholder={t("story.plotPlaceholder")}
                value={plot}
                onChange={(e) => setPlot(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={generateRandomPrompt}
                className="w-full"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Random Prompt
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="characters">{t("story.mainChars")}</Label>
              <Input
                id="characters"
                placeholder="e.g., Sarah (detective), Marcus (suspect), elderly librarian..."
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="setting">{t("story.setting")}</Label>
                <Input
                  id="setting"
                  placeholder="e.g., Victorian London, Space station..."
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">{t("story.tone")}</Label>
                <Input
                  id="tone"
                  placeholder="e.g., Dark, Humorous, Mysterious..."
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateStory}
              disabled={isStreaming || !genre || !plot}
              className="w-full"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Story...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Story
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="ai-card flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-ai-secondary" />
              Generated Story
            </CardTitle>
            <CardDescription>
              Your AI-generated story will appear here.
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

              <div className="flex-1 min-h-[400px] border rounded-md p-4 bg-background overflow-y-auto overflow-x-hidden">
                {(isStreaming ? streamedText : generatedContent.story) ? (
                  <>
                    <TabsContent value="preview" className="mt-0 h-full">
                      <MarkdownRenderer content={isStreaming ? streamedText : generatedContent.story} />
                    </TabsContent>
                    <TabsContent value="edit" className="mt-0 h-full">
                      <div className="space-y-4 h-full flex flex-col">
                        <Textarea
                          value={isStreaming ? streamedText : generatedContent.story}
                          onChange={(e) => setGeneratedContent({ ...generatedContent, story: e.target.value })}
                          className="flex-1 resize-none border-0 focus-visible:ring-0 p-0"
                          readOnly={isStreaming}
                        />
                        {!isStreaming && (
                          <Button
                            onClick={handleCopyStory}
                            variant="outline"
                            className="w-full shrink-0"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Story
                          </Button>
                        )}
                      </div>
                    </TabsContent>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t("story.storyWillAppear")}</p>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Genre Examples */}
      <Card className="ai-card">
        <CardHeader>
          <CardTitle>Gêneros Populares</CardTitle>
          <CardDescription>
            Clique em qualquer gênero para selecioná-lo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <Badge
                key={g.value}
                variant={genre === g.value ? "default" : "outline"}
                className="cursor-pointer hover:bg-ai-primary/10"
                onClick={() => setGenre(g.value)}
              >
                {g.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
