import { PaymentGateway, CheckoutParams, CheckoutResult, VerifyResult } from './gateway-factory';
import { SystemSettings } from '@/lib/db';


/**
 * Fetches live USD→BRL exchange rate.
 * Falls back to 5.5 if the API is unavailable (conservative rate).
 */
async function getUsdToBrlRate(): Promise<number> {
    try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) throw new Error('Rate API error');
        const data = await res.json();
        const rate = data?.rates?.BRL;
        if (typeof rate === 'number' && rate > 1) return rate;
        throw new Error('Invalid rate');
    } catch {
        console.warn('[MercadoPago] Could not fetch USD/BRL rate — using fallback 5.5');
        return 5.5;
    }
}

export class MercadoPagoGateway implements PaymentGateway {
    readonly name = 'mercadopago';
    private accessToken: string;

    constructor(private settings: SystemSettings) {
        const token = settings.mercadoPagoAccessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN;
        if (!token) throw new Error('Mercado Pago access token is not configured.');
        this.accessToken = token;
    }

    async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
        const currencyId = "BRL"; // Mercado Pago Brazil accounts require BRL
        const baseUrl = this.getBaseUrl(params.successUrl);

        // Convert USD price to BRL for Mercado Pago (Brazilian accounts charge in BRL)
        const usdToBrl = await getUsdToBrlRate();
        const usdToBrlPrice = Math.round(params.price * usdToBrl * 100) / 100;
        console.log(`[MercadoPago] USD ${params.price} → BRL ${usdToBrlPrice} (rate: ${usdToBrl})`);

        const body = {
            items: [{
                id: params.planId,
                title: `${this.settings?.metadata?.siteName || 'AI Suite'} - ${params.planName}`,
                description: `${params.tokens.toLocaleString()} tokens`,
                quantity: 1,
                currency_id: currencyId,
                unit_price: usdToBrlPrice,
            }],
            payer: { email: params.customerEmail },
            back_urls: {
                success: `${params.successUrl}&mp_status=approved`,
                failure: params.cancelUrl,
                pending: `${params.successUrl}&mp_status=pending`,
            },
            auto_return: 'approved',
            notification_url: `${baseUrl}/api/webhook/mercadopago`,
            external_reference: JSON.stringify({
                userId: params.userId,
                userEmail: params.customerEmail,
                planId: params.planId,
            }),
            metadata: {
                user_id: params.userId,
                user_email: params.customerEmail,
                plan_id: params.planId,
            },
        };

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`Mercado Pago error: ${err.message || JSON.stringify(err)}`);
        }

        const data = await response.json();
        return { url: data.init_point, sessionId: data.id };
    }

    async verifyPayment(paymentId: string): Promise<VerifyResult> {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` },
        });

        if (!response.ok) {
            return { paid: false, sessionId: paymentId, error: 'Payment not found in Mercado Pago' };
        }

        const payment = await response.json();
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

        return {
            paid: payment.status === 'approved',
            sessionId: payment.id?.toString() || paymentId,
            userId,
            userEmail,
            planId,
            providerStatus: payment.status,
        };
    }

    private getBaseUrl(url: string): string {
        try {
            const parsed = new URL(url);
            return `${parsed.protocol}//${parsed.host}`;
        } catch {
            return process.env.NEXT_PUBLIC_APP_URL || 'https://mediageek.io';
        }
    }
}
