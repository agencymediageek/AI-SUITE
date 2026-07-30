import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { signToken, SESSION_COOKIE_OPTIONS } from '@/lib/auth';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { checkLoginRateLimit, recordLoginAttempt, resetLoginAttempts } from '@/lib/rate-limiter';

// Force dynamic — prevents Next.js from treating this route as static in production
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
        const { email: rawEmail, password, recaptchaToken } = await req.json();

        if (!rawEmail || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const email = rawEmail.toLowerCase();
        const settings = await db.getSettings();
        const enableRecaptcha = settings.metadata?.enableRecaptcha ?? false;

        // 1. Verify reCAPTCHA token if enabled
        if (enableRecaptcha) {
            const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'login', 0.5);
            if (!recaptchaResult.success) {
                return NextResponse.json({ error: recaptchaResult.error || 'reCAPTCHA verification failed' }, { status: 400 });
            }
        }

        // 2. Sliding window rate limiting
        const rateLimit = checkLoginRateLimit(email, ip);
        if (!rateLimit.allowed) {
            return NextResponse.json({
                error: `Too many login attempts. Please try again in ${Math.ceil((rateLimit.retryAfterMs || 0) / 1000)} seconds.`
            }, { status: 429 });
        }

        const user = await db.getUser(email);
        if (!user || user.status === 'disabled') {
            recordLoginAttempt(email, ip);
            await db.recordLoginAttempt(email, ip, false);
            return NextResponse.json({ error: 'Invalid credentials or account disabled' }, { status: 401 });
        }

        // 3. Password matching
        const isMatch = await bcrypt.compare(password, user.password || '');
        if (!isMatch) {
            recordLoginAttempt(email, ip);
            await db.recordLoginAttempt(email, ip, false);
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Reset rate limiter on success
        resetLoginAttempts(email, ip);
        await db.recordLoginAttempt(email, ip, true);

        // 4. Email verification check
        if (user.emailVerified === false) {
            return NextResponse.json({
                error: 'Please verify your email address before logging in.',
                requiresVerification: true,
                email: user.email
            }, { status: 403 });
        }

        // 5. 2FA Check
        if (user.twoFactorEnabled) {
            const tempToken = jwt.sign({ email: user.email, temp: true }, process.env.JWT_SECRET || 'fallback-secret-for-dev-only', { expiresIn: '5m' });
            return NextResponse.json({
                requires2FA: true,
                tempToken
            });
        }

        let role = user.role;

        // Read admin_intent cookie (read-only — safe in any context)
        try {
            const cookieStore = await cookies();
            const adminIntent = cookieStore.get('admin_intent')?.value;
            if (adminIntent === 'true') {
                role = 'admin';
                if (user.role !== 'admin') {
                    await db.saveUser({ ...user, role: 'admin' });
                }
                cookieStore.delete('admin_intent');
            }
        } catch {
            // Non-fatal: admin_intent not critical
        }

        const sessionToken = signToken({
            id: user.id,
            email: user.email,
            role,
            name: user.name,
            disabledFeatures: user.disabledFeatures || []
        });

        const tokens = await db.getTokenBalance(user.email);
        const planDetails = await db.getUserPlan(user.email);

        // Use NextResponse.cookies.set() — works reliably behind nginx SSL termination
        // (avoids the cookies() API from next/headers which can fail in proxy contexts)
        const response = NextResponse.json({
            success: true,
            user: {
                email: user.email,
                name: user.name,
                role,
                tokens: tokens.balance,
                planName: planDetails.planName,
                aiTools: planDetails.aiTools
            }
        });
        response.cookies.set('session', sessionToken, SESSION_COOKIE_OPTIONS);
        return response;

    } catch (error: any) {
        console.error('Login Error:', error?.message || error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
