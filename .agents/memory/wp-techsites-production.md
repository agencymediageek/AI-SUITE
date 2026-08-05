---
name: WP TechSites production deployment
description: Architecture and secrets for the production deployment of wp.techsites.ai on VPS
---

# WP TechSites — Production Deployment

## Architecture

```
User → HTTPS → Cloudflare → Worker (wp-techsites-proxy) → VPS 179.197.229.207:80
                                                          → nginx → /var/www/wptechsites/ (static SPA)
                                                          → nginx /api/ proxy → localhost:3013 (api-server PM2)
```

## VPS Services
- **api-server**: PM2 name `wptechsites-api`, port 3013, `node --env-file .env index.mjs`
- **Files**: `/opt/wptechsites-api/index.mjs` (built bundle)
- **Public/plugins**: `/opt/wptechsites-api/public/plugins/` (symlinked from `/opt/public`)
- **Static dashboard**: `/var/www/wptechsites/`
- **nginx config**: `/etc/nginx/sites-enabled/wp-techsites`
- **PM2 ecosystem**: `/opt/wptechsites-api/ecosystem.config.cjs`

## Database
- PostgreSQL 16 on VPS (localhost)
- DB: `wptechsites`, user: `wptechsites_user`
- TCP connection via `127.0.0.1:5432` (pg_hba: scram-sha-256 for host connections)
- DATABASE_URL in `/opt/wptechsites-api/.env`

## Cloudflare Configuration
- DNS: `wp.techsites.ai A 179.197.229.207` (proxied)
- Worker route: `wp.techsites.ai/* → wp-techsites-proxy` (proxies to VPS)
- SSL mode: flexible (CF terminates HTTPS, sends HTTP to VPS port 80)
- Pages project `techsites-ai` had `wp.techsites.ai` as custom domain (deleted during migration)

## Plugin
- Plugin v2.3.0 ZIP: `/opt/wptechsites-api/public/plugins/wp-techsites-plugin-v2.3.0.zip`
- `WPTS_API_BASE = 'https://wp.techsites.ai/api/wp'` (already correct in PHP)
- Download URL: `https://wp.techsites.ai/api/plugins/wp-techsites-plugin-v2.3.0.zip`

## Redeploy process (when code changes)
1. Build api-server: `pnpm --filter @workspace/api-server run build`
2. Build dashboard: `PORT=9999 BASE_PATH=/ NODE_ENV=production pnpm --filter @workspace/wp-techsites run build`
3. Copy to VPS via tar pipe + SSH
4. `pm2 restart wptechsites-api --update-env` on VPS

**Why:** "no Replit dependency" requirement — everything must survive Replit going offline.
**How to apply:** Any future changes to api-server or dashboard must be deployed to VPS following this process.
