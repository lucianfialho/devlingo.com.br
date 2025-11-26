import { db } from '../src/lib/db/client.js';
import { terms } from '../src/lib/db/schema.js';
import { sql } from 'drizzle-orm';

async function checkStatus() {
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(terms);
  console.log('📊 Total de termos no PostgreSQL:', result[0].count);
  process.exit(0);
}

checkStatus();
