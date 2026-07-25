---
name: VPS Deploy Setup
description: How to deploy from Replit to the MediaGeek VPS (179.197.229.207)
---

## SSH Key (persistent)
- Private key: `.agents/deploy_key` (gitignored, persists in workspace)
- Public key already in `/root/.ssh/authorized_keys` on VPS (2 keys total)
- Usage: `ssh -i /home/runner/workspace/.agents/deploy_key -o StrictHostKeyChecking=no root@179.197.229.207 "..."`

## Fallback (if key is lost)
- Use `sshpass` with the `VPS_ROOT_PASSWORD` Replit secret:
  `SSHPASS="$VPS_ROOT_PASSWORD" sshpass -e ssh -o StrictHostKeyChecking=no root@179.197.229.207 "..."`

## GitHub Actions (auto-deploy)
- Workflow: `.github/workflows/deploy.yml` — triggers on push to `main`
- Uses `SSH_PRIVATE_KEY` secret in GitHub Actions
- Build takes ~1m13s total
- **Why:** Token with `workflow` scope required to push .github/workflows/; fine-grained token doesn't auto-grant `secrets` write permission

## VPS Details
- App dir: `/var/www/mediageek/artifacts/ai-suite/`
- Process: `pm2 restart mediageek --update-env && pm2 save`
- npm/pm2/node all at `/usr/bin/` (standard PATH — no nvm needed)
- Deploy command: `cd /var/www/mediageek && git pull origin main && cd artifacts/ai-suite && npm install --legacy-peer-deps && npm run build && pm2 restart mediageek --update-env && pm2 save`
