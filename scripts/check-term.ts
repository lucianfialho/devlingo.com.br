import { db } from '../src/lib/db/client.js';
import { terms } from '../src/lib/db/schema.js';
import { eq, like } from 'drizzle-orm';

const slug = process.argv[2] || 'c--';

async function checkTerm() {
  console.log(`🔍 Verificando termo: "${slug}"\n`);

  const result = await db.select().from(terms).where(eq(terms.slug, slug)).limit(1);

  if (result.length > 0) {
    const term = result[0];
    console.log('✅ Termo encontrado no banco:');
    console.log(`   Slug: ${term.slug}`);
    console.log(`   Title: ${term.title}`);
    console.log(`   Status: ${term.status}`);
    console.log(`   Category: ${term.category}`);
    console.log(`   Created: ${term.createdAt}`);
    console.log('\n📝 Content:');
    console.log(JSON.stringify(term.content, null, 2).slice(0, 500) + '...');
  } else {
    console.log(`❌ Termo "${slug}" não encontrado no banco`);

    // Buscar termos similares
    console.log('\n🔍 Buscando termos similares...');
    const similar = await db.select().from(terms).where(like(terms.slug, `%${slug}%`)).limit(5);

    if (similar.length > 0) {
      console.log(`   Encontrados ${similar.length} termos similares:`);
      similar.forEach(t => console.log(`   - ${t.slug}`));
    }
  }

  process.exit(0);
}

checkTerm();
