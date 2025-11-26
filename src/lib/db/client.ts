import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create PostgreSQL connection
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, {
  prepare: false,
  max: 10, // Connection pool size
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Export schema for use in queries
export { schema };
