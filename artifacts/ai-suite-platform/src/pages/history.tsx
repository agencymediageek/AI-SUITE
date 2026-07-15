import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetUserHistory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock, Zap, FileText, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function History() {
  const [page, setPage] = useState(1);
  const limit = 20;
  
  const { data: history, isLoading } = useGetUserHistory({
    limit,
    offset: (page - 1) * limit
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Generation History</h1>
            <p className="text-muted-foreground">Review and manage your past AI generations.</p>
          </div>
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search history..." 
              className="pl-9 bg-card border-border/50"
            />
          </div>
        </div>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : history && history.length > 0 ? (
              <div className="divide-y divide-border/50">
                {history.map((record) => (
                  <div key={record.id} className="p-4 sm:p-6 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Link href={`/tools/${record.toolId}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                          {record.toolLabel}
                        </Link>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {record.model || "Default"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2 bg-background p-3 rounded border border-border/50 font-mono">
                        <FileText className="w-3 h-3 inline mr-2 opacity-50" />
                        {record.prompt || "No prompt available"}
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 gap-2 sm:gap-4 mt-2 sm:mt-0">
                      <div className="flex items-center gap-4 sm:gap-2">
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(record.createdAt).toLocaleString()}
                        </div>
                        <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary hover:bg-primary/20">
                          {record.tokensUsed} <Zap className="w-3 h-3 ml-1" />
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
                        <Link href={`/tools/${record.toolId}`}>
                          Run Again <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <FileText className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-medium mb-1">No history yet</h3>
                <p className="text-muted-foreground mb-6">You haven't generated anything yet. Go to Tools to get started.</p>
                <Button asChild>
                  <Link href="/tools">Explore Tools</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {history && history.length === limit && (
          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={() => setPage(p => p + 1)}>
              Load More
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
