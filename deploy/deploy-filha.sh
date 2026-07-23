#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# deploy-filha.sh — Cria uma nova plataforma filha a partir do template
#
# USO:
#   bash deploy-filha.sh <nome> <dominio> <db_password>
#   Exemplo: bash deploy-filha.sh "juridicai" "juridicai.com.br" "senha123"
#
# O que este script faz:
#   1. Clona a branch template-filha do GitHub para /var/www/<nome>/
#   2. Cria banco PostgreSQL isolado
#   3. Configura .env.local com as credenciais
#   4. Instala dependências e faz o build
#   5. Registra no PM2 com nome único
#   6. Imprime checklist do que ainda precisa ser feito manualmente
#
# ISOLAMENTO — cada filha tem:
#   - Diretório próprio: /var/www/<nome>/
#   - Banco próprio: PostgreSQL db_<nome>
#   - Processo PM2 próprio: pm2_<nome>
#   - Porta própria (lida de PORT no .env.local)
#   - Domínio próprio configurado no Nginx
# ═══════════════════════════════════════════════════════════════════════════

set -e  # Para imediatamente se qualquer comando falhar

NOME="${1}"
DOMINIO="${2}"
DB_PASS="${3}"
GITHUB_REPO="${GITHUB_REPO:-https://github.com/agencymediageek/AI-SUITE.git}"  # Export GITHUB_REPO com token se repo for privado
BRANCH="template-filha"
BASE_DIR="/var/www/${NOME}"
DB_NAME="db_${NOME}"
DB_USER="${NOME}_user"
PM2_NAME="${NOME}"

# ─── Validações ─────────────────────────────────────────────────────────────
if [ -z "$NOME" ] || [ -z "$DOMINIO" ] || [ -z "$DB_PASS" ]; then
  echo "❌  USO: bash deploy-filha.sh <nome> <dominio> <db_password>"
  echo "    Exemplo: bash deploy-filha.sh juridicai juridicai.com.br MinhaS3nha"
  exit 1
fi

if [ -d "$BASE_DIR" ]; then
  echo "❌  Diretório $BASE_DIR já existe. Escolha outro nome."
  exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo " 🚀 Criando plataforma filha: $NOME"
echo " 🌐 Domínio: $DOMINIO"
echo " 📁 Diretório: $BASE_DIR"
echo "═══════════════════════════════════════════════════════"
echo ""

# ─── 1. Clonar do GitHub (branch template-filha) ────────────────────────────
echo "📥 [1/6] Clonando branch $BRANCH do GitHub..."
git clone --branch "$BRANCH" --single-branch "$GITHUB_REPO" "$BASE_DIR"
cd "$BASE_DIR/artifacts/ai-suite"

# ─── 2. Banco de dados PostgreSQL isolado ───────────────────────────────────
echo "🗄️  [2/6] Criando banco de dados PostgreSQL isolado..."
sudo -u postgres psql << SQL
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL
echo "✅  Banco criado: ${DB_NAME} (usuário: ${DB_USER})"

# ─── 3. Configurar .env.local ───────────────────────────────────────────────
echo "⚙️  [3/6] Configurando variáveis de ambiente..."
# Pegar PORT livre a partir de 3001
PORT=3001
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

cat > .env.local << ENV
# ─── ${NOME} — gerado por deploy-filha.sh ───────────────────────────────
NODE_ENV=production
PORT=${PORT}
DATABASE_URL=${DATABASE_URL}

# Segredos — preencha antes de iniciar
SESSION_SECRET=$(openssl rand -base64 32)
GROK=                        # Cole a chave xAI/Grok aqui
STRIPE_SECRET_KEY=           # Cole a chave Stripe aqui
STRIPE_WEBHOOK_SECRET=       # Cole o webhook secret Stripe aqui
MERCADO_PAGO_ACCESS_TOKEN=   # Cole o token Mercado Pago aqui

# Gemini (opcional — só ative com billing habilitado)
GEMINI=

# Domínio da plataforma
NEXT_PUBLIC_APP_URL=https://${DOMINIO}
ENV

echo "✅  .env.local criado (preencha as chaves de API antes de iniciar)"

# ─── 4. Instalar dependências ────────────────────────────────────────────────
echo "📦 [4/6] Instalando dependências (npm install)..."
npm install --legacy-peer-deps

# ─── 5. Migrations do banco ─────────────────────────────────────────────────
echo "🗃️  [5/6] Rodando migrations do banco..."
psql "${DATABASE_URL}" -f database/schema.sql 2>/dev/null || \
psql "${DATABASE_URL}" -f database/init.sql 2>/dev/null || \
echo "⚠️  Nenhum arquivo SQL encontrado — rode as migrations manualmente"

# ─── 6. Build e PM2 ─────────────────────────────────────────────────────────
echo "🔨 [6/6] Build de produção e registro no PM2..."
npm run build
pm2 start npm --name "${PM2_NAME}" -- start -- -p ${PORT}
pm2 save

echo ""
echo "═══════════════════════════════════════════════════════"
echo " ✅ Plataforma ${NOME} criada com sucesso!"
echo " 📡 Rodando na porta: ${PORT}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 CHECKLIST — faça isso antes de ir ao ar:"
echo ""
echo "  [ ] 1. Edite /var/www/${NOME}/artifacts/ai-suite/.env.local"
echo "         e preencha: GROK, STRIPE_SECRET_KEY, MERCADO_PAGO_ACCESS_TOKEN"
echo ""
echo "  [ ] 2. Edite /var/www/${NOME}/artifacts/ai-suite/nicho.config.ts"
echo "         Defina: platform.name, domain, branding.primaryColor, niche.category"
echo ""
echo "  [ ] 3. Substitua /public/logo.png e /public/favicon.ico"
echo "         pelo logo e ícone da nova plataforma"
echo ""
echo "  [ ] 4. Configure o Nginx para o domínio ${DOMINIO}:"
echo "         proxy_pass http://localhost:${PORT};"
echo ""
echo "  [ ] 5. Gere certificado SSL:"
echo "         certbot --nginx -d ${DOMINIO}"
echo ""
echo "  [ ] 6. No painel /admin, configure:"
echo "         - Nome e branding da plataforma"
echo "         - Ferramentas habilitadas por plano"
echo "         - Preços dos planos"
echo "         - Conta de admin"
echo ""
echo "  [ ] 7. Registre os webhooks:"
echo "         Stripe: https://${DOMINIO}/api/webhook/stripe"
echo "         Mercado Pago: https://${DOMINIO}/api/webhook/mercadopago"
echo ""
pm2 status | grep "${PM2_NAME}"
