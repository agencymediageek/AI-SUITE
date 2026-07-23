import pg from 'pg';

const { Pool } = pg;

// Replit's internal PostgreSQL uses individual PG* env vars.
// Fallback to connection string if available.
const connectionString =
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL;

// Build pool config — prefer individual env vars (always available on Replit)
const poolConfig: pg.PoolConfig = process.env.PGHOST
    ? {
          host: process.env.PGHOST,
          port: parseInt(process.env.PGPORT || '5432'),
          database: process.env.PGDATABASE,
          user: process.env.PGUSER,
          password: process.env.PGPASSWORD,
          // No SSL — Replit's internal PostgreSQL doesn't support it
          ssl: false,
      }
    : connectionString
    ? {
          connectionString,
          // For external databases, try SSL but don't fail if not available
          ssl: { rejectUnauthorized: false },
      }
    : {};

if (!process.env.PGHOST && !connectionString) {
    console.warn('[pg.ts] No database configuration found. DB connections will fail.');
} else {
    console.log('[pg.ts] Connecting to:', process.env.PGHOST || 'via connection string');
}

export const pool = new Pool(poolConfig);

export async function query(text: string, params?: any[]) {
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (err) {
        console.error('Database query error:', err);
        throw err;
    }
}

export async function getClient() {
    const client = await pool.connect();
    return client;
}
