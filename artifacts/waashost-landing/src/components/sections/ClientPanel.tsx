import { Activity, LayoutDashboard, CreditCard, HardDrive, FileText, Settings, PlayCircle, BarChart3, Clock, CheckCircle2 } from 'lucide-react';

export function ClientPanel() {
  return (
    <section id="recursos" className="py-24 bg-card/20 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Seu painel de controle completo</h2>
          <p className="text-lg text-muted-foreground">
            Acompanhe o coração do seu site, gerencie recursos e visualize as automações em tempo real.
          </p>
        </div>

        {/* Mockup Dashboard */}
        <div className="max-w-5xl mx-auto bg-[#0E1535] border border-border rounded-xl shadow-2xl overflow-hidden mb-12 relative">
          <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
          
          {/* Dashboard Header */}
          <div className="bg-[#16203F] border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm">loja-autopeças-roma.com</h3>
                <span className="text-xs text-primary font-mono flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  Conectado e Sincronizado
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">Créditos Disponíveis</span>
              <span className="font-mono font-bold text-primary">1.847</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row h-full">
            {/* Sidebar */}
            <div className="w-full md:w-64 border-r border-border bg-[#0E1535]/80 p-4 space-y-1 z-10 hidden md:block">
              <div className="px-3 py-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                Menu
              </div>
              <div className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-md cursor-pointer border border-primary/20">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm font-medium">Dashboard</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-colors">
                <PlayCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Automações</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-colors">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Créditos</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-colors">
                <HardDrive className="w-4 h-4" />
                <span className="text-sm font-medium">Backups</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-colors">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Relatórios</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-colors mt-8">
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Configurações</span>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Main Stats */}
                <div className="lg:col-span-2 space-y-6">
                  <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Automações Ativas</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Bot Card */}
                    <div className="bg-[#16203F] border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#10B981]/20 rounded text-[#10B981]">
                            <Activity className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-sm">Prospecção B2B</span>
                        </div>
                        <span className="text-[10px] uppercase bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/20">Rodando</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Última execução: 2m atrás</span>
                        <span>-12 cr/dia</span>
                      </div>
                    </div>
                    {/* Bot Card */}
                    <div className="bg-[#16203F] border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/20 rounded text-primary">
                            <BarChart3 className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-sm">Monitor de SEO</span>
                        </div>
                        <span className="text-[10px] uppercase bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">Rodando</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Última execução: 1h atrás</span>
                        <span>-5 cr/dia</span>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-wider pt-4">Histórico Recente</h4>
                  <div className="bg-[#16203F] border border-border rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-border text-xs flex justify-between text-muted-foreground">
                      <span>Evento</span>
                      <span>Data</span>
                    </div>
                    <div className="px-4 py-3 border-b border-border text-sm flex justify-between items-center bg-card/30">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        <span>Backup Diário Concluído</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Hoje, 03:14</span>
                    </div>
                    <div className="px-4 py-3 border-b border-border text-sm flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        <span>Artigo Blog Gerado</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Ontem, 14:30</span>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Credits */}
                <div className="bg-[#16203F] border border-border rounded-lg p-5">
                  <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Consumo de Créditos</h4>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Disponível</span>
                      <span className="font-medium">1.847</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[35%] rounded-full" />
                    </div>
                    <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                      <span>35% restante</span>
                      <span>Total: 5.000</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm border-b border-border pb-2">
                      <span className="text-muted-foreground">Prospecção B2B</span>
                      <span>-145 cr</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-border pb-2">
                      <span className="text-muted-foreground">Artigos Blog</span>
                      <span>-80 cr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Auditoria SEO</span>
                      <span>-25 cr</span>
                    </div>
                  </div>

                  <button className="w-full py-2 bg-primary/10 text-primary border border-primary/30 rounded text-sm font-medium hover:bg-primary/20 transition-colors">
                    Recarregar Créditos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bullet Points */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <PlayCircle className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-medium">Acompanhe em tempo real todas as automações rodando no seu site</p>
          </div>
          <div>
            <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-medium">Recarregue créditos com 1 clique via Stripe</p>
          </div>
          <div>
            <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-medium">Acesse relatórios gerados pela IA sobre o desempenho do seu negócio</p>
          </div>
        </div>
      </div>
    </section>
  );
}
