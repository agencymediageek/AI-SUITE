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

function getMpToken(): string {
  const token = process.env["MERCADO_PAGO_ACCESS_TOKEN"];
  if (!token) throw new Error("MERCADO_PAGO_ACCESS_TOKEN not configured");
  return token;
}

/**
 * Fetch plan from DB. Always resolve plan server-side — never trust client-supplied price/name.
 */
async function getPlan(planId: string) {
  const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, planId)).limit(1);
  return plan ?? null;
}

/**
 * Activate a paid plan for a user after confirmed payment.
 * Only called after cryptographic payment verification (Stripe sig or MP API call).
 */
async function activatePlan(
  userId: number,
  planId: string,
  gateway: "mp" | "stripe",
  logger?: any
) {
  const plan = await getPlan(planId);
  if (!plan) {
    logger?.warn({ planId, userId }, "Plan not found for activation — skipping");
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

// ─── Mercado Pago: Checkout Transparente ─────────────────────────────────────
//
// Flow: frontend tokenizes card via MP JS SDK → POST token here →
//       server calls /v1/payments → activates plan immediately if approved.

router.post("/payments/mp/create-payment", requireAuth, async (req, res) => {
  try {
    const accessToken = getMpToken();
    const appBaseUrl = process.env["APP_BASE_URL"] || "https://mediageek.io";

    const {
      planId,
      token,
      installments,
      issuerId,
      paymentMethodId,
      identificationType,
      identificationNumber,
    } = req.body;

    if (!planId || !token) {
      res.status(400).json({ error: "planId e token são obrigatórios" });
      return;
    }

    const plan = await getPlan(planId);
    if (!plan) {
      res.status(404).json({ error: "Plano não encontrado" });
      return;
    }

    if (plan.price <= 0) {
      res.status(400).json({ error: "Não é possível cobrar pelo plano gratuito" });
      return;
    }

    const user = (req as any).user;
    const USD_TO_BRL = 5.5;
    const priceBrl = Math.round(parseFloat(String(plan.price)) * USD_TO_BRL * 100) / 100;

    const paymentPayload: Record<string, any> = {
      transaction_amount: priceBrl,
      token,
      description: `MediaGeek AI Suite — Plano ${plan.name}`,
      installments: Number(installments) || 1,
      payment_method_id: paymentMethodId,
      payer: {
        email: user.email,
        ...(identificationNumber
          ? {
              identification: {
                type: identificationType || "CPF",
                number: String(identificationNumber).replace(/\D/g, ""),
              },
            }
          : {}),
      },
      external_reference: `${user.id}|${plan.id}`,
      metadata: { user_id: user.id, plan_id: plan.id },
      statement_descriptor: "MEDIAGEEK AI",
      notification_url: `${appBaseUrl}/api/payments/mp/webhook`,
    };

    if (issuerId) {
      paymentPayload["issuer_id"] = Number(issuerId);
    }

    const idempotencyKey = `mp-${user.id}-${plan.id}-${Date.now()}`;

    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(paymentPayload),
    });

    const payment = (await mpRes.json()) as any;

    if (!mpRes.ok) {
      req.log.error({ status: mpRes.status, payment }, "MP Payments API error");
      const detail = payment?.cause?.[0]?.description || payment?.message || "Pagamento recusado";
      res.status(422).json({ status: "rejected", error: detail });
      return;
    }

    req.log.info(
      { paymentId: payment.id, status: payment.status, userId: user.id, planId },
      "MP payment created"
    );

    if (payment.status === "approved") {
      await activatePlan(user.id, plan.id, "mp", req.log);
      res.json({ status: "approved", planId: plan.id });
    } else if (payment.status === "in_process" || payment.status === "pending") {
      // Webhook will activate when MP confirms
      res.json({ status: "pending", paymentId: payment.id });
    } else {
      const detail = payment.status_detail || payment.status || "not_approved";
      res.status(422).json({ status: "rejected", error: mpStatusDetail(detail) });
    }
  } catch (err: any) {
    req.log.error(err, "MP create-payment error");
    res.status(500).json({ error: "Erro ao processar pagamento. Tente novamente." });
  }
});

/** Human-readable PT messages for common MP status_detail codes */
function mpStatusDetail(code: string): string {
  const map: Record<string, string> = {
    cc_rejected_insufficient_amount: "Saldo insuficiente no cartão.",
    cc_rejected_bad_filled_card_number: "Número do cartão inválido.",
    cc_rejected_bad_filled_date: "Data de vencimento inválida.",
    cc_rejected_bad_filled_security_code: "CVV inválido.",
    cc_rejected_blacklist: "Cartão recusado. Entre em contato com seu banco.",
    cc_rejected_call_for_authorize: "Ligue para seu banco para autorizar.",
    cc_rejected_card_disabled: "Cartão desabilitado. Entre em contato com seu banco.",
    cc_rejected_duplicated_payment: "Pagamento duplicado detectado.",
    cc_rejected_high_risk: "Pagamento recusado por segurança.",
    cc_rejected_invalid_installments: "Número de parcelas inválido.",
    cc_rejected_max_attempts: "Limite de tentativas atingido. Tente outro cartão.",
  };
  return map[code] || `Pagamento não aprovado (${code}). Verifique os dados e tente novamente.`;
}

// ─── Mercado Pago: Webhook (async notifications / pending → approved) ─────────

router.post("/payments/mp/webhook", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type !== "payment" || !data?.id) {
      res.status(200).json({ received: true });
      return;
    }

    const accessToken = process.env["MERCADO_PAGO_ACCESS_TOKEN"];
    if (!accessToken) {
      req.log.error("MERCADO_PAGO_ACCESS_TOKEN not set — cannot verify payment");
      res.status(200).json({ received: true });
      return;
    }

    // Verify payment with MP API — never trust webhook body alone
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!paymentRes.ok) {
      req.log.warn({ paymentId: data.id, status: paymentRes.status }, "Could not fetch MP payment");
      res.status(200).json({ received: true });
      return;
    }

    const payment = (await paymentRes.json()) as any;

    if (payment.status !== "approved") {
      req.log.info({ paymentId: data.id, status: payment.status }, "MP payment not approved — skipping");
      res.status(200).json({ received: true });
      return;
    }

    // external_reference format: "userId|planId"
    const [userIdStr, planId] = (payment.external_reference || "").split("|");
    const userId = parseInt(userIdStr, 10);

    if (!userId || !planId) {
      req.log.warn({ external_reference: payment.external_reference }, "Invalid external_reference format");
      res.status(200).json({ received: true });
      return;
    }

    const plan = await getPlan(planId);
    if (!plan) {
      req.log.warn({ planId }, "Plan in external_reference not found in DB");
      res.status(200).json({ received: true });
      return;
    }

    await activatePlan(userId, planId, "mp", req.log);
    res.status(200).json({ received: true });
  } catch (err) {
    req.log.error(err, "MP webhook error");
    res.status(200).json({ received: true }); // Always 200 to avoid MP retries
  }
});

// ─── Stripe: Create Checkout Session ────────────────────────────────────────

router.post("/payments/stripe/create-session", requireAuth, async (req, res) => {
  try {
    const stripe = getStripe();

    const { planId } = req.body;
    if (!planId) {
      res.status(400).json({ error: "planId is required" });
      return;
    }

    const plan = await getPlan(planId);
    if (!plan) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    if (plan.price <= 0) {
      res.status(400).json({ error: "Cannot create payment session for free plan" });
      return;
    }

    const user = (req as any).user;
    const appBaseUrl = process.env["APP_BASE_URL"] || "https://mediageek.io";
    const priceInCents = Math.round(parseFloat(String(plan.price)) * 100);

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
              name: `MediaGeek AI Suite — ${plan.name} Plan`,
              description: `Monthly access to ${plan.name} plan — 30 days`,
            },
          },
        },
      ],
      customer_email: user.email,
      metadata: {
        user_id: String(user.id),
        plan_id: plan.id,
        plan_name: plan.name,
      },
      success_url: `${appBaseUrl}/payment/success?gateway=stripe&plan=${plan.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBaseUrl}/payment/cancel`,
    });

    res.json({ sessionUrl: session.url, sessionId: session.id });
  } catch (err: any) {
    req.log.error(err, "Stripe create-session error");
    res.status(500).json({ error: err.message || "Could not create Stripe session" });
  }
});

// ─── Stripe: Webhook ─────────────────────────────────────────────────────────

router.post("/payments/stripe/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];

  if (!webhookSecret) {
    req.log.error("STRIPE_WEBHOOK_SECRET not configured — refusing to process webhook");
    res.status(400).json({ error: "Webhook secret not configured on server" });
    return;
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody as Buffer,
      sig as string,
      webhookSecret
    );
  } catch (err: any) {
    req.log.warn({ err: err.message }, "Stripe webhook signature verification failed");
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = parseInt(session.metadata?.user_id || "0", 10);
    const planId = session.metadata?.plan_id || "";

    if (!userId || !planId) {
      req.log.warn({ metadata: session.metadata }, "Missing user_id or plan_id in Stripe session metadata");
      res.status(200).json({ received: true });
      return;
    }

    if (session.payment_status !== "paid") {
      req.log.info({ sessionId: session.id, status: session.payment_status }, "Stripe session not paid — skipping");
      res.status(200).json({ received: true });
      return;
    }

    await activatePlan(userId, planId, "stripe", req.log);
  }

  res.status(200).json({ received: true });
});

export default router;
