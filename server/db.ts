import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Build connection string from individual parameters or use DATABASE_URL
const getConnectionString = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;
  
  if (!PGUSER || !PGPASSWORD || !PGHOST || !PGPORT || !PGDATABASE) {
    throw new Error(
      "Database connection parameters must be set. Please provide either DATABASE_URL or PGUSER, PGPASSWORD, PGHOST, PGPORT, and PGDATABASE.",
    );
  }
  
  // Build connection string from individual parameters
  return `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
};

export const pool = new Pool({ connectionString: getConnectionString() });
export const db = drizzle({ client: pool, schema });