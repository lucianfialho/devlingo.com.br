// Sitemap otimizado para evitar timeouts
export default async function sitemap() {
  console.log(`[Sitemap] Starting generation at ${new Date().toISOString()}`);
  
  // For build time, we'll use a hybrid approach:
  // 1. Static pages are always included
  // 2. Term pages will be fetched via API with pagination
  // 3. New SEO routes will be generated based on a sample
  
  // Static pages - always included
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

  // Try to fetch terms, but with a timeout and limit
  let termPages = [];
  let whyLearnPages = [];
  let comparisonPages = [];
  
  try {
    // Use a timeout promise to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 30000) // 30 second timeout
    );
    
    const fetchTermsPromise = async () => {
      // Try to fetch a limited number of terms for the sitemap
      // We'll use the API but with a small limit to avoid timeout
      const response = await fetch('https://www.devlingo.com.br/api/v1/terms?limit=100', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Use AbortSignal for additional timeout control
        signal: AbortSignal.timeout(25000) // 25 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.terms || [];
      }
      return [];
    };
    
    const terms = await Promise.race([fetchTermsPromise(), timeoutPromise]);
    
    if (Array.isArray(terms) && terms.length > 0) {
      console.log(`[Sitemap] Fetched ${terms.length} sample terms for sitemap`);
      
      // Generate URLs for the sample terms
      termPages = terms.map(term => ({
        url: `https://www.devlingo.com.br/termos/${term.name}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
      
      // Generate why-learn pages for sample terms
      whyLearnPages = terms.map(term => ({
        url: `https://www.devlingo.com.br/por-que-aprender/${term.name}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      }));
      
      // Generate a few comparison pages based on related terms
      const comparisons = [];
      terms.forEach(term => {
        if (term.relatedTerms && Array.isArray(term.relatedTerms)) {
          term.relatedTerms.slice(0, 2).forEach(related => {
            if (related.slug) {
              comparisons.push({
                url: `https://www.devlingo.com.br/compare/${term.name}/vs/${related.slug}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
              });
            }
          });
        }
      });
      comparisonPages = comparisons.slice(0, 50); // Limit comparisons
    }
    
  } catch (error) {
    console.error(`[Sitemap] Error fetching terms: ${error.message}`);
    // Continue without term pages
  }

  // Important SEO pages to always include
  const importantTerms = [
    'api', 'rest', 'graphql', 'react', 'vue', 'angular', 'nodejs', 
    'javascript', 'typescript', 'python', 'java', 'golang', 'rust',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'devops', 'ci-cd',
    'git', 'github', 'gitlab', 'mongodb', 'postgresql', 'mysql', 'redis',
    'html', 'css', 'sass', 'webpack', 'vite', 'nextjs', 'gatsby',
    'machine-learning', 'deep-learning', 'ai', 'data-science', 'big-data'
  ];
  
  // Always include important terms even if API fails
  const importantTermPages = importantTerms.map(slug => ({
    url: `https://www.devlingo.com.br/termos/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  
  const importantWhyLearnPages = importantTerms.map(slug => ({
    url: `https://www.devlingo.com.br/por-que-aprender/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  
  // Some important comparisons
  const importantComparisons = [
    { from: 'rest', to: 'graphql' },
    { from: 'react', to: 'vue' },
    { from: 'react', to: 'angular' },
    { from: 'nodejs', to: 'python' },
    { from: 'docker', to: 'kubernetes' },
    { from: 'aws', to: 'azure' },
    { from: 'mongodb', to: 'postgresql' },
    { from: 'javascript', to: 'typescript' },
  ];
  
  const importantComparisonPages = importantComparisons.map(comp => ({
    url: `https://www.devlingo.com.br/compare/${comp.from}/vs/${comp.to}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Combine all pages
  const allPages = [
    ...staticPages,
    ...alphabetPages,
    ...categoryPages,
    ...importantTermPages,
    ...importantWhyLearnPages,
    ...importantComparisonPages,
    ...termPages,
    ...whyLearnPages,
    ...comparisonPages,
  ];
  
  // Remove duplicates based on URL
  const uniquePages = Array.from(
    new Map(allPages.map(page => [page.url, page])).values()
  );
  
  console.log(`[Sitemap] Generated ${uniquePages.length} unique URLs`);
  
  return uniquePages;
}