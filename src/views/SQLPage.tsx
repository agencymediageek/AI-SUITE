import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Play, Copy, Loader2 } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const databaseTypes = [
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "mssql", label: "SQL Server" },
  { value: "oracle", label: "Oracle" }
];

const queryExamples = [
  "Encontre todos os clientes que fizeram pedidos nos últimos 30 dias",
  "Liste os 10 produtos com maior receita de vendas",
  "Mostre usuários que não acessam há mais de 6 meses",
  "Calcule o valor médio de pedidos por mês",
  "Encontre e-mails duplicados na tabela de usuários"
];

export default function SQLPage() {
  const [naturalQuery, setNaturalQuery] = useState("");
  const [databaseType, setDatabaseType] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [explanation, setExplanation] = useState("");

  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleGenerateSQL = async () => {
    if (!naturalQuery.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma descrição da consulta.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prompt = `Convert this natural language query to ${databaseType || 'SQL'} syntax:

"${naturalQuery}"

Please provide:
1. The optimized SQL query
2. A brief explanation of what the query does
3. Any assumptions made about table structure`;

      const response = await generateStream(systemPrompts.sql, prompt, undefined, undefined, 'sql');

      // Parse response to separate SQL and explanation
      const parts = response.text.split('\n\n');
      setSqlQuery(response.text);
      setExplanation("Consulta gerada com sucesso. Revise o SQL acima.");

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Failed to generate SQL query. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCopySQL = () => {
    if (sqlQuery) {
      navigator.clipboard.writeText(sqlQuery);
      toast({
        title: "Copiado",
        description: "SQL copiado para a área de transferência.",
      });
    }
  };

  const handleExampleClick = (example: string) => {
    setNaturalQuery(example);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-xl lg:text-3xl font-bold ai-gradient-text">Construtor de SQL IA</h1>
        <p className="text-muted-foreground mt-2">
          Converta linguagem natural em consultas SQL otimizadas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-ai-primary" />
              Construtor de Consultas
            </CardTitle>
            <CardDescription>
              Descreva em português o que você deseja consultar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Banco de Dados (Opcional)</label>
              <Select value={databaseType} onValueChange={setDatabaseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {databaseTypes.map((db) => (
                    <SelectItem key={db.value} value={db.value}>
                      {db.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Describe Your Query</label>
              <Textarea
                placeholder="Example: Find all customers who placed orders in the last 30 days..."
                value={naturalQuery}
                onChange={(e) => setNaturalQuery(e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>

            <Button
              onClick={handleGenerateSQL}
              disabled={isStreaming || !naturalQuery.trim()}
              className="w-full"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate SQL
                </>
              )}
            </Button>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Examples:</label>
              <div className="space-y-1">
                {queryExamples.slice(0, 3).map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start text-xs h-auto p-2"
                    onClick={() => handleExampleClick(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="ai-card flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-ai-secondary" />
              Generated SQL
            </CardTitle>
            <CardDescription>
              Your optimized SQL query will appear here.
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

              <div className="flex-1 min-h-[300px] border rounded-md p-4 bg-background overflow-y-auto overflow-x-hidden">
                {(isStreaming ? streamedText : sqlQuery) ? (
                  <>
                    <TabsContent value="preview" className="mt-0 h-full">
                      <MarkdownRenderer content={isStreaming ? streamedText : sqlQuery} />
                      {!isStreaming && explanation && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-medium mb-2">Explanation:</h4>
                          <p className="text-sm text-muted-foreground">{explanation}</p>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="edit" className="mt-0 h-full">
                      <div className="space-y-4 h-full flex flex-col">
                        <Textarea
                          value={isStreaming ? streamedText : sqlQuery}
                          onChange={(e) => setSqlQuery(e.target.value)}
                          className="flex-1 resize-none border-0 focus-visible:ring-0 p-0 font-mono text-sm"
                          readOnly={isStreaming}
                        />
                        {!isStreaming && (
                          <Button
                            onClick={handleCopySQL}
                            variant="outline"
                            className="w-full shrink-0"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar SQL
                          </Button>
                        )}
                      </div>
                    </TabsContent>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Seu SQL aparecerá aqui</p>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* More Examples Section */}
      <Card className="ai-card">
        <CardHeader>
          <CardTitle>Exemplos de Consultas</CardTitle>
          <CardDescription>
            Clique em um exemplo para experimentar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {queryExamples.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left justify-start h-auto p-4"
                onClick={() => handleExampleClick(example)}
              >
                <Database className="w-4 h-4 mr-3 text-ai-primary flex-shrink-0" />
                <span className="text-sm">{example}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
