import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Download, CheckCircle, Bell, MessageSquare, Zap } from 'lucide-react';

export function PluginHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-white/80">Tecnologia exclusiva — Único no mundo</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-white leading-[1.1]">
              Seu site WordPress vai começar a <span className="text-primary">trabalhar por você</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl">
              1 plugin. Uma auditoria de IA em 60 segundos. Centenas de funcionários digitais ativados. Tudo no seu painel WordPress — sem código, sem agência, sem salários.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#download"
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-base font-bold hover:glow-primary transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                Baixar Plugin Grátis
              </a>
              <a
                href="#como-funciona"
                className="flex items-center justify-center gap-2 bg-white/5 text-white border border-white/10 px-8 py-4 rounded-xl text-base font-bold hover:bg-white/10 transition-all duration-300"
              >
                Ver como funciona
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Instalação rápida</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Sem cartão de crédito</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center perspective-1000"
          >
            <div className="relative w-full max-w-[500px] aspect-[4/3] bg-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col transform rotate-y-[-10deg] rotate-x-[5deg]">
              {/* Fake WP Topbar */}
              <div className="h-8 bg-[#1d2327] w-full flex items-center px-4 border-b border-white/5">
                <div className="w-4 h-4 rounded-full bg-white/20" />
                <div className="ml-4 h-3 w-24 rounded bg-white/10" />
              </div>
              {/* Fake WP Sidebar & Content */}
              <div className="flex flex-1 overflow-hidden">
                <div className="w-12 bg-[#1d2327] border-r border-white/5 pt-4 flex flex-col gap-4 items-center">
                  <div className="w-6 h-6 rounded bg-white/10" />
                  <div className="w-6 h-6 rounded bg-primary/40 shadow-[0_0_10px_rgba(0,212,255,0.4)]" />
                  <div className="w-6 h-6 rounded bg-white/10" />
                  <div className="w-6 h-6 rounded bg-white/10" />
                </div>
                <div className="flex-1 bg-[#f0f0f1] p-6 relative">
                  <div className="h-6 w-48 bg-[#1d2327]/20 rounded mb-6" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-white rounded shadow-sm border border-[#c3c4c7]" />
                    <div className="h-24 bg-white rounded shadow-sm border border-[#c3c4c7]" />
                  </div>
                  
                  {/* Floating Notifications */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute top-8 right-[-20px] bg-white border border-[#c3c4c7] p-3 rounded-lg shadow-lg flex items-center gap-3 w-64"
                  >
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">SEO Otimizado</p>
                      <p className="text-[10px] text-gray-500">14 erros corrigidos</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2, duration: 0.5 }}
                    className="absolute top-32 left-[-10px] bg-white border border-[#c3c4c7] p-3 rounded-lg shadow-lg flex items-center gap-3 w-56 z-10"
                  >
                    <div className="bg-primary/20 p-2 rounded-full text-primary">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Prospecção Ativa</p>
                      <p className="text-[10px] text-gray-500">3 novos leads capturados</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3, duration: 0.5 }}
                    className="absolute bottom-12 right-12 bg-white border border-[#c3c4c7] p-3 rounded-lg shadow-lg flex items-center gap-3 w-60"
                  >
                    <div className="bg-secondary/20 p-2 rounded-full text-secondary">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Marketing Ativado</p>
                      <p className="text-[10px] text-gray-500">Campanha WhatsApp disparada</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}