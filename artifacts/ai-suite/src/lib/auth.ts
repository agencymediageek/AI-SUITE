import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-secret-for-dev-only';

// Cookie options used consistently across all session operations
const SESSION_COOKIE_OPTIONS = {
    httpOnly: true,
    // secure:false because nginx handles HTTPS termination — the connection
    // from nginx to Next.js is HTTP. The browser still receives the cookie
    // over HTTPS because nginx enforces it.
    secure: false,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
};

/** Returns a signed JWT token for the given payload. */
export function signToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Sets a session cookie using next/headers cookies() — works in Replit dev
 * and in Server Actions. For Route Handlers behind nginx, prefer setting the
 * cookie directly on the NextResponse object using SESSION_COOKIE_OPTIONS.
 */
export async function createSession(payload: any) {
    const token = signToken(payload);
    const cookieStore = await cookies();
    try {
        cookieStore.set('session', token, SESSION_COOKIE_OPTIONS);
    } catch {
        // Silently ignore if cookies() API is unavailable in this context
    }
}

export { SESSION_COOKIE_OPTIONS };

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
