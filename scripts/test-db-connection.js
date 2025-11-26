/**
 * Script para testar conexão com PostgreSQL
 */

import { db } from '../src/lib/db/client.ts';
import { sql } from 'drizzle-orm';

async function testConnection() {
  console.log('🔍 Testando conexão com PostgreSQL...\n');

  try {
    // Test 1: Simple query
    const result = await db.execute(sql`SELECT current_database(), current_user, version()`);
    console.log('✅ Conexão estabelecida!');
    console.log('📊 Database:', result[0].current_database);
    console.log('👤 User:', result[0].current_user);
    console.log('🐘 Version:', result[0].version.split(' ')[0], result[0].version.split(' ')[1]);

    // Test 2: Count terms
    const termsCount = await db.execute(sql`SELECT COUNT(*) as count FROM terms`);
    console.log('\n📈 Termos no PostgreSQL:', termsCount[0].count);

    // Test 3: Count categories
    const categoriesCount = await db.execute(sql`SELECT COUNT(*) as count FROM categories`);
    console.log('📂 Categorias no PostgreSQL:', categoriesCount[0].count);

    console.log('\n✅ Todos os testes passaram!\n');

  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

testConnection();
