import React from 'react';
import { motion } from 'framer-motion';
import { Bot, CloudLightning, GitMerge, MousePointer2, PaintBucket, ShieldCheck } from 'lucide-react';

const features = [
  {
    title: "Editor WYSIWYG Inteligente",
    description: "Seus clientes editam o site visualmente sem tocar em código. Já servindo clientes reais (agências, dentistas, cafés e imobiliárias).",
    icon: MousePointer2,
  },
  {
    title: "Deploy Automático via GitHub",
    description: "GitHub Actions configurado por padrão. Cada alteração dispara um build rápido e seguro diretamente para o Cloudflare Pages.",
    icon: GitMerge,
  },
  {
    title: "Conteúdo Gerado por IA",
    description: "Integração nativa com Google Gemini. Crie copy persuasiva para qualquer nicho em segundos, baseada no briefing do cliente.",
    icon: Bot,
  },
  {
    title: "Edge Global Cloudflare",
    description: "Infraestrutura enterprise-grade. Seus sites rodam nos servidores edge da Cloudflare para latência zero em qualquer lugar do mundo.",
    icon: CloudLightning,
  },
  {
    title: "Templates White-label",
    description: "Sua marca, seus sites. Entregue valor aos seus clientes usando nosso ecossistema sob o domínio e marca da sua agência.",
    icon: PaintBucket,
  },
  {
    title: "Automação via N8N",
    description: "Orquestre leads, e-mails e CRMs perfeitamente. Mais de 50 automações ativas conectando as páginas dos seus clientes aos processos de negócio.",
    icon: ShieldCheck,
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-16">
          <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Infraestrutura Real</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Stack moderno desenhado para <br className="hidden md:block"/>
            <span className="text-gradient-primary">escalabilidade absurda</span>
          </h3>
          <p className="text-lg text-muted-foreground">
            Não é só um construtor de sites. É uma plataforma completa de operações WaaS 
            que tira a dor de cabeça da hospedagem, manutenção e criação de conteúdo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-card border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:text-primary transition-all duration-300 text-white">
                  <Icon className="w-6 h-6" />
                </div>
                
                <h4 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h4>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
