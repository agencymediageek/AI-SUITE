import { Router } from "express";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// Create a Mercado Pago Checkout Pro preference
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

    // Convert USD → BRL (approximate rate)
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
      payer: {
        email: user.email,
        name: user.name,
      },
      back_urls: {
        success: `${appBaseUrl}/dashboard?payment=success&plan=${planId}`,
        failure: `${appBaseUrl}/pricing?payment=failed`,
        pending: `${appBaseUrl}/dashboard?payment=pending`,
      },
      auto_return: "approved",
      external_reference: `${user.id}|${planId}`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
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

    // Return both sandbox (for testing) and production init points
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

export default router;
