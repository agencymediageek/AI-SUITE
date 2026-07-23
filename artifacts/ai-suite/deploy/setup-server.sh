#!/bin/bash
# =============================================================
# MediaGeek SaaS — Ubuntu 24.04 LTS — Setup Inicial do Servidor
# Execute como root: bash setup-server.sh
# =============================================================
set -e

APP_USER="mediageek"
APP_DIR="/var/www/mediageek"
DB_NAME="mediageek"
DB_USER="mediageek"
NODE_VERSION="20"

echo "============================================"
echo " MediaGeek SaaS — Setup do Servidor"
echo "============================================"

# ── 1. Atualizar sistema ────────────────────────────────────
echo "[1/9] Atualizando sistema..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git unzip ufw build-essential

# ── 2. Node.js 20 LTS ──────────────────────────────────────
echo "[2/9] Instalando Node.js $NODE_VERSION LTS..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs
node -v && npm -v

# ── 3. pnpm ────────────────────────────────────────────────
echo "[3/9] Instalando pnpm..."
npm install -g pnpm pm2
pnpm -v && pm2 -v

# ── 4. PostgreSQL 16 ───────────────────────────────────────
echo "[4/9] Instalando PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

systemctl enable postgresql
systemctl start postgresql

# Criar usuário e banco de dados
echo "[4/9] Criando banco de dados '$DB_NAME'..."
sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE $DB_USER LOGIN PASSWORD 'CHANGE_THIS_PASSWORD';
  END IF;
END
\$\$;
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
SQL
echo "[4/9] Banco criado. Lembre-se de alterar a senha!"

# ── 5. Nginx ───────────────────────────────────────────────
echo "[5/9] Instalando Nginx..."
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx

# ── 6. Usuário da aplicação ────────────────────────────────
echo "[6/9] Criando usuário '$APP_USER'..."
id -u $APP_USER &>/dev/null || useradd -m -s /bin/bash $APP_USER
mkdir -p $APP_DIR
chown -R $APP_USER:$APP_USER $APP_DIR

# ── 7. Firewall ────────────────────────────────────────────
echo "[7/9] Configurando firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status

# ── 8. Certbot (SSL) ───────────────────────────────────────
echo "[8/9] Instalando Certbot..."
apt-get install -y certbot python3-certbot-nginx

# ── 9. PM2 Startup ────────────────────────────────────────
echo "[9/9] Configurando PM2 startup..."
pm2 startup systemd -u $APP_USER --hp /home/$APP_USER || true

echo ""
echo "============================================"
echo " Setup concluído! Próximos passos:"
echo "============================================"
echo ""
echo "1. Clone o repositório:"
echo "   cd $APP_DIR"
echo "   git clone https://github.com/agencymediageek/AI-SUITE.git ."
echo ""
echo "2. Copie e preencha o .env:"
echo "   cp deploy/.env.production.template .env.local"
echo "   nano .env.local"
echo ""
echo "3. Instale dependências e faça o build:"
echo "   cd $APP_DIR && pnpm install --frozen-lockfile"
echo "   pnpm run build"
echo ""
echo "4. Rode a migração do banco:"
echo "   pnpm run migrate"
echo ""
echo "5. Inicie com PM2:"
echo "   pm2 start deploy/ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "6. Configure o Nginx:"
echo "   cp deploy/nginx.conf /etc/nginx/sites-available/mediageek"
echo "   ln -s /etc/nginx/sites-available/mediageek /etc/nginx/sites-enabled/"
echo "   nginx -t && systemctl reload nginx"
echo ""
echo "7. SSL (após apontar o DNS):"
echo "   certbot --nginx -d SEU_DOMINIO.com -d www.SEU_DOMINIO.com"
echo ""
