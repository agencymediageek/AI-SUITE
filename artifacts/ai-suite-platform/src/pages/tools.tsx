import { useState } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { useListTools, useListToolCategories, useGetUserFavorites, useAddFavorite, useRemoveFavorite } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, Zap, Network, SlidersHorizontal, ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetUserFavoritesQueryKey } from "@workspace/api-client-react";

export default function Tools() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const queryClient = useQueryClient();

  const { data: tools, isLoading: toolsLoading } = useListTools({
    search: search || undefined,
    category: selectedCategory !== "All" ? selectedCategory : undefined,
  });

  const { data: categories, isLoading: categoriesLoading } = useListToolCategories();
  const { data: favorites, isLoading: favoritesLoading } = useGetUserFavorites();

  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const favoriteIds = new Set(favorites?.map(f => f.id) || []);

  const handleToggleFavorite = async (e: React.MouseEvent, toolId: string, isFavorite: boolean) => {
    e.preventDefault(); // prevent link navigation
    try {
      if (isFavorite) {
        await removeFavorite.mutateAsync({ toolId });
      } else {
        await addFavorite.mutateAsync({ data: { toolId } });
      }
      queryClient.invalidateQueries({ queryKey: getGetUserFavoritesQueryKey() });
    } catch (error) {
      console.error("Failed to toggle favorite", error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">AI Tools</h1>
            <p className="text-muted-foreground">Access over 100+ specialized AI agents and workflows.</p>
          </div>
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search tools..." 
              className="pl-9 bg-card border-border/50 focus-visible:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 shrink-0 space-y-6 lg:sticky lg:top-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Categories
              </h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left
                    ${selectedCategory === "All" ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-foreground'}
                  `}
                >
                  <span>All Tools</span>
                </button>
                {categoriesLoading ? (
                  Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-lg" />)
                ) : categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left
                      ${selectedCategory === cat.id ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-foreground'}
                    `}
                  >
                    <span>{cat.label}</span>
                    <Badge variant={selectedCategory === cat.id ? "secondary" : "outline"} className="ml-2 font-mono text-[10px]">
                      {cat.toolCount}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="flex-1 min-w-0">
            {toolsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array(9).fill(0).map((_, i) => (
                  <Card key={i} className="bg-card">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardFooter>
                      <Skeleton className="h-8 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : tools && tools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {tools.map((tool) => {
                  const isFavorite = favoriteIds.has(tool.id);
                  return (
                    <Link key={tool.id} href={`/tools/${tool.id}`}>
                      <Card className="h-full flex flex-col bg-card hover:border-primary/50 transition-all duration-200 cursor-pointer group hover:shadow-md hover:shadow-primary/5">
                        <CardHeader className="pb-4 relative">
                          <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <Zap className="w-5 h-5 fill-primary/20" />
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-yellow-500 z-10"
                              onClick={(e) => handleToggleFavorite(e, tool.id, isFavorite)}
                            >
                              <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                            </Button>
                          </div>
                          <CardTitle className="text-lg mb-1 group-hover:text-primary transition-colors">{tool.label}</CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] uppercase font-semibold tracking-wider">
                              {tool.category}
                            </Badge>
                            {tool.isPro && (
                              <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 text-[10px] uppercase">
                                Pro
                              </Badge>
                            )}
                            {tool.isNew && (
                              <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-[10px] uppercase">
                                New
                              </Badge>
                            )}
                            {tool.n8nWebhookUrl && (
                              <Badge variant="secondary" className="text-[10px] flex items-center gap-1 bg-[#ff6d5a]/10 text-[#ff6d5a] border-[#ff6d5a]/20">
                                <Network className="w-3 h-3" /> N8N
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {tool.description || `Powerful AI tool for ${tool.category} workflows.`}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-4 border-t border-border/50 flex justify-between items-center bg-muted/20">
                          <div className="flex items-center text-xs font-mono text-muted-foreground font-medium">
                            <Zap className="w-3 h-3 mr-1 text-primary" />
                            {tool.tokenCost} tokens
                          </div>
                          <div className="text-xs font-medium text-primary flex items-center group-hover:translate-x-1 transition-transform">
                            Open Tool <ArrowRight className="w-3 h-3 ml-1" />
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border rounded-xl bg-card/50">
                <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-semibold mb-2">No tools found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  We couldn't find any tools matching your current filters. Try a different search term or category.
                </p>
                <Button variant="outline" onClick={() => { setSearch(""); setSelectedCategory("All"); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
