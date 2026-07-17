# Guia de Deploy — MediaGeek AI Suite

---

## Fluxo de Trabalho Padrão

```
Replit (desenvolvimento)
    ↓  git push origin main
GitHub (repositório)
    ↓  webhook automático
Hostinger VPS (produção)
```

---

## Opção A — Deploy no Replit Autoscale (Atual)

O deploy atual é feito diretamente pelo Replit em `aisuite.mediageek.io`.

### Para atualizar a produção

1. Faça as alterações no Replit
2. Clique em **Deploy** no painel do Replit
3. O Replit fará o build e publicará automaticamente

### Variáveis de Ambiente no Replit

Configure em **Replit → Secrets**:

| Secret | Valor |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Segredo JWT |
| `SESSION_SECRET` | Segredo de sessão |
| `GEMINI` | API Key Google Gemini |
| `MERCADO_PAGO_ACCESS_TOKEN` | Token produção Mercado Pago |
| `STRIPE_SECRET_KEY` | Secret Key Stripe |
| `STRIPE_WEBHOOK_SECRET` | Segredo webhook Stripe |
| `APP_BASE_URL` | `https://aisuite.mediageek.io` |

---

## Opção B — Deploy na VPS Hostinger (Futuro)

### Pré-requisitos na VPS

- Ubuntu 22.04+
- Node.js 20+ (`nvm install 20`)
- pnpm (`npm install -g pnpm`)
- PostgreSQL 15+
- PM2 (`npm install -g pm2`)
- nginx

### 1. Configurar o servidor (primeira vez)

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/mediageek-ai-suite.git /var/www/mediageek
cd /var/www/mediageek

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
nano .env  # preencher com valores de produção

# Aplicar schema do banco
pnpm --filter @workspace/db run db:push

# Build do frontend
pnpm --filter @workspace/ai-suite-platform run build

# Build do backend
pnpm --filter @workspace/api-server run build
```

### 2. Configurar PM2 (manter backend rodando)

```bash
# Criar arquivo de configuração PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'mediageek-api',
      script: 'artifacts/api-server/dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup  # configurar auto-start no boot
```

### 3. Configurar nginx

```nginx
# /etc/nginx/sites-available/mediageek
server {
    listen 80;
    server_name aisuite.mediageek.io;

    # Frontend (arquivos estáticos compilados)
    root /var/www/mediageek/artifacts/ai-suite-platform/dist;
    index index.html;

    # SPA routing — todas as rotas vão para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy para o backend Express
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/mediageek /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# SSL com Certbot
certbot --nginx -d aisuite.mediageek.io
```

### 4. Script de atualização (pós-setup)

Salve este script como `/var/www/mediageek/deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Iniciando deploy..."
cd /var/www/mediageek

git pull origin main
pnpm install --frozen-lockfile

# Build frontend
pnpm --filter @workspace/ai-suite-platform run build

# Build backend
pnpm --filter @workspace/api-server run build

# Aplicar migrations
pnpm --filter @workspace/db run db:push

# Reiniciar backend
pm2 restart mediageek-api

echo "✅ Deploy concluído!"
```

```bash
chmod +x deploy.sh
```

### 5. Fluxo de atualização do dia a dia

```bash
# No Replit: fazer as alterações → commit → push
git add .
git commit -m "feat: descrição da alteração"
git push origin main

# Na VPS: executar o script de deploy
ssh user@ip_da_vps
cd /var/www/mediageek && ./deploy.sh
```

---

## Configurar Webhooks de Pagamento na VPS

### Mercado Pago
1. Acesse mercadopago.com.br → Seu negócio → Webhooks
2. URL: `https://aisuite.mediageek.io/api/payments/mp/webhook`
3. Eventos: `payment` (created, updated)

### Stripe
1. Acesse dashboard.stripe.com → Developers → Webhooks
2. URL: `https://aisuite.mediageek.io/api/payments/stripe/webhook`
3. Eventos: `checkout.session.completed`, `payment_intent.succeeded`
4. Copie o `Signing secret` (whsec_...) para a variável `STRIPE_WEBHOOK_SECRET`

---

## Banco de Dados em Produção

### Backup automático (recomendado)

```bash
# Adicionar ao crontab: backup diário às 2h
crontab -e
# Adicionar linha:
0 2 * * * pg_dump mediageek > /var/backups/mediageek_$(date +%Y%m%d).sql
```

### Aplicar migrations após atualização de schema

```bash
cd /var/www/mediageek
pnpm --filter @workspace/db run db:push
```

---

## Troubleshooting

| Problema | Solução |
|---|---|
| API retorna 502 | `pm2 logs mediageek-api` para ver o erro |
| Frontend mostra 404 nas rotas | Verificar configuração `try_files` no nginx |
| Pagamentos não funcionam | Verificar variáveis de ambiente com `pm2 env mediageek-api` |
| Banco não conecta | Verificar `DATABASE_URL` e se PostgreSQL está rodando |
