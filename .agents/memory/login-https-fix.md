---
name: Login HTTPS 500 fix
description: Root cause and fix for login returning 500 via public HTTPS URL but 401 via localhost
---

## Rule
When Next.js runs behind nginx (SSL termination), `cookies().set({ secure: true })` in a Route Handler can throw because the underlying connection is HTTP. This causes a 500 in the login route catch block.

**Why:** Next.js 14 in production mode enforces secure cookie constraints. Nginx terminates SSL and proxies HTTP to port 3000, so from Next.js's perspective the connection is HTTP. Setting `secure: true` cookies on an HTTP connection throws in some Next.js versions.

**How to apply:**
- Always add `export const dynamic = 'force-dynamic'` to any Route Handler that calls `cookies()` or sets cookies
- Wrap `cookieStore.set()` with try-catch and retry with `secure: false` as fallback (see `artifacts/ai-suite/src/lib/auth.ts` `createSession()`)
- The symptom: login/register works via localhost:3000 directly but returns 500 via the public HTTPS URL
- After fixing: test BOTH `curl http://localhost:3000/api/auth/login` AND `curl https://domain.com/api/auth/login`

## Debugging pattern
```bash
# Test direct (bypasses nginx)
curl http://localhost:3000/api/auth/login -X POST -H 'Content-Type: application/json' -d '{"email":"x","password":"y"}'
# Test public (goes through nginx → CF)
curl https://mediageek.io/api/auth/login -X POST -H 'Content-Type: application/json' -d '{"email":"x","password":"y"}'
# If direct=401 but public=500 → cookie/proxy issue, apply this fix
```
