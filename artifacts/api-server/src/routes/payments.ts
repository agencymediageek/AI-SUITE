import { Router } from "express";
import Stripe from "stripe";
import crypto from "crypto";
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
      description: `APEX CORE MEETING — Plano ${plan.name}`,
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

// MP sends a GET to validate the endpoint when first registered
router.get("/payments/mp/webhook", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.post("/payments/mp/webhook", async (req, res) => {
  try {
    // ── Signature verification ──────────────────────────────────────────────
    // MP sends: x-signature: ts=<unix_ts>,v1=<hmac_sha256>
    // Manifest: id:<notification_id>;request-date:<ts>;
    const webhookSecret = process.env["MERCADO_PAGO_WEBHOOK_SECRET"];
    if (webhookSecret) {
      const xSig = req.headers["x-signature"] as string | undefined;
      const notifId = (req.query["id"] as string) || req.body?.data?.id;

      if (xSig && notifId) {
        const ts = xSig.split(",").find((p) => p.startsWith("ts="))?.split("=")[1];
        const v1 = xSig.split(",").find((p) => p.startsWith("v1="))?.split("=")[1];
        if (ts && v1) {
          const manifest = `id:${notifId};request-date:${ts};`;
          const expected = crypto.createHmac("sha256", webhookSecret).update(manifest).digest("hex");
          if (expected !== v1) {
            req.log.warn({ notifId }, "MP webhook signature mismatch — ignoring");
            res.status(200).json({ received: true }); // 200 to stop retries
            return;
          }
        }
      }
    }

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

// ─── Mercado Pago: Checkout Pro (preference redirect) ────────────────────────
//
// Simpler than transparent checkout: create a preference → redirect user to MP
// hosted checkout page → webhook handles activation.

router.post("/payments/mp/create-preference", requireAuth, async (req, res) => {
  try {
    const accessToken = getMpToken();
    const appBaseUrl = process.env["APP_BASE_URL"] || "https://apex.techsites.ai";

    const { planId } = req.body;
    if (!planId) {
      res.status(400).json({ error: "planId is required" });
      return;
    }

    const plan = await getPlan(planId);
    if (!plan) {
      res.status(404).json({ error: "Plano não encontrado" });
      return;
    }

    if (plan.price <= 0) {
      res.status(400).json({ error: "Plano não possui valor de cobrança" });
      return;
    }

    const user = (req as any).user;
    const USD_TO_BRL = 5.5; // fallback rate; live rate applied on frontend display
    const priceBrl = Math.round(parseFloat(String(plan.price)) * USD_TO_BRL * 100) / 100;

    const preferencePayload = {
      items: [
        {
          id: plan.id,
          title: `APEX CORE MEETING — Plano ${plan.name}`,
          description: plan.description || `Acesso ao plano ${plan.name} por 30 dias`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: priceBrl,
        },
      ],
      payer: { email: user.email },
      external_reference: `${user.id}|${plan.id}`,
      back_urls: {
        success: `${appBaseUrl}/payment/success?gateway=mp&plan=${plan.id}`,
        failure: `${appBaseUrl}/payment/cancel`,
        pending: `${appBaseUrl}/payment/success?gateway=mp&plan=${plan.id}&status=pending`,
      },
      auto_return: "approved",
      notification_url: `${appBaseUrl}/api/payments/mp/webhook`,
      statement_descriptor: "APEX CORE",
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferencePayload),
    });

    const preference = (await mpRes.json()) as any;

    if (!mpRes.ok) {
      req.log.error({ status: mpRes.status, preference }, "MP Preference API error");
      res.status(422).json({ error: "Não foi possível criar preferência de pagamento" });
      return;
    }

    req.log.info(
      { preferenceId: preference.id, userId: user.id, planId },
      "MP preference created"
    );

    res.json({
      checkoutUrl: preference.init_point,
      sandboxUrl: preference.sandbox_init_point,
      preferenceId: preference.id,
    });
  } catch (err: any) {
    req.log.error(err, "MP create-preference error");
    res.status(500).json({ error: "Erro ao criar sessão de pagamento. Tente novamente." });
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
    const appBaseUrl = process.env["APP_BASE_URL"] || "https://apex.techsites.ai";
    const priceInCents = Math.round(parseFloat(String(plan.price)) * 100);

    // Single-meeting uses one-time payment; monthly/yearly plans use subscription
    const isOneTime = plan.interval === "one-time" || plan.interval === "single-meeting";
    const mode: "payment" | "subscription" = isOneTime ? "payment" : "subscription";

    // Get or create Stripe customer (needed for subscription management)
    let stripeCustomerId: string | undefined = user.stripeCustomerId ?? undefined;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { user_id: String(user.id) },
      });
      stripeCustomerId = customer.id;
      await db
        .update(usersTable)
        .set({ stripeCustomerId: customer.id })
        .where(eq(usersTable.id, user.id));
      req.log.info({ userId: user.id, customerId: customer.id }, "Stripe customer created");
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: priceInCents,
            ...(mode === "subscription" ? { recurring: { interval: "month" } } : {}),
            product_data: {
              name: `APEX CORE MEETING — ${plan.name}`,
              description: isOneTime
                ? `Single session access · ${plan.tokenAllowance.toLocaleString()} tokens`
                : `Monthly subscription · ${plan.tokenAllowance.toLocaleString()} tokens/month`,
            },
          },
        },
      ],
      metadata: {
        user_id: String(user.id),
        plan_id: plan.id,
        plan_name: plan.name,
      },
      success_url: `${appBaseUrl}/payment/success?gateway=stripe&plan=${plan.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBaseUrl}/payment/cancel`,
    };

    // Embed user/plan metadata into subscription so webhook can retrieve it on renewal
    if (mode === "subscription") {
      sessionParams.subscription_data = {
        metadata: {
          user_id: String(user.id),
          plan_id: plan.id,
          plan_name: plan.name,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    req.log.info({ userId: user.id, planId, mode, sessionId: session.id }, "Stripe session created");
    res.json({ sessionUrl: session.url, sessionId: session.id });
  } catch (err: any) {
    req.log.error(err, "Stripe create-session error");
    res.status(500).json({ error: err.message || "Could not create Stripe session" });
  }
});

// ─── Stripe: Cancel Subscription ─────────────────────────────────────────────

router.post("/payments/stripe/cancel", requireAuth, async (req, res) => {
  try {
    const stripe = getStripe();
    const user = (req as any).user;

    if (!user.stripeSubscriptionId) {
      res.status(400).json({ error: "No active Stripe subscription found" });
      return;
    }

    // Cancel at period end — user keeps access until billing period ends
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    req.log.info({ userId: user.id, subId: user.stripeSubscriptionId }, "Stripe subscription scheduled for cancellation");
    res.json({ success: true, message: "Subscription will cancel at end of billing period" });
  } catch (err: any) {
    req.log.error(err, "Stripe cancel error");
    res.status(500).json({ error: err.message || "Could not cancel subscription" });
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

  req.log.info({ eventType: event.type, eventId: event.id }, "Stripe webhook received");

  try {
    if (event.type === "checkout.session.completed") {
      // ── Initial checkout (one-time or first subscription payment) ──────────
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = parseInt(session.metadata?.user_id || "0", 10);
      const planId = session.metadata?.plan_id || "";

      if (!userId || !planId) {
        req.log.warn({ metadata: session.metadata }, "Missing user_id or plan_id in session metadata");
        res.status(200).json({ received: true });
        return;
      }

      if (session.payment_status !== "paid") {
        req.log.info({ sessionId: session.id, status: session.payment_status }, "Session not paid — skipping");
        res.status(200).json({ received: true });
        return;
      }

      // Activate plan and persist subscription ID (for recurring plans)
      await activatePlan(userId, planId, "stripe", req.log);

      if (session.subscription) {
        await db
          .update(usersTable)
          .set({ stripeSubscriptionId: session.subscription as string })
          .where(eq(usersTable.id, userId));
      }

    } else if (event.type === "invoice.payment_succeeded") {
      // ── Monthly renewal ──────────────────────────────────────────────────────
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string | undefined;

      // Skip initial invoice (already handled by checkout.session.completed)
      if (!subscriptionId || (invoice as any).billing_reason === "subscription_create") {
        res.status(200).json({ received: true });
        return;
      }

      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = parseInt(subscription.metadata?.user_id || "0", 10);
      const planId = subscription.metadata?.plan_id || "";

      if (!userId || !planId) {
        req.log.warn({ subscriptionId }, "Missing metadata on subscription for renewal");
        res.status(200).json({ received: true });
        return;
      }

      await activatePlan(userId, planId, "stripe", req.log);
      req.log.info({ userId, planId, subscriptionId }, "Subscription renewed — tokens credited");

    } else if (event.type === "customer.subscription.deleted") {
      // ── Subscription cancelled/expired ────────────────────────────────────
      const subscription = event.data.object as Stripe.Subscription;
      const userId = parseInt(subscription.metadata?.user_id || "0", 10);

      if (userId) {
        await db
          .update(usersTable)
          .set({
            planId: null,
            planName: null,
            planExpiresAt: null,
            paymentGateway: null,
            stripeSubscriptionId: null,
          })
          .where(eq(usersTable.id, userId));
        req.log.info({ userId, subscriptionId: subscription.id }, "Subscription cancelled — plan cleared");
      }

    } else if (event.type === "invoice.payment_failed") {
      // ── Payment failed — log for monitoring, no action on plan yet ────────
      const invoice = event.data.object as Stripe.Invoice;
      req.log.warn({ invoiceId: invoice.id, customerId: invoice.customer }, "Stripe invoice payment failed");
    }
  } catch (err: any) {
    req.log.error(err, "Error processing Stripe webhook event");
    // Still return 200 to prevent Stripe retries for non-recoverable errors
  }

  res.status(200).json({ received: true });
});

export default router;
