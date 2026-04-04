import 'dotenv/config';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const connectionString = process.env.DATABASE_URL;
const neonLocalFetchEndpoint = process.env.NEON_LOCAL_FETCH_ENDPOINT;

if (neonLocalFetchEndpoint) {
  neonConfig.fetchEndpoint = neonLocalFetchEndpoint;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(connectionString);

const db = drizzle(sql);

export { db, sql };
