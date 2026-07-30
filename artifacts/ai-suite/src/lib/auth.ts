import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-secret-for-dev-only';

export async function createSession(payload: any) {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    const cookieStore = await cookies();

    // When running behind nginx (SSL termination), the connection to Next.js is HTTP,
    // so secure:true may be rejected. We fall back to secure:false — nginx enforces HTTPS.
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    try {
        cookieStore.set('session', token, cookieOptions);
    } catch {
        // Fallback: nginx handles HTTPS enforcement, so secure:false is safe behind the proxy
        cookieStore.set('session', token, { ...cookieOptions, secure: false });
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) return null;

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}
