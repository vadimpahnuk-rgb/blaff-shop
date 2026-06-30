import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

/**
 * Lazy database initialization.
 *
 * The connection is created on first use rather than at import time so the
 * serverless function can boot (and serve routes that don't touch the DB, e.g.
 * /api/health) even before DATABASE_URL is configured. Routes that hit the DB
 * throw a clear error if it is still missing.
 */

let _pool: Pool | undefined;
let _db: NodePgDatabase<typeof schema> | undefined;

function ensure(): void {
  if (_db) return;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Configure it in the environment.');
  }

  // Supabase pooler URLs contain a dot in the username (postgres.<ref>).
  // Newer pg-connection-string parsers strip the dot suffix, so we
  // parse the URL manually and pass individual params when needed.
  const isPooler = connectionString.includes('pooler.supabase.com');
  const needsSsl = !/localhost|127\.0\.0\.1/.test(connectionString);

  if (isPooler) {
    const url = new URL(connectionString);
    const user = decodeURIComponent(url.username);
    const password = decodeURIComponent(url.password);
    _pool = new Pool({
      host: url.hostname,
      port: Number(url.port),
      database: url.pathname.replace(/^\//, ''),
      user,
      password,
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      ssl: needsSsl ? { rejectUnauthorized: false } : false,
    });
  } else {
    _pool = new Pool({
      connectionString,
      ssl: needsSsl ? { rejectUnauthorized: false } : false,
    });
  }
  _db = drizzle(_pool, { schema });
}

/**
 * Proxy that initializes the underlying instance on first property access and
 * binds methods to it, so existing `import { db } from '../db'` call sites work
 * unchanged.
 */
function lazyProxy<T extends object>(get: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const target = get();
      const value = (target as Record<string | symbol, unknown>)[prop];
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

export const db: NodePgDatabase<typeof schema> = lazyProxy(() => {
  ensure();
  return _db!;
});

export const pool: Pool = lazyProxy(() => {
  ensure();
  return _pool!;
});

export { schema };
export default db;
