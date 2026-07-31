---
name: VPS instances
description: All PM2/Nginx/DB instances running on VPS 179.197.229.207 — current state
---

## Active instances (July 2026)

| PM2 Name       | Port | Domain                  | DB           | Dir                    |
|----------------|------|-------------------------|--------------|------------------------|
| mediageek      | 3000 | mediageek.io            | mediageek    | /var/www/mediageek     |
| aisuitemg      | 3010 | aisuitemg.mediageek.io  | aisuitemg    | /var/www/aisuitemg     |
| clonemg        | 3011 | clone.mediageek.io      | clonemg      | /var/www/clonemg       |
| aimediageek    | 3012 | ai.mediageek.io         | aimediageek  | /var/www/aimediageek   |
| apex-api       | 8080 | apex.techsites.ai/api   | apex         | /var/www/mediageek/... |
| deploy-webhook | 9876 | internal                | —            | —                      |

## Next available port: 3013+

## ai.mediageek.io — primary product
- Full Next.js AI Suite, installed via install.sh from base aisuitemg
- Branding: "AI MediaGeek", color "262 80% 50%" (purple)
- Languages: PT-BR + ES seeded in languages table
- Stripe: inherited from base .env.local (STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET)
- Legal pages: /privacy, /terms, /cookies all return 200 (native)
- Admin panel: /admin-mg (requires admin role)
- Admin register: /admin/register

## aisuitemg.mediageek.io — base/golden instance
- Source of truth for all clones via install.sh
- Contains admin-mg panel, CLONE-GUIDE.md, install.sh
- PM2_PROCESS_NAME=aisuitemg in .env.local

## clone.mediageek.io — first live clone (green branding)
- PM2_PROCESS_NAME=clonemg
- DB: clonemg, color "142 71% 45%"

## Key paths on VPS
- install.sh: /var/www/aisuitemg/install.sh
- CLONE-GUIDE.md: /var/www/aisuitemg/docs/CLONE-GUIDE.md
- SSL certs: /etc/letsencrypt/live/<domain>/
- Nginx configs: /etc/nginx/sites-available/<name>
- PM2 logs: /var/log/pm2/<name>-out.log

**Why:** All instances share the same Next.js codebase (aisuitemg base). Never edit base directly while a build is running on it.
