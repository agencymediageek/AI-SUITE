import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const templates = [
  { name: "SaaS Tech", category: "Software", color: "from-blue-600/20 to-cyan-600/20" },
  { name: "Dentista / Médico", category: "Saúde", color: "from-teal-600/20 to-emerald-600/20" },
  { name: "Marketing Agency", category: "B2B", color: "from-purple-600/20 to-pink-600/20" },
  { name: "Fitness & Gym", category: "Esportes", color: "from-orange-600/20 to-red-600/20" },
  { name: "E-commerce", category: "Varejo", color: "from-indigo-600/20 to-blue-600/20" },
  { name: "Real Estate", category: "Imóveis", color: "from-amber-600/20 to-yellow-600/20" },
  { name: "Mokha Café", category: "Gastronomia", color: "from-stone-600/20 to-neutral-600/20" },
  { name: "Portfolio One-page", category: "Pessoal", color: "from-rose-600/20 to-fuchsia-600/20" },
];

export function Templates() {
  return (
    <section id="templates" className="py-24 bg-card border-y border-white/5 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-secondary tracking-widest uppercase mb-3">8 Nichos Validados</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Comece sem partir do zero
            </h3>
            <p className="text-lg text-muted-foreground">
              Templates otimizados para conversão com copy e estrutura já definidos. 
              Gere o site do seu cliente com dados reais via IA em menos de 3 minutos.
            </p>
          </div>
          <button className="shrink-0 flex items-center gap-2 text-white font-medium hover:text-primary transition-colors pb-2">
            Ver todos os templates
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group cursor-pointer block"
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 border border-white/10 bg-background">
                {/* Simulated Template Preview */}
                <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-30 group-hover:opacity-50 transition-opacity`} />
                <div className="absolute inset-x-0 top-0 h-8 bg-black/40 border-b border-white/10 flex items-center px-3 gap-1.5 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                </div>
                <div className="absolute inset-0 pt-8 p-4 flex flex-col gap-3">
                  <div className="w-1/2 h-4 bg-white/20 rounded" />
                  <div className="w-3/4 h-2 bg-white/10 rounded" />
                  <div className="w-2/3 h-2 bg-white/10 rounded" />
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <div className="h-16 bg-white/5 rounded border border-white/5" />
                    <div className="h-16 bg-white/5 rounded border border-white/5" />
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <span className="bg-black/50 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2">
                    Visualizar <ExternalLink className="w-4 h-4" />
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary font-bold mb-1 tracking-wider uppercase">{template.category}</div>
                <h4 className="text-white font-bold text-lg group-hover:text-primary transition-colors">{template.name}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
