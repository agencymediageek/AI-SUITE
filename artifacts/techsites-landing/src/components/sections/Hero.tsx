import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Sparkles, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>O futuro das agências digitais</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.1]"
          >
            Crie, publique e escale <br className="hidden md:block" />
            com a <span className="text-gradient-primary glow-text">velocidade da IA</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            A plataforma WaaS definitiva para agências modernas. 
            Automação completa do briefing ao deploy em minutos com Cloudflare Pages, N8N e IA Generativa.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a 
              href="#pricing" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-base font-bold hover:glow-primary transition-all duration-300"
            >
              Iniciar Teste Gratuito
              <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="#demo" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-white/10 transition-all duration-300"
            >
              <Code2 className="w-5 h-5" />
              Ver Demonstração
            </a>
          </motion.div>
        </div>

        {/* Dashboard Preview mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 mx-auto max-w-5xl"
        >
          <div className="relative rounded-2xl md:rounded-[2rem] bg-[#0A0F1C]/80 border border-white/10 backdrop-blur-sm p-2 md:p-4 shadow-2xl shadow-primary/20">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-20 rounded-[inherit] pointer-events-none" />
            
            {/* Browser Header */}
            <div className="flex items-center gap-2 px-4 pb-4 border-b border-white/5 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto bg-white/5 rounded-md px-4 py-1 text-xs text-white/40 font-mono flex items-center gap-2">
                app.techsites.ai <Zap className="w-3 h-3 text-primary" />
              </div>
            </div>

            {/* App Content Fake */}
            <div className="grid grid-cols-12 gap-4 h-[400px] md:h-[600px] overflow-hidden">
              <div className="col-span-3 hidden md:flex flex-col gap-2 border-r border-white/5 pr-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-10 rounded-lg ${i === 1 ? 'bg-primary/20 border border-primary/30' : 'bg-white/5'} flex items-center px-3 gap-3`}>
                    <div className={`w-4 h-4 rounded ${i === 1 ? 'bg-primary' : 'bg-white/20'}`} />
                    <div className="h-2 w-20 bg-white/20 rounded" />
                  </div>
                ))}
              </div>
              <div className="col-span-12 md:col-span-9 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="h-6 w-48 bg-white/10 rounded" />
                  <div className="h-8 w-24 bg-primary/80 rounded-md" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                      <div className="h-3 w-16 bg-white/20 rounded" />
                      <div className="h-6 w-24 bg-white/40 rounded" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-4 mt-2 relative overflow-hidden">
                   <div className="absolute top-4 right-4 flex gap-2">
                     <div className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-mono">DEPLOYED</div>
                   </div>
                   <div className="h-4 w-32 bg-white/20 rounded mb-6" />
                   <div className="space-y-3">
                     {[1, 2, 3, 4].map((i) => (
                       <div key={i} className="flex items-center gap-4">
                         <div className="h-8 w-8 rounded-full bg-white/10" />
                         <div className="flex-1 h-2 bg-white/10 rounded" />
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
