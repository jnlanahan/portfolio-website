import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

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

// Create postgres connection
const connectionString = getConnectionString();
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client, { schema });