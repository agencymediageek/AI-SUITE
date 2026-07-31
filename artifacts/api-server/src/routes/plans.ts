import { Router } from "express";
import { db } from "@workspace/db";
import { plansTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// APEX CORE MEETING — canonical plan definitions
// These are upserted on every startup so price changes take effect immediately.
const APEX_PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "Para profissionais que querem reuniões com IA de forma individual",
    price: 57,
    interval: "monthly",
    tokenAllowance: 500,
    features: JSON.stringify([
      "1 participante remoto",
      "5 sessões por mês",
      "IA APEX CORE padrão",
      "Terminal ao vivo",
      "Suporte por email",
      "Gravação de sessões",
    ]),
    isPopular: false,
    woocommerceProductId: null,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para equipes que precisam de poder total com white-label",
    price: 134,
    interval: "monthly",
    tokenAllowance: 2000,
    features: JSON.stringify([
      "10 participantes remotos",
      "Sessões ilimitadas",
      "White-label completo",
      "Deploy automático",
      "Terminal ao vivo",
      "Suporte prioritário",
      "Integrações avançadas",
      "Analytics de reunião",
    ]),
    isPopular: true,
    woocommerceProductId: null,
  },
  {
    id: "single-meeting",
    name: "Sessão Única",
    description: "Experimente o poder do APEX CORE em uma reunião sem compromisso",
    price: 27,
    interval: "one-time",
    tokenAllowance: 100,
    features: JSON.stringify([
      "1 sessão completa",
      "Até 3 horas de reunião",
      "Todos os recursos inclusos",
      "Terminal ao vivo",
      "Gravação inclusa",
    ]),
    isPopular: false,
    woocommerceProductId: null,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Poder ilimitado para agências e grandes equipes",
    price: 0,
    interval: "monthly",
    tokenAllowance: 999999,
    features: JSON.stringify([
      "Participantes ilimitados",
      "Subdomínio próprio",
      "SLA 99.9%",
      "Onboarding dedicado",
      "Integrações customizadas",
      "Suporte 24/7",
      "Faturamento personalizado",
    ]),
    isPopular: false,
    woocommerceProductId: null,
  },
];

router.get("/plans", async (req, res) => {
  try {
    // Upsert all canonical plans so price changes propagate without manual DB migration
    for (const plan of APEX_PLANS) {
      await db
        .insert(plansTable)
        .values(plan)
        .onConflictDoUpdate({
          target: plansTable.id,
          set: {
            name: plan.name,
            description: plan.description,
            price: plan.price,
            interval: plan.interval,
            tokenAllowance: plan.tokenAllowance,
            features: plan.features,
            isPopular: plan.isPopular,
          },
        });
    }

    const plans = await db.select().from(plansTable);
    res.json(plans.map((p) => ({ ...p, features: JSON.parse(p.features) })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get plans" });
  }
});

// Checkout is handled via /api/payments/stripe/create-session and /api/payments/mp/create-preference
export default router;
