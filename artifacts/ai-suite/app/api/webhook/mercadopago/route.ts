import { NextResponse } from 'next/server';
import { db, PaymentRecord, SubscriptionRecord } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('[MP Webhook] Received:', JSON.stringify(body));

        const { type, data, action } = body;

        // Handle payment notifications (type = "payment" or action = "payment.updated"/"payment.created")
        const paymentId = data?.id?.toString();
        const isPaymentNotification = type === 'payment' || action?.startsWith('payment.');

        if (!isPaymentNotification || !paymentId) {
            console.log('[MP Webhook] Non-payment event, ignoring:', type, action);
            return NextResponse.json({ ok: true });
        }

        const eventKey = `mp_${paymentId}`;
        const hasBeenProcessed = await db.hasWebhookEvent(eventKey);
        if (hasBeenProcessed) {
            console.log(`[MP Webhook] Event ${eventKey} already processed.`);
            return NextResponse.json({ message: 'Already processed' });
        }

        const settings = await db.getSettings();
        const accessToken = settings.mercadoPagoAccessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN;

        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            console.error('[MP Webhook] Failed to fetch payment:', paymentId);
            return NextResponse.json({ error: 'Payment fetch failed' }, { status: 400 });
        }

        const payment = await response.json();

        if (payment.status !== 'approved') {
            console.log(`[MP Webhook] Payment ${paymentId} status: ${payment.status} — skipping`);
            return NextResponse.json({ ok: true });
        }

        let userId = payment.metadata?.user_id || '';
        let userEmail = payment.metadata?.user_email || payment.payer?.email || '';
        let planId = payment.metadata?.plan_id || '';

        if (payment.external_reference) {
            try {
                const ref = JSON.parse(payment.external_reference);
                userId = userId || ref.userId || '';
                userEmail = userEmail || ref.userEmail || '';
                planId = planId || ref.planId || '';
            } catch {}
        }

        if (!userEmail || !planId) {
            console.error('[MP Webhook] Missing metadata for payment:', paymentId, { userEmail, planId });
            return NextResponse.json({ error: 'Missing payment metadata' }, { status: 400 });
        }

        const plans = await db.getPlans();
        const plan = plans.find(p => p.id === planId);
        if (!plan) {
            console.error('[MP Webhook] Plan not found:', planId);
            return NextResponse.json({ error: 'Plan not found' }, { status: 400 });
        }

        await db.executeTx(async (txClient) => {
            const paymentRecord: PaymentRecord = {
                id: eventKey,
                userId: userId || '',
                userEmail,
                planId,
                amount: plan.price,
                status: 'succeeded',
                paymentGateway: 'mercadopago',
                createdAt: new Date().toISOString(),
            };
            await db.savePayment(paymentRecord, txClient);

            await db.updateTokenBalance(userEmail, plan.tokens, 'add', `Purchase: ${plan.name}`);
            await db.clearFreeTokenExpiry(userEmail); // plano pago: remove expiração

            const subscription: SubscriptionRecord = {
                id: eventKey,
                userEmail,
                planId,
                status: 'active',
                gateway: 'mercadopago',
                createdAt: new Date().toISOString(),
            };
            await db.saveSubscription(subscription, txClient);

            await db.saveWebhookEvent(eventKey, 'mercadopago', 'payment.approved', txClient);
        });

        console.log(`[MP Webhook] ✓ Payment ${paymentId} processed for ${userEmail} — plan ${plan.name}`);
        return NextResponse.json({ ok: true });

    } catch (error: any) {
        console.error('[MP Webhook] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
