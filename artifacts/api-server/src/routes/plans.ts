import { Router } from "express";
import { db } from "@workspace/db";
import { plansTable } from "@workspace/db";
import { requireAuth } from "../lib/auth.js";

const router = Router();

const DEFAULT_PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for individuals exploring AI tools",
    price: 9,
    interval: "monthly",
    tokenAllowance: 5000,
    features: JSON.stringify(["5,000 tokens/month", "50+ AI tools", "Email support", "API access"]),
    isPopular: false,
    woocommerceProductId: null,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For power users and growing teams",
    price: 29,
    interval: "monthly",
    tokenAllowance: 25000,
    features: JSON.stringify(["25,000 tokens/month", "100+ AI tools", "Priority support", "N8N webhook integration", "Advanced AI models", "Usage analytics"]),
    isPopular: true,
    woocommerceProductId: null,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Unlimited power for agencies and teams",
    price: 99,
    interval: "monthly",
    tokenAllowance: 999999,
    features: JSON.stringify(["Unlimited tokens", "All AI tools + agents", "Dedicated support", "Custom N8N workflows", "White-label option", "Admin dashboard", "Team management", "SLA guarantee"]),
    isPopular: false,
    woocommerceProductId: null,
  },
];

router.get("/plans", async (req, res) => {
  try {
    let plans = await db.select().from(plansTable);
    if (plans.length === 0) {
      // Seed default plans
      await db.insert(plansTable).values(DEFAULT_PLANS).onConflictDoNothing();
      plans = await db.select().from(plansTable);
    }
    res.json(plans.map((p) => ({ ...p, features: JSON.parse(p.features) })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get plans" });
  }
});

router.post("/plans/subscribe", requireAuth, async (req, res) => {
  try {
    const { planId } = req.body;
    const [plan] = await db.select().from(plansTable).where((p: any) => p.id.eq(planId)).limit(1);

    // In a real app, this would create a WooCommerce/Stripe checkout session
    // For now, return a mock checkout URL
    const checkoutUrl = `https://your-wordpress-site.com/checkout?plan=${planId}&token=${Date.now()}`;

    res.json({
      success: true,
      checkoutUrl,
      message: plan ? `Redirecting to checkout for ${plan.name} plan` : "Redirecting to checkout",
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to initiate subscription" });
  }
});

export default router;
