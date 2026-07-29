import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Globe, LayoutTemplate, Workflow } from 'lucide-react';

const stats = [
  {
    value: "10+",
    label: "Sites em Produção",
    description: "Cloudflare Pages Edge Global",
    icon: Globe,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    value: "8",
    label: "Nichos Ativos",
    description: "Templates validados pelo mercado",
    icon: LayoutTemplate,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    value: "17",
    label: "Workers APIs",
    description: "Microsserviços rodando no edge",
    icon: Activity,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    value: "50+",
    label: "Automações N8N",
    description: "Orquestração completa de ponta a ponta",
    icon: Workflow,
    color: "text-green-400",
    bg: "bg-green-400/10",
  }
];

export function Stats() {
  return (
    <section className="py-12 border-y border-white/5 bg-white/[0.02]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-4xl md:text-5xl font-extrabold text-foreground mb-2 font-mono tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-foreground mb-1 uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
