import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetTool, useGenerateAi, useListModels, useAddFavorite, useRemoveFavorite, useGetUserFavorites } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Zap, Copy, Download, Star, ArrowLeft, Loader2, CheckCheck, Network } from "lucide-react";
import { getGetUserFavoritesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ToolDetail() {
  const params = useParams();
  const toolId = params.toolId;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<string>("default");
  const [extraInputs, setExtraInputs] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const { data: tool, isLoading: toolLoading } = useGetTool(toolId || "", {
    query: { enabled: !!toolId }
  });

  const { data: models } = useListModels();
  const { data: favorites } = useGetUserFavorites();
  
  const generateMutation = useGenerateAi();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorite = favorites?.some(f => f.id === toolId);

  const handleToggleFavorite = async () => {
    if (!toolId) return;
    try {
      if (isFavorite) {
        await removeFavorite.mutateAsync({ toolId });
        toast.success("Removed from favorites");
      } else {
        await addFavorite.mutateAsync({ data: { toolId } });
        toast.success("Added to favorites");
      }
      queryClient.invalidateQueries({ queryKey: getGetUserFavoritesQueryKey() });
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  const handleGenerate = async () => {
    if (!toolId || !prompt.trim()) return;
    setOutput(null);
    try {
      const response = await generateMutation.mutateAsync({
        data: {
          toolId,
          prompt,
          model: model !== "default" ? model : undefined,
          extraInputs: Object.keys(extraInputs).length > 0 ? extraInputs : undefined
        }
      });
      setOutput(response.text);
      toast.success(`Generated successfully using ${response.tokensUsed} tokens`);
    } catch (error: any) {
      toast.error(error?.message || "Generation failed. Please try again.");
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Copied to clipboard");
    }
  };

  const handleDownload = () => {
    if (output && tool) {
      const blob = new Blob([output], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tool.label.replace(/\s+/g, "_").toLowerCase()}_output.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Very basic markdown parsing for display without external library
  const renderMarkdown = (text: string) => {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm text-primary font-mono">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted/50 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono border border-border"><code>$1</code></pre>')
      .replace(/\n/g, '<br />');
    
    return <div dangerouslySetInnerHTML={{ __html: html }} className="prose dark:prose-invert prose-sm sm:prose-base max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border" />;
  };

  if (!toolId) {
    return <AppLayout><div>Invalid tool ID</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button variant="ghost" className="mb-2 -ml-4 text-muted-foreground hover:text-foreground" onClick={() => setLocation("/tools")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tools
        </Button>

        {toolLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
        ) : !tool ? (
          <div className="text-center py-20">Tool not found.</div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold tracking-tight">{tool.label}</h1>
                  {tool.isPro && <Badge className="bg-accent text-accent-foreground uppercase tracking-widest text-[10px]">PRO</Badge>}
                  {tool.n8nWebhookUrl && (
                    <Badge variant="secondary" className="flex items-center gap-1 bg-[#ff6d5a]/10 text-[#ff6d5a] border-[#ff6d5a]/20">
                      <Network className="w-3 h-3" /> Powered by N8N
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground max-w-2xl">{tool.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                  <span className="text-xs font-mono text-muted-foreground flex items-center bg-muted/50 px-2 py-1 rounded">
                    <Zap className="w-3 h-3 mr-1 text-primary" /> {tool.tokenCost} tokens / run
                  </span>
                </div>
              </div>
              
              <Button 
                variant={isFavorite ? "secondary" : "outline"} 
                className={isFavorite ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 hover:text-yellow-700 border-yellow-500/20" : ""}
                onClick={handleToggleFavorite}
              >
                <Star className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "Favorited" : "Add to Favorites"}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Configuration */}
              <Card className="bg-card shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" /> Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Category-specific extra inputs */}
                  {(tool.category === "Writing" || tool.category === "Marketing") && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tone</Label>
                        <Select onValueChange={(val) => setExtraInputs(prev => ({ ...prev, tone: val }))}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select tone..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                            <SelectItem value="persuasive">Persuasive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Format</Label>
                        <Select onValueChange={(val) => setExtraInputs(prev => ({ ...prev, format: val }))}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select format..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paragraph">Paragraph</SelectItem>
                            <SelectItem value="bullets">Bullet Points</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="tweet">Tweet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {tool.category === "Development" && (
                    <div className="space-y-2">
                      <Label>Language / Framework</Label>
                      <Select onValueChange={(val) => setExtraInputs(prev => ({ ...prev, language: val }))}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="e.g. React, Python, Rust..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="typescript">TypeScript / React</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="rust">Rust</SelectItem>
                          <SelectItem value="go">Go</SelectItem>
                          <SelectItem value="sql">SQL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {models && models.length > 0 && (
                    <div className="space-y-2">
                      <Label>AI Model</Label>
                      <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default Model (Optimized)</SelectItem>
                          {models.map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name} ({m.provider})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span>Primary Prompt</span>
                      <span className="text-xs text-muted-foreground font-normal">Required</span>
                    </Label>
                    <Textarea 
                      placeholder={`What would you like the ${tool.label} to do?`}
                      className="min-h-[200px] resize-none bg-background font-sans"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full h-12 text-md shadow-lg shadow-primary/20" 
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || generateMutation.isPending}
                  >
                    {generateMutation.isPending ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
                    ) : (
                      <><Zap className="w-5 h-5 mr-2 fill-current" /> Run Tool</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output Display */}
              <Card className="bg-card shadow-sm border-border/60 flex flex-col min-h-[500px]">
                <CardHeader className="border-b border-border/40 bg-muted/10 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Output</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output} className="h-8">
                      {isCopied ? <CheckCheck className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!output} className="h-8">
                      <Download className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 relative bg-background/50 overflow-hidden">
                  {generateMutation.isPending ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                      <div className="flex gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">AI is thinking...</p>
                    </div>
                  ) : output ? (
                    <div className="p-6 h-full overflow-y-auto absolute inset-0">
                      {renderMarkdown(output)}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 border border-border">
                        <Zap className="w-8 h-8 opacity-20" />
                      </div>
                      <p>Run the tool to see the output here.</p>
                      <p className="text-sm opacity-60 mt-2">Outputs support markdown formatting, code blocks, and rich text.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
