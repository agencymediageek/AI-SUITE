import { SystemSettings } from '@/lib/db';
import { StripeGateway } from './stripe';
import { PayPalGateway } from './paypal';
import { FlutterwaveGateway } from './flutterwave';
import { RazorpayGateway } from './razorpay';
import { PaystackGateway } from './paystack';
import { MercadoPagoGateway } from './mercadopago';

export interface CheckoutParams {
    planName: string;
    planId: string;
    price: number;
    tokens: number;
    currency: string;
    customerEmail: string;
    userId: string;
    successUrl: string;
    cancelUrl: string;
}

export interface CheckoutResult {
    url: string;
    sessionId: string;
}

export interface VerifyResult {
    paid: boolean;
    sessionId: string;
    userId?: string;
    userEmail?: string;
    planId?: string;
    providerStatus?: string;
    error?: string;
    recoveryUrl?: string;
}

export interface PaymentGateway {
    readonly name: string;
    createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
    verifyPayment(sessionId: string, payerId?: string): Promise<VerifyResult>;
}

export function getGateway(settings: SystemSettings): PaymentGateway {
    return getGatewayByName(settings.paymentGateway || 'stripe', settings);
}

export function getGatewayByName(name: string, settings: SystemSettings): PaymentGateway {
    switch (name) {
        case 'stripe':
            return new StripeGateway(settings);
        case 'paypal':
            return new PayPalGateway(settings);
        case 'flutterwave':
            return new FlutterwaveGateway(settings);
        case 'razorpay':
            return new RazorpayGateway(settings);
        case 'paystack':
            return new PaystackGateway(settings);
        case 'mercadopago':
            return new MercadoPagoGateway(settings);
        default:
            throw new Error(`Unsupported payment gateway: ${name}`);
    }
}

export function isMercadoPagoAvailable(settings: SystemSettings): boolean {
    return !!(settings.mercadoPagoAccessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN || settings.metadata?.mercadoPagoEnabled);
}
