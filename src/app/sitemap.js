import redisClient from "@/lib/redisClient";

export default async function sitemap() {
  console.log(`[Sitemap] Starting generation at ${new Date().toISOString()}`);
  
  // Get terms directly from Redis instead of API to avoid timeouts
  let terms = [];
  let comparisons = [];
  
  try {
    // Use Redis SCAN to get all term keys efficiently
    let cursor = "0";
    const termKeys = [];
    
    do {
      const scanResult = await redisClient.scan(cursor, { 
        MATCH: "terms:*", 
        COUNT: 1000 
      });
      
      cursor = scanResult.cursor;
      termKeys.push(...scanResult.keys);
    } while (cursor !== "0");
    
    console.log(`[Sitemap] Found ${termKeys.length} term keys in Redis`);
    
    // Get term data in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < termKeys.length; i += batchSize) {
      const batch = termKeys.slice(i, i + batchSize);
      const batchTerms = await Promise.all(
        batch.map(async (key) => {
          try {
            const termData = await redisClient.get(key);
            if (termData) {
              const term = JSON.parse(termData);
              return {
                ...term,
                slug: key.replace("terms:", "")
              };
            }
          } catch (e) {
            console.error(`[Sitemap] Error parsing term ${key}: ${e.message}`);
          }
          return null;
        })
      );
      
      terms.push(...batchTerms.filter(Boolean));
    }
    
    console.log(`[Sitemap] Successfully loaded ${terms.length} terms from Redis`);
    
    // Generate comparison combinations for terms with related terms
    terms.forEach(term => {
      if (term.relatedTerms && Array.isArray(term.relatedTerms)) {
        term.relatedTerms.forEach(related => {
          if (related.slug) {
            comparisons.push({
              slug1: term.slug,
              slug2: related.slug
            });
          }
        });
      }
    });
    
    console.log(`[Sitemap] Generated ${comparisons.length} comparison URLs`);
    
  } catch (error) {
    console.error(`[Sitemap] Error loading terms from Redis: ${error.message}`);
    // Continue with empty terms but log the error
  }

  // Static pages
  const staticPages = [
    {
      url: 'https://www.devlingo.com.br',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.devlingo.com.br/termos',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Alphabet pages
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const alphabetPages = alphabet.map(letter => ({
    url: `https://www.devlingo.com.br/lista/${letter}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Category pages
  const categories = [
    "internet", "hardware", "software", "tecnico", 
    "acronimo", "bits-and-bytes", "formato-de-arquivos"
  ];
  
  const categoryPages = categories.map(category => ({
    url: `https://www.devlingo.com.br/categoria/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Individual term pages
  const termPages = terms.map(term => ({
    url: `https://www.devlingo.com.br/termos/${term.slug}`,
    lastModified: term.updatedAt ? new Date(term.updatedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // NEW: Why Learn pages for each term
  const whyLearnPages = terms.map(term => ({
    url: `https://www.devlingo.com.br/por-que-aprender/${term.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  // NEW: Comparison pages (limit to avoid too many URLs initially)
  const comparisonPages = comparisons.slice(0, 5000).map(comp => ({
    url: `https://www.devlingo.com.br/compare/${comp.slug1}/vs/${comp.slug2}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  // Combine all pages
  const allPages = [
    ...staticPages,
    ...alphabetPages,
    ...categoryPages,
    ...termPages,
    ...whyLearnPages,
    ...comparisonPages,
  ];
  
  console.log(`[Sitemap] Generated sitemap with ${allPages.length} URLs:`);
  console.log(`  - Static: ${staticPages.length}`);
  console.log(`  - Alphabet: ${alphabetPages.length}`);
  console.log(`  - Categories: ${categoryPages.length}`);
  console.log(`  - Terms: ${termPages.length}`);
  console.log(`  - Why Learn: ${whyLearnPages.length}`);
  console.log(`  - Comparisons: ${comparisonPages.length}`);
  
  return allPages;
}