---
name: Auth Flow
description: How JWT auth works across frontend, backend, and WordPress
---

## Frontend (Zustand + api-client-react)
- src/lib/auth.ts — Zustand store holds token + user, persists to localStorage
- On mount: reads localStorage key `ai_suite_token` and calls `setAuthTokenGetter()`
- All API calls get `Authorization: Bearer <token>` header automatically via the getter
- After login/register: store token + user, redirect to /dashboard
- Protected routes check store; redirect to /login if no token

## Backend (Express + JWT)
- artifacts/api-server/src/lib/auth.ts
- requireAuth middleware: extracts Bearer token, verifies JWT, looks up user in DB
- JWT_SECRET env var (defaults to hardcoded fallback — MUST change in production)
- Token lifetime: 30 days

## WordPress integration
- POST /wp-json/ai-suite/v1/token — issues JWT using same secret
- JWT payload: { sub: userId, email, role, iat, exp }
- [ai_suite_login] shortcode: authenticates via WP REST, stores token in localStorage, redirects into app

**Why:** WooCommerce manages billing, WordPress manages user accounts; the JWT secret is the bridge between the two systems.
