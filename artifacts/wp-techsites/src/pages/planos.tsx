/**
 * /planos — Página de Planos e Preços do WP TechSites
 */
import { useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetWpDashboard, getGetWpDashboardQueryKey } from '@workspace/api-client-react';
import { getWpApiHeaders } from '@/lib/api-headers';
import {
  Zap, CheckCircle2, Coins, Star, Users, Sparkles,
  MessageSquare, ArrowRight, Crown
} from 'lucide-react';

// ── Plan definitions ──────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'starter',
    label: 'Starter',
    price: 'R$ 97',
    period: '/mês',
    credits: 200,
    description: 'Perfeito para começar e validar seu site WordPress.',
    color: 'border-border',
    badgeClass: 'bg-muted text-muted-foreground',
    icon: Zap,
    featured: false,
    features: [
      '200 créditos por mês',
      'Gerador de Conteúdo SEO',
      'Logo AI',
      'Auditoria SEO',
      'Chatbot IA (básico)',
      'BrightData Scraping (50 listings/mês)',
      'Suporte por e-mail',
    ],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: 'R$ 197',
    period: '/mês',
    credits: 1000,
    description: 'Para agências e sites em crescimento acelerado.',
    color: 'border-primary',
    badgeClass: 'bg-primary text-primary-foreground',
    icon: Star,
    featured: true,
    features: [
      '1.000 créditos por mês',
      'Todos os recursos Starter',
      'Artigos SEO automáticos',
      'Editor WYSIWYG com IA',
      'Construtor de Página AI',
      'BrightData Scraping (500 listings/mês)',
      'Popular Diretório automático',
      'Chatbot IA personalizado',
      'Suporte prioritário',
    ],
  },
  {
    id: 'agency',
    label: 'Agency',
    price: 'R$ 497',
    period: '/mês',
    credits: 5000,
    description: 'Escale múltiplos clientes com automação completa.',
    color: 'border-amber-400',
    badgeClass: 'bg-amber-500 text-white',
    icon: Crown,
    featured: false,
    features: [
      '5.000 créditos por mês',
      'Todos os recursos Pro',
      'Multi-site (até 10 WordPress)',
      'BrightData Scraping ilimitado',
      'API de integração dedicada',
      'Relatórios de uso por cliente',
      'Onboarding dedicado',
      'Suporte WhatsApp',
    ],
  },
];

const WHATSAPP_NUMBER = '5511999999999'; // TODO: replace with real number
const WHATSAPP_MSG = encodeURIComponent('Olá! Gostaria de fazer upgrade do meu plano WP TechSites.');

export default function PlanosPage() {
  const [annual, setAnnual] = useState(false);

  const { data: dashboard } = useGetWpDashboard({
    query: { queryKey: getGetWpDashboardQueryKey() },
    request: { headers: getWpApiHeaders() },
  });

  const currentPlan = dashboard?.site?.plan ?? 'starter';
  const currentCredits = dashboard?.site?.credits ?? 0;

  const discount = annual ? 0.8 : 1; // 20% off annual
  const getPrice = (base: string) => {
    const num = parseFloat(base.replace('R$ ', ''));
    return `R$ ${Math.round(num * discount)}`;
  };

  return (
    <DashboardShell>
      <div className="space-y-8 animate-slide-in-up max-w-5xl">

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black text-foreground">Planos & Preços</h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Escolha o plano ideal para automatizar seu WordPress com IA.
            Todos os planos incluem acesso ao dashboard e ao plugin.
          </p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <span className={`text-sm ${!annual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Mensal</span>
            <button
              type="button"
              onClick={() => setAnnual(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${annual ? 'bg-primary' : 'bg-muted border border-border'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${annual ? 'left-6' : 'left-1'}`} />
            </button>
            <span className={`text-sm ${annual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Anual <Badge className="ml-1 text-[10px] bg-green-500/20 text-green-700 border-0">−20%</Badge>
            </span>
          </div>
        </div>

        {/* Current plan banner */}
        {currentPlan && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
            <Coins className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm text-foreground">
              Plano atual: <strong className="capitalize">{currentPlan}</strong> ·{' '}
              <span className="text-primary font-semibold">{currentCredits.toLocaleString()} créditos</span> disponíveis
            </p>
          </div>
        )}

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id;
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col border-2 transition-shadow ${plan.color} ${
                  plan.featured ? 'shadow-lg shadow-primary/10' : ''
                } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-xs px-3 shadow">
                      <Star className="w-3 h-3 mr-1" /> Mais Popular
                    </Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="outline" className="border-primary text-primary text-xs bg-background">
                      Plano Atual
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3 pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      plan.featured ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <Icon className={`w-4 h-4 ${plan.featured ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <CardTitle className="text-lg font-black">{plan.label}</CardTitle>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-foreground">{getPrice(plan.price)}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                      {annual && (
                        <span className="text-xs line-through text-muted-foreground ml-1">{plan.price}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-muted/50 w-fit">
                    <Coins className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">{plan.credits.toLocaleString()} créditos/mês</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col gap-4">
                  {/* Features */}
                  <ul className="space-y-2 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                      Plano Ativo
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${plan.featured ? '' : 'variant-outline'}`}
                      variant={plan.featured ? 'default' : 'outline'}
                      asChild
                    >
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}%20Quero%20o%20plano%20${plan.label}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        {currentPlan && PLANS.findIndex(p => p.id === currentPlan) < PLANS.findIndex(p => p.id === plan.id)
                          ? `Fazer Upgrade para ${plan.label}`
                          : `Mudar para ${plan.label}`}
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ / Notes */}
        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          {[
            { icon: Coins, title: 'O que são créditos?', text: 'Cada ferramenta consome créditos. Exemplo: gerar conteúdo = 5 créditos, auditoria SEO = 15 créditos. Renovam todo mês.' },
            { icon: Users, title: 'Posso cancelar?', text: 'Sim. Cancele a qualquer momento sem multa. Seus dados e configurações são mantidos por 30 dias após o cancelamento.' },
            { icon: Sparkles, title: 'Créditos acumulam?', text: 'Créditos não utilizados não acumulam para o mês seguinte. Planos anuais têm 20% de desconto sobre o valor mensal.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border">
              <Icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center py-4 space-y-2">
          <p className="text-sm text-muted-foreground">Precisa de um plano personalizado ou tem dúvidas?</p>
          <Button variant="outline" size="sm" asChild>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`} target="_blank" rel="noopener noreferrer">
              <MessageSquare className="w-4 h-4 mr-2" />
              Falar no WhatsApp
            </a>
          </Button>
        </div>

      </div>
    </DashboardShell>
  );
}
