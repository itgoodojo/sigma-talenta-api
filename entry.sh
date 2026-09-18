#!/bin/sh
set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "    Sigma Talenta API — Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

########################################
# Validate required environment
########################################

if [ -z "${DATABASE_URL}" ]; then
  echo "❌ DATABASE_URL is not set"
  exit 1
fi

if [ -z "${JWT_SECRET}" ]; then
  echo "❌ JWT_SECRET is not set"
  exit 1
fi

# sequelize-cli reads config/config.js, whose `production` block uses DATABASE_URL.
export NODE_ENV="${NODE_ENV:-production}"

########################################
# Report target (never print the password)
########################################

node -e "
const { parse } = require('pg-connection-string');
const c = parse(process.env.DATABASE_URL);
console.log('Database Host :', c.host + ':' + (c.port || 5432));
console.log('Database Name :', c.database);
console.log('Database User :', c.user);
console.log('SSL           :', process.env.DB_SSL === 'true' ? 'on' : 'off');
"

########################################
# Wait for the database server
########################################

echo ""
echo "⏳ Waiting for PostgreSQL..."

MAX_RETRIES="${DB_WAIT_RETRIES:-30}"
RETRY_COUNT=0

until node -e "
const { Client } = require('pg');
const ssl = process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : undefined;
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl, connectionTimeoutMillis: 5000 });
client
  .connect()
  .then(() => client.query('SELECT 1'))
  .then(() => client.end())
  .then(() => process.exit(0))
  .catch((err) => {
    if (process.env.DB_WAIT_VERBOSE === 'true') console.error('   ' + err.message);
    process.exit(1);
  });
"
do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "❌ Could not connect to PostgreSQL after ${MAX_RETRIES} attempts"
    echo "   Re-run with DB_WAIT_VERBOSE=true to see the driver error."
    exit 1
  fi
  echo "   Attempt ${RETRY_COUNT}/${MAX_RETRIES}..."
  sleep 2
done

echo "✅ Database reachable"

########################################
# Run migrations
########################################

echo ""
echo "⚙️  Running migrations..."

npx sequelize-cli db:migrate

echo "✅ Migrations applied"

########################################
# Seed (opt-in; seeders are idempotent and tracked in SequelizeSeeds)
########################################

if [ "${SEED_DB}" = "true" ]; then
  if [ -z "${ADMIN_PASSWORD}" ]; then
    echo "❌ SEED_DB=true requires ADMIN_PASSWORD to be set"
    exit 1
  fi
  echo ""
  echo "🌱 Seeding database..."
  echo "   Super admin: ${ADMIN_EMAIL:-super@sigma-talenta.com}"
  npx sequelize-cli db:seed:all
  echo "✅ Seed finished"
fi

########################################
# Start server
########################################

echo ""
echo "🚀 Starting Sigma Talenta API on port ${PORT:-3000}..."
echo ""

exec node dist/server.js
