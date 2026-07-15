import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Cpu, Gauge, Globe, MessageSquare, Shield, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/public-layout";

export default function Landing() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
        <div className="absolute top-0 w-full h-[500px] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none -z-10" />
        
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Version 2.0 is now live</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-8 max-w-4xl mx-auto leading-tight">
              The Command Center for <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AI-Powered</span> Workflows
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Access 100+ premium AI tools in one unified dashboard. From content generation to code review, accelerate your team's output.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/25">
                  Start Building for Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-border/50 bg-background/50 backdrop-blur">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-card/30 border-y border-border/40 relative">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to ship faster</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Stop juggling subscriptions. Get access to the best models and workflows in a single, predictable platform.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: "Multiple Models", desc: "GPT-4, Claude 3, Llama 3 - switch between top models seamlessly." },
              { icon: Zap, title: "100+ Ready Tools", desc: "Pre-configured tools for marketing, coding, design, and more." },
              { icon: Gauge, title: "High Performance", desc: "Enterprise-grade infrastructure ensures fast generation times." },
              { icon: Bot, title: "Custom Agents", desc: "Build specialized agents with your own knowledge base." },
              { icon: Globe, title: "API Access", desc: "Integrate our tools directly into your own applications." },
              { icon: Shield, title: "Enterprise Security", desc: "SOC2 compliant, zero data retention policies available." },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Users", value: "50k+" },
              { label: "AI Tools", value: "100+" },
              { label: "Generations", value: "10M+" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-extrabold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 border-y border-primary/10 -z-10" />
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to superpower your workflow?</h2>
          <p className="text-xl text-muted-foreground mb-10">Join thousands of professionals already building the future.</p>
          <Link href="/register">
            <Button size="lg" className="text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/25">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
