import { Router } from "express";
import Stripe from "stripe";
import { requireAuth } from "../lib/auth.js";
import { db } from "@workspace/db";
import { usersTable, plansTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

function getStripe(): Stripe {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

/** Activate a paid plan for a user after confirmed payment */
async function activatePlan(
  userId: number,
  planId: string,
  gateway: "mp" | "stripe",
  logger?: any
) {
  const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, planId)).limit(1);
  if (!plan) {
    logger?.warn({ planId, userId }, "Plan not found for activation");
    return;
  }

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1); // 30-day activation

  await db
    .update(usersTable)
    .set({
      planId: plan.id,
      planName: plan.name,
      tokenBalance: plan.tokenAllowance,
      planExpiresAt: expiresAt,
      paymentGateway: gateway,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, userId));

  logger?.info({ userId, planId: plan.id, planName: plan.name, gateway }, "Plan activated");
}

// ─── Mercado Pago: Create Preference ────────────────────────────────────────

router.post("/payments/mp/create-preference", requireAuth, async (req, res) => {
  try {
    const accessToken = process.env["MERCADO_PAGO_ACCESS_TOKEN"];
    if (!accessToken) {
      res.status(500).json({ error: "Mercado Pago not configured. Please set MERCADO_PAGO_ACCESS_TOKEN." });
      return;
    }

    const { planId, planName, priceUsd } = req.body;
    if (!planId || !planName || !priceUsd) {
      res.status(400).json({ error: "planId, planName and priceUsd are required" });
      return;
    }

    const user = (req as any).user;
    const USD_TO_BRL = 5.5;
    const priceBrl = Math.round(priceUsd * USD_TO_BRL * 100) / 100;
    const appBaseUrl = process.env["APP_BASE_URL"] || "https://aisuite.mediageek.io";

    const preference = {
      items: [
        {
          id: planId,
          title: `MediaGeek AI Suite — Plano ${planName}`,
          description: `Acesso ao plano ${planName} da MediaGeek AI Suite`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: priceBrl,
        },
      ],
      payer: { email: user.email, name: user.name },
      back_urls: {
        success: `${appBaseUrl}/payment/success?gateway=mp&plan=${planId}`,
        failure: `${appBaseUrl}/payment/cancel`,
        pending: `${appBaseUrl}/payment/success?gateway=mp&plan=${planId}&status=pending`,
      },
      auto_return: "approved",
      external_reference: `${user.id}|${planId}`,
      metadata: { user_id: user.id, plan_id: planId },
      statement_descriptor: "MEDIAGEEK AI",
      expires: false,
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!mpRes.ok) {
      const err = await mpRes.text();
      req.log.error({ err, status: mpRes.status }, "Mercado Pago API error");
      res.status(502).json({ error: "Failed to create payment preference. Please try again." });
      return;
    }

    const data = await mpRes.json() as any;
    res.json({
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point,
      preferenceId: data.id,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Payment creation failed" });
  }
});

// ─── Mercado Pago: Webhook ───────────────────────────────────────────────────

router.post("/payments/mp/webhook", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type !== "payment" || !data?.id) {
      res.status(200).json({ received: true });
      return;
    }

    const accessToken = process.env["MERCADO_PAGO_ACCESS_TOKEN"];
    if (!accessToken) {
      res.status(500).json({ error: "MP not configured" });
      return;
    }

    // Verify payment with MP API
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!paymentRes.ok) {
      req.log.warn({ paymentId: data.id }, "Could not fetch MP payment");
      res.status(200).json({ received: true });
      return;
    }

    const payment = await paymentRes.json() as any;

    if (payment.status !== "approved") {
      req.log.info({ paymentId: data.id, status: payment.status }, "MP payment not approved, skipping");
      res.status(200).json({ received: true });
      return;
    }

    // external_reference format: "userId|planId"
    const [userIdStr, planId] = (payment.external_reference || "").split("|");
    const userId = parseInt(userIdStr, 10);

    if (!userId || !planId) {
      req.log.warn({ external_reference: payment.external_reference }, "Invalid external_reference");
      res.status(200).json({ received: true });
      return;
    }

    await activatePlan(userId, planId, "mp", req.log);
    res.status(200).json({ received: true });
  } catch (err) {
    req.log.error(err, "MP webhook error");
    res.status(200).json({ received: true }); // Always 200 to MP to avoid retries
  }
});

// ─── Stripe: Create Checkout Session ────────────────────────────────────────

router.post("/payments/stripe/create-session", requireAuth, async (req, res) => {
  try {
    const stripe = getStripe();
    const { planId, planName, priceUsd } = req.body;

    if (!planId || !planName || !priceUsd) {
      res.status(400).json({ error: "planId, planName and priceUsd are required" });
      return;
    }

    const user = (req as any).user;
    const appBaseUrl = process.env["APP_BASE_URL"] || "https://aisuite.mediageek.io";
    const priceInCents = Math.round(parseFloat(String(priceUsd)) * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: priceInCents,
            product_data: {
              name: `MediaGeek AI Suite — ${planName} Plan`,
              description: `Monthly access to ${planName} plan — 30 days`,
            },
          },
        },
      ],
      customer_email: user.email,
      metadata: {
        user_id: String(user.id),
        plan_id: planId,
        plan_name: planName,
      },
      success_url: `${appBaseUrl}/payment/success?gateway=stripe&plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBaseUrl}/payment/cancel`,
    });

    res.json({ sessionUrl: session.url, sessionId: session.id });
  } catch (err: any) {
    req.log.error(err, "Stripe create-session error");
    res.status(500).json({ error: err.message || "Could not create Stripe session" });
  }
});

// ─── Stripe: Webhook ─────────────────────────────────────────────────────────

// Raw body needed for Stripe signature verification — mount before JSON middleware
router.post(
  "/payments/stripe/webhook",
  // express.raw is applied globally for this route via rawBody middleware in server setup
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];

    if (!webhookSecret) {
      req.log.warn("STRIPE_WEBHOOK_SECRET not set — skipping signature check");
      // In dev without secret, parse body directly
      const body = req.body;
      await handleStripeEvent(body, req.log);
      res.status(200).json({ received: true });
      return;
    }

    let event: Stripe.Event;
    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody || req.body,
        sig as string,
        webhookSecret
      );
    } catch (err: any) {
      req.log.warn({ err: err.message }, "Stripe webhook signature verification failed");
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    await handleStripeEvent(event, req.log);
    res.status(200).json({ received: true });
  }
);

async function handleStripeEvent(event: Stripe.Event | any, logger?: any) {
  if (event.type !== "checkout.session.completed") return;

  const session = event.data?.object as Stripe.Checkout.Session;
  const userId = parseInt(session?.metadata?.user_id || "0", 10);
  const planId = session?.metadata?.plan_id || "";

  if (!userId || !planId) {
    logger?.warn({ metadata: session?.metadata }, "Missing user_id or plan_id in Stripe metadata");
    return;
  }

  if (session.payment_status !== "paid") {
    logger?.info({ sessionId: session.id, status: session.payment_status }, "Stripe session not paid, skipping");
    return;
  }

  await activatePlan(userId, planId, "stripe", logger);
}

export default router;
