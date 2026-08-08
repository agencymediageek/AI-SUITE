import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Users, Plus, X, Utensils } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/contexts/LanguageContext';

const cuisineTypes = [
  "Italiana", "Mexicana", "Asiática", "Mediterrânea", "Americana", "Francesa",
  "Indiana", "Tailandesa", "Japonesa", "Grega", "Espanhola", "Árabe"
];

const mealTypes = ["Café da Manhã", "Almoço", "Jantar", "Lanche", "Sobremesa", "Entrada"];
const difficulties = ["Fácil", "Médio", "Difícil"];
const dietaryRestrictions = [
  "Vegetariano", "Vegano", "Sem Glúten", "Sem Lactose", "Keto", "Paleo", "Low-Carb", "Low-Fat"
];

export default function RecipePage() {
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    cuisine: "",
    mealType: "",
    difficulty: "",
    cookingTime: "",
    servings: "",
    dietary: "",
    preferences: ""
  });
  const [recipe, setRecipe] = useState("");

  const { toast } = useToast();
  const { t } = useLanguage();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateRecipe = async () => {
    const validIngredients = ingredients.filter(ing => ing.trim() !== "");

    if (validIngredients.length === 0) {
      toast({
        title: "Ingredientes Ausentes",
        description: "Adicione pelo menos um ingrediente.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prompt = `Crie uma receita detalhada em PORTUGUÊS BRASILEIRO usando estes ingredientes:
Ingredientes principais: ${validIngredients.join(", ")}

Preferências:
- Culinária: ${formData.cuisine || t("common.any")}
- Tipo de Refeição: ${formData.mealType || t("common.any")}
- Dificuldade: ${formData.difficulty || t("common.any")}
- Tempo de Preparo: ${formData.cookingTime || "No preference"}
- Porções: ${formData.servings || "4"}
- Restrições Alimentares: ${formData.dietary || t("common.none")}
- Observações: ${formData.preferences}

Por favor, forneça:
1. Nome da receita
2. Lista completa de ingredientes com quantidades
3. Passo a passo detalhado do preparo
4. Tempo de preparo e dificuldade
5. Destaques nutricionais
6. Dicas para melhores resultados

Escreva de forma clara, detalhada e fácil de seguir.`;

      const response = await generateStream(systemPrompts.writer, prompt, undefined, undefined, 'recipe');
      setRecipe(response.text);

      toast({
        title: "Receita Gerada!",
        description: "Sua receita personalizada está pronta!"
      });
    } catch (error: any) {
      toast({
        title: "Falha na Geração",
        description: "Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <ChefHat className="w-8 h-8 text-ai-primary" />
          <h1 className="text-xl lg:text-3xl font-bold ai-gradient-text">{t("recipe.title")}</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform your available ingredients into delicious recipes with AI-powered cooking assistance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Recipe Preferences
            </CardTitle>
            <CardDescription>
              Tell us what you have and what you'd like to cook
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ingredients Section */}
            <div>
              <Label className="text-base font-semibold">{t("recipe.ingredients")}</Label>
              <div className="space-y-2 mt-2">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      placeholder={t("recipe.ingredientsPlaceholder")}
                      className="flex-1"
                    />
                    {ingredients.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                        className="shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addIngredient}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cuisine">{t("recipe.cuisineType")}</Label>
                <Select value={formData.cuisine} onValueChange={(value) => handleInputChange("cuisine", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("recipe.anyCuisine")} />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisineTypes.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mealType">{t("recipe.mealType")}</Label>
                <Select value={formData.mealType} onValueChange={(value) => handleInputChange("mealType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("recipe.anyMeal")} />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((meal) => (
                      <SelectItem key={meal} value={meal}>
                        {meal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.any")} />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff} value={diff}>
                        {diff}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cookingTime">{t("recipe.maxTime")}</Label>
                <Input
                  id="cookingTime"
                  value={formData.cookingTime}
                  onChange={(e) => handleInputChange("cookingTime", e.target.value)}
                  placeholder={t("recipe.defaultTime")}
                />
              </div>

              <div>
                <Label htmlFor="servings">{t("recipe.servings")}</Label>
                <Input
                  id="servings"
                  value={formData.servings}
                  onChange={(e) => handleInputChange("servings", e.target.value)}
                  placeholder="4"
                  type="number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dietary">{t("recipe.dietary")}</Label>
              <Select value={formData.dietary} onValueChange={(value) => handleInputChange("dietary", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("common.none")} />
                </SelectTrigger>
                <SelectContent>
                  {dietaryRestrictions.map((diet) => (
                    <SelectItem key={diet} value={diet}>
                      {diet}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferences">{t("recipe.preferences")}</Label>
              <Textarea
                id="preferences"
                value={formData.preferences}
                onChange={(e) => handleInputChange("preferences", e.target.value)}
                placeholder="Any special requests? Spicy food, comfort food, healthy options..."
                rows={2}
              />
            </div>

            <Button
              onClick={generateRecipe}
              disabled={isStreaming}
              className="w-full"
            >
              {isStreaming ? "Creating Recipe..." : t("recipe.generateBtn")}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="ai-card flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-ai-secondary" />
              Generated Recipe
            </CardTitle>
            <CardDescription>
              Your personalized recipe based on available ingredients
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
                {(isStreaming ? streamedText : recipe) ? (
                  <>
                    <TabsContent value="preview" className="mt-0 h-full">
                      <MarkdownRenderer content={isStreaming ? streamedText : recipe} />
                      {!isStreaming && (
                        <div className="mt-4 flex gap-2 flex-wrap">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formData.cookingTime || "Variable"} time
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {formData.servings || "4"} servings
                          </Badge>
                          {formData.difficulty && (
                            <Badge variant="secondary">
                              {formData.difficulty} difficulty
                            </Badge>
                          )}
                          {formData.dietary && (
                            <Badge variant="secondary">
                              {formData.dietary}
                            </Badge>
                          )}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="edit" className="mt-0 h-full">
                      <Textarea
                        value={isStreaming ? streamedText : recipe}
                        onChange={(e) => setRecipe(e.target.value)}
                        className="h-full resize-none border-0 focus-visible:ring-0 p-0"
                        readOnly={isStreaming}
                      />
                    </TabsContent>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Your personalized recipe will appear here</p>
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
