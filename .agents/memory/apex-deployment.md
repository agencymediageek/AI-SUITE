---
name: APEX Deployment
description: Full infrastructure map for apex.techsites.ai — CF Pages (frontend), VPS PM2 (backend), Nginx, deploy process
---

## Production URLs
- Live: https://apex.techsites.ai
- CF Pages: apex-meeting.pages.dev (project: apex-meeting)
- VPS: 179.197.229.207 (Hostgator)

## Frontend — Cloudflare Pages
- Project name: `apex-meeting`
- CF Zone techsites.ai (MEDIAGEEK account): `aaa2418ffbb69192aa3546436397ccac` — NOT the active zone
- CF Zone techsites.ai (MAIN account, active): `4a436c01e12cf1ec5780ea67e0605e73` — purge fails with available tokens; must use CF dashboard
- Deploy command (from workspace root):
  ```bash
  PORT=3001 BASE_PATH=/ pnpm --filter @workspace/apex-meeting run build
  CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... npx wrangler pages deploy artifacts/apex-meeting/dist/public --project-name apex-meeting --branch main
  ```
- After deploy: purge CF cache via CF dashboard (Caching → Purge Everything) — API tokens lack zone purge permission on the active zone
- Nginx updated to serve index.html with Cache-Control: no-store (prevents future CF HTML caching)
- Cache issue: if bundle filename doesn't change, browser caches immutably. Force new filename by adding suffix to vite.config build.rollupOptions.output

## Backend — VPS PM2
- PM2 process: `apex-api` (id=2), port 8080
- Ecosystem: `artifacts/api-server/ecosystem.config.cjs`
- Nginx config: `/etc/nginx/sites-available/apex-techsites`
- Static files served from: `/var/www/mediageek/artifacts/apex-meeting/dist/public`
- Deploy webhook: `/var/www/deploy-webhook/server.js`

## VPS Deploy Process
```bash
ssh -i .agents/deploy_key root@179.197.229.207
cd /var/www/mediageek && git pull origin main
PORT=3001 BASE_PATH=/ pnpm --filter @workspace/apex-meeting run build
pm2 restart apex-api
```

## CI/CD (GitHub Actions)
- `.github/workflows/deploy.yml` — auto-deploys apex-meeting to CF Pages on push to main
- Builds with PORT=3000 BASE_PATH=/

## DNS
- apex.techsites.ai → A record 179.197.229.207 (CF proxied=true)

## Demo Accounts
- admin@apex.techsites.ai / Admin@Apex2026! (role: admin, plan: pro)
- demo@apex.techsites.ai / Teste@Apex2026! (role: user)

## Key Quirk: Sync VPS vs CF Pages
The site runs on CF Pages (frontend), NOT served from VPS nginx static.
VPS only serves the API (/api/*). Changes to the frontend only show in prod after:
1. Build locally
2. Deploy to CF Pages via Wrangler
3. Purge CF cache

## Documentation
- GitHub: docs/APEX-CORE-BLUEPRINT.md, docs/APEX-CORE-README.md
- GDRIVE_TECHSITES_CREDENTIALS secret is a URL, not a JSON key — cannot use for service account upload
