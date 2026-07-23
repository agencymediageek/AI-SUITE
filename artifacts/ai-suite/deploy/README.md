# 🚀 MediaGeek SaaS — Deploy no VPS

## Arquivos nesta pasta

| Arquivo | Descrição |
|---|---|
| `setup-server.sh` | Setup inicial do Ubuntu 24.04 (rodar uma vez como root) |
| `nginx.conf` | Configuração do Nginx (proxy reverso) |
| `ecosystem.config.js` | Configuração do PM2 (gerenciador de processos) |
| `.env.production.template` | Template das variáveis de ambiente |

---

## Passo a passo completo

### 1. Preparar o servidor (uma vez)

```bash
# No VPS como root
bash setup-server.sh
```

### 2. Clonar o repositório

```bash
cd /var/www/mediageek
git clone https://github.com/agencymediageek/AI-SUITE.git .
```

### 3. Configurar variáveis de ambiente

```bash
cp deploy/.env.production.template .env.local
nano .env.local   # preencha todos os valores
```

Gerar chaves seguras:
```bash
openssl rand -hex 32   # para JWT_SECRET
openssl rand -hex 32   # para SESSION_SECRET
```

### 4. Instalar e fazer build

```bash
pnpm install --frozen-lockfile
pnpm run build
```

### 5. Criar as tabelas do banco

```bash
pnpm run migrate
```

### 6. Iniciar com PM2

```bash
pm2 start deploy/ecosystem.config.js
pm2 save
```

### 7. Configurar o Nginx

```bash
# Edite o domínio no arquivo antes de copiar
sed -i 's/SEU_DOMINIO.com/mediageek.io/g' deploy/nginx.conf

cp deploy/nginx.conf /etc/nginx/sites-available/mediageek
ln -s /etc/nginx/sites-available/mediageek /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
```

### 8. SSL com Let's Encrypt

```bash
# Após apontar o DNS para o IP do VPS
certbot --nginx -d mediageek.io -d www.mediageek.io
```

---

## Deploy automático (GitHub Actions)

Adicione estes secrets no GitHub → Settings → Secrets and variables → Actions:

| Secret | Valor |
|---|---|
| `VPS_HOST` | IP do VPS (ex: 123.45.67.89) |
| `VPS_USER` | Usuário SSH (ex: `root` ou `mediageek`) |
| `VPS_SSH_KEY` | Chave SSH privada (conteúdo completo do `id_rsa`) |
| `VPS_PORT` | Porta SSH (padrão: `22`) |
| `VPS_DOMAIN` | Domínio (ex: `mediageek.io`) |

Após configurado, **cada push para `main`** faz deploy automático.

---

## Comandos úteis no VPS

```bash
pm2 status                    # status da aplicação
pm2 logs mediageek            # logs em tempo real
pm2 restart mediageek         # reiniciar
pm2 reload mediageek          # restart sem downtime

nginx -t                      # testar config do nginx
systemctl reload nginx        # aplicar config

tail -f /var/log/nginx/mediageek_error.log   # logs de erro nginx
```
