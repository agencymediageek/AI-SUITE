import React from 'react';
import { motion } from 'framer-motion';
import { SearchCheck, Edit3, Target, MessageCircle, BarChart3, CloudCog, Smartphone, FileText, Crosshair } from 'lucide-react';

export function VirtualStaff() {
  const features = [
    {
      icon: SearchCheck,
      title: "Correção de SEO com 1 Clique",
      description: "A IA identifica e corrige títulos, meta tags, imagens e palavras-chave automaticamente."
    },
    {
      icon: Edit3,
      title: "Editor WYSIWYG Inline",
      description: "Edite qualquer texto, imagem ou seção do seu site diretamente na tela, sem entrar no painel WordPress."
    },
    {
      icon: Target,
      title: "Prospecção B2B Automática",
      description: "Robôs escaneiam sua região e enviam propostas para clientes em potencial no WhatsApp."
    },
    {
      icon: MessageCircle,
      title: "Chatbot de Vendas Ativo",
      description: "Atende visitantes, captura leads e agenda compromissos enquanto você dorme."
    },
    {
      icon: BarChart3,
      title: "Relatório de Diagnóstico de Negócios",
      description: "IA analisa seu setor e sugere as automações certas para o seu tipo de empresa."
    },
    {
      icon: CloudCog,
      title: "Backup Automático no WaasHost",
      description: "Seu site é registrado e protegido na infraestrutura da WaasHost, com histórico completo."
    },
    {
      icon: Smartphone,
      title: "Campanhas de WhatsApp",
      description: "Disparo automatizado para sua base de clientes com mensagens geradas por IA."
    },
    {
      icon: FileText,
      title: "Criação de Conteúdo",
      description: "Artigos, descrições de produtos e posts para redes sociais criados e publicados automaticamente."
    },
    {
      icon: Crosshair,
      title: "Análise da Concorrência",
      description: "Monitore os concorrentes e receba alertas sobre oportunidades de mercado."
    }
  ];

  return (
    <section id="recursos" className="py-24 bg-white/[0.02]">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Seu batalhão de funcionários digitais, <span className="text-primary">prontos 24/7</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Esqueça plugins complicados. Ative recursos inteligentes que resolvem problemas reais de vendas, marketing e manutenção.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-white/10 rounded-2xl p-8 hover:bg-white/[0.03] hover:border-white/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {feature.title}
                </h3>
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