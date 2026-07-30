import { Link } from 'wouter';
import { MatrixGlobe } from '@/components/meeting/MatrixGlobe';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToTop } from '@/components/ui/back-to-top';
import { Navbar } from '@/components/layout/Navbar';
import { CheckCircle2, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { LandingFooter } from '@/pages/landing';

const values = [
  {
    icon: Zap,
    title: 'Execução acima de tudo',
    description:
      'Não acreditamos em reuniões que geram apenas listas de tarefas. Cada sessão com o APEX CORE deve terminar com entregas reais no mundo.',
  },
  {
    icon: Shield,
    title: 'Segurança como fundamento',
    description:
      'Construímos com criptografia end-to-end desde o primeiro dia. Seus dados de reunião nunca são usados para treinar modelos externos.',
  },
  {
    icon: Globe,
    title: 'Acessível para qualquer empresa',
    description:
      'Do founder solo ao C-Suite de uma multinacional. O APEX CORE escala com você sem complexidade desnecessária.',
  },
];

export default function Sobre() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <Navbar />
      <div className="scan-lines fixed inset-0 pointer-events-none z-0" />

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="flex justify-center mb-8">
            <MatrixGlobe size={120} isProcessing={false} />
          </div>
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
            <span className="text-xs font-mono text-primary tracking-widest uppercase">Sobre o APEX CORE</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            <span className="text-foreground">Construímos a IA que</span>
            <br />
            <span className="matrix-text">faz acontecer</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            O APEX CORE nasceu para transformar reuniões em entregas concretas. Não mais promessas — apenas execução.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-foreground">
            Nossa <span className="matrix-text">história</span>
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Nascemos da frustração de executivos</strong> que saíam de reuniões com listas mas sem entregas. Toda semana, as mesmas promessas: "vamos colocar em produção essa semana", "o site está pronto na sexta", "o documento será enviado hoje."
            </p>
            <p>
              Percebemos que o problema não era a vontade das pessoas — era a ausência de um agente capaz de transformar intenção em ação imediata. Assim surgiu o APEX CORE MEETING.
            </p>
            <p>
              Uma plataforma onde a IA não apenas assiste suas reuniões, mas <strong className="text-foreground">executa enquanto você fala</strong>. Deploy de sites, configuração de DNS, publicação de documentos — tudo acontece antes da reunião terminar.
            </p>
            <p>
              Hoje, equipes de C-Suite ao redor do Brasil usam o APEX CORE para operar na velocidade das máquinas. Sem fidelidade, sem complexidade — só entrega.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Nossos <span className="matrix-text">valores</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <Card key={i} className="bg-card/50 border-primary/20 p-6 hover:border-primary/50 transition-all">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 blur-[100px] pointer-events-none" />
            <div className="relative bg-card/60 border border-primary/30 rounded-2xl p-10 sm:p-16 text-center terminal-glow">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
                Nossa <span className="matrix-text">missão</span>
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Tornar cada reunião executiva uma máquina de entrega. Zero burocracia, zero espera — apenas resultados reais antes da chamada terminar.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-8">
                {['Entrega > Promessa', 'IA como parceira de negócio', 'Confiança por transparência'].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {item}
                  </span>
                ))}
              </div>
              <Button
                size="lg"
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow"
              >
                <Link href="/register">
                  Começar agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
      <BackToTop />
    </div>
  );
}
