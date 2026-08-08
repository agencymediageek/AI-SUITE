import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, Brain, Star, Clock, Target, Play, Pause, RefreshCw } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useLanguage } from '@/contexts/LanguageContext';

const jobLevels = ["Júnior", "Pleno", "Sênior", "Executivo", "Estágio"];
const industries = [
  "Tecnologia", "Finanças", "Saúde", "Marketing", "Vendas", "Educação",
  "Engenharia", "Design", "Consultoria", "Varejo", "Manufatura", "Jurídico"
];

const questionTypes = [
  "Questões Técnicas", "Questões Comportamentais", "Questões Situacionais",
  "Fit Cultural", "Questões de Liderança", "Resolução de Problemas"
];

interface Question {
  id: number;
  question: string;
  type: string;
  difficulty: string;
  sampleAnswer: string;
  tips: string[];
}

export default function InterviewPage() {
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    jobLevel: "",
    industry: "",
    skillsRequired: "",
    questionTypes: "",
    customRequirements: ""
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const [sessionStarted, setSessionStarted] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateQuestions = async () => {
    if (!formData.jobTitle) {
      toast({
        title: "Informação Faltando",
        description: "Por favor, informe pelo menos o cargo.",
        variant: "destructive"
      });
      return;
    }


    try {
      const prompt = `Generate 10 comprehensive interview questions for the following position:

JOB DETAILS:
- Position: ${formData.jobTitle}
- Company: ${formData.company || "Any company"}
- Level: ${formData.jobLevel || "Mid Level"}
- Industry: ${formData.industry || "Technology"}
- Required Skills: ${formData.skillsRequired || "Standard for the role"}
- Question Focus: ${formData.questionTypes || "Mixed"}
- Special Requirements: ${formData.customRequirements || "None"}

For each question, provide:
1. The question itself
2. Question type (technical, behavioral, situational, etc.)
3. Difficulty level (Easy, Medium, Hard)
4. A high-quality sample answer
5. 3 key tips for answering effectively

Make the questions realistic and relevant to the specific role and industry.`;

      const response = await generateStream(systemPrompts.chat, prompt, undefined, undefined, 'interview');

      // Parse response into questions (simplified parsing)
      const questionTexts = response.text.split(/\d+\.\s/).filter(q => q.trim().length > 20);

      const parsedQuestions: Question[] = questionTexts.slice(0, 10).map((q, index) => ({
        id: index + 1,
        question: q.split('\n')[0].trim(),
        type: formData.questionTypes || "Mixed",
        difficulty: [t("common.easy"), t("common.medium"), t("common.hard")][index % 3],
        sampleAnswer: `Sample answer for: ${q.split('\n')[0].trim()}`,
        tips: [
          "Be specific and use examples",
          "Show your problem-solving process",
          "Highlight relevant experience"
        ]
      }));

      setQuestions(parsedQuestions);
      setCurrentQuestionIndex(0);
      setSessionStarted(false);

      toast({
        title: "Questions Generated!",
        description: `${parsedQuestions.length} perguntas de entrevista prontas.`
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const analyzeAnswer = async () => {
    if (!userAnswer.trim()) {
      toast({
        title: "No Answer Provided",
        description: "Please provide your answer before analysis.",
        variant: "destructive"
      });
      return;
    }


    try {
      const currentQuestion = questions[currentQuestionIndex];
      const prompt = `Analyze this interview answer and provide constructive feedback:

QUESTION: ${currentQuestion.question}
QUESTION TYPE: ${currentQuestion.type}
DIFFICULTY: ${currentQuestion.difficulty}

CANDIDATE'S ANSWER:
${userAnswer}

Please provide:
1. STRENGTHS: What the candidate did well
2. AREAS FOR IMPROVEMENT: Specific suggestions
3. MISSING ELEMENTS: What could be added
4. OVERALL SCORE: Rate 1-10 with explanation
5. TIPS: 3 specific tips for improvement

Be constructive and specific in your feedback.`;

      const response = await generateStream(systemPrompts.chat, prompt, undefined, undefined, 'interview');
      setFeedback(response.text);

      toast({
        title: "Answer Analyzed!",
        description: "Review your feedback to improve your responses."
      });
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer("");
      setFeedback("");
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setUserAnswer("");
      setFeedback("");
    }
  };

  const startSession = () => {
    setSessionStarted(true);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setFeedback("");
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <UserCheck className="w-8 h-8 text-ai-primary" />
          <h1 className="text-xl lg:text-3xl font-bold ai-gradient-text">Preparação para Entrevistas IA</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pratique com perguntas geradas por IA e receba feedback personalizado para arrasar na próxima entrevista
        </p>
      </div>

      {!sessionStarted ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Setup Form */}
          <Card className="ai-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Interview Setup
              </CardTitle>
              <CardDescription>
                Customize your interview practice session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">Cargo *</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                  placeholder="Engenheiro de Software, Gerente de Produto, Cientista de Dados..."
                />
              </div>

              <div>
                <Label htmlFor="company">Empresa Alvo</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="Google, Microsoft, Amazon..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobLevel">Nível do Cargo</Label>
                  <Select value={formData.jobLevel} onValueChange={(value) => handleInputChange("jobLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="industry">Setor</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="skillsRequired">Habilidades Necessárias</Label>
                <Input
                  id="skillsRequired"
                  value={formData.skillsRequired}
                  onChange={(e) => handleInputChange("skillsRequired", e.target.value)}
                  placeholder="JavaScript, React, Liderança, Resolução de Problemas..."
                />
              </div>

              <div>
                <Label htmlFor="questionTypes">Foco das Perguntas</Label>
                <Select value={formData.questionTypes} onValueChange={(value) => handleInputChange("questionTypes", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de pergunta" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customRequirements">Requisitos Especiais</Label>
                <Textarea
                  id="customRequirements"
                  value={formData.customRequirements}
                  onChange={(e) => handleInputChange("customRequirements", e.target.value)}
                  placeholder="Áreas específicas para focar, valores da empresa ou preferências de formato..."
                  rows={3}
                />
              </div>

              <Button
                onClick={generateQuestions}
                disabled={isStreaming}
                className="w-full"
              >
                {isStreaming ? "Generating Questions..." : "Generate Interview Questions"}
              </Button>
            </CardContent>
          </Card>

          {/* Questions Preview */}
          <Card className="ai-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Questions Preview
              </CardTitle>
              <CardDescription>
                {questions.length > 0 ? `${questions.length} questions ready` : "Generate questions to start practicing"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {questions.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {questions.slice(0, 5).map((q, index) => (
                      <div key={q.id} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">Q{index + 1}: {q.question}</p>
                          <Badge variant="secondary" className="text-xs">
                            {q.difficulty}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {questions.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{questions.length - 5} more questions
                      </p>
                    )}
                  </div>

                  <Button onClick={startSession} className="w-full" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Start Interview Practice
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Ready to Practice?</p>
                  <p>Preencha os detalhes do cargo e gere perguntas de entrevista personalizadas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Interview Session */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question & Answer */}
          <Card className="ai-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{currentQuestion?.type}</Badge>
                  <Badge variant={currentQuestion?.difficulty === t("common.hard") ? "destructive" :
                    currentQuestion?.difficulty === t("common.medium") ? "default" : "secondary"}>
                    {currentQuestion?.difficulty}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-lg font-medium">{currentQuestion?.question}</p>
              </div>

              <div>
                <Label htmlFor="userAnswer">Sua Resposta</Label>
                <Textarea
                  id="userAnswer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Digite sua resposta aqui... Tome seu tempo para pensar e forneça uma resposta detalhada."
                  rows={8}
                  className="min-h-[200px]"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={analyzeAnswer}
                  disabled={isStreaming || !userAnswer.trim()}
                  className="flex-1"
                >
                  {isStreaming ? "Analyzing..." : "Get Feedback"}
                </Button>
                <Button variant="outline" onClick={() => setUserAnswer("")}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next Question
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feedback & Tips */}
          <div className="space-y-4">
            <Tabs defaultValue="feedback" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="sample">Sample Answer</TabsTrigger>
              </TabsList>

              <TabsContent value="feedback">
                <Card className="ai-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      AI Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(isStreaming ? streamedText : feedback) ? (
                      <Tabs defaultValue="preview" className="w-full">
                        <div className="flex justify-end mb-2">
                          <TabsList>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                            <TabsTrigger value="edit">Edit</TabsTrigger>
                          </TabsList>
                        </div>
                        <TabsContent value="preview" className="mt-0">
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <MarkdownRenderer content={isStreaming ? streamedText : feedback} />
                          </div>
                        </TabsContent>
                        <TabsContent value="edit" className="mt-0">
                          <Textarea
                            value={isStreaming ? streamedText : feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="min-h-[200px] resize-y"
                            readOnly={isStreaming}
                          />
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        Provide your answer and click "Get Feedback" to receive personalized analysis
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sample">
                <Card className="ai-card">
                  <CardHeader>
                    <CardTitle>Resposta Modelo e Dicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Resposta Modelo:</h4>
                      <div className="bg-muted/30 p-4 rounded-lg text-sm">
                        <MarkdownRenderer content={currentQuestion?.sampleAnswer} />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Dicas Importantes:</h4>
                      <ul className="space-y-1">
                        {currentQuestion?.tips.map((tip, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-ai-primary">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Session Controls */}
            <Card className="ai-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("interview.practiceSession")}</p>
                    <p className="text-sm text-muted-foreground">
                      Progress: {currentQuestionIndex + 1}/{questions.length}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setSessionStarted(false)}>
                    <Pause className="w-4 h-4 mr-2" />
                    Encerrar Sessão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
