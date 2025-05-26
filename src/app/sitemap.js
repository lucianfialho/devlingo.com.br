// Helper function to fetch with retries and detailed logging

// Helper function to fetch with retries
async function fetchWithRetry(url, options, maxRetries = 3) {
  console.log(`[Sitemap] Fetching from: ${url}`);
  const startTime = Date.now();
  
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Sitemap] Attempt ${attempt}/${maxRetries}...`);
      const response = await fetch(url, options);
      const elapsed = Date.now() - startTime;
      console.log(`[Sitemap] Received response in ${elapsed}ms with status: ${response.status}`);
      
      return response;
    } catch (error) {
      lastError = error;
      const elapsed = Date.now() - startTime;
      console.error(`[Sitemap] Attempt ${attempt} failed after ${elapsed}ms: ${error.message}`);
      
      // Don't wait on the last attempt
      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 1000, 5000);
        console.log(`[Sitemap] Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export default async function sitemap() {
  // Obtenha todos os termos da sua API
  let terms = [];
  const apiUrl = `https://www.devlingo.com.br/api/v1/terms?limit=1000`;
  
  console.log(`[Sitemap] Starting generation. Current time: ${new Date().toISOString()}`);
  
  try {
      console.log(`[Sitemap] Attempting to fetch terms from: ${apiUrl}`);
      
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        // Set timeout to avoid hanging the build
        signal: AbortSignal.timeout(30000) // 30 second timeout
      };
      
      const termsResponse = await fetchWithRetry(apiUrl, fetchOptions, 3);

      // Check if the response is ok (status code 200-299)
      if (!termsResponse.ok) {
        // Log the response status and statusText
        console.error(`[Sitemap] API Error: ${termsResponse.status} ${termsResponse.statusText}`);
        
        // Check specifically for 504 timeout errors
        if (termsResponse.status === 504) {
          console.error(`[Sitemap] Detected Vercel function timeout (504)`);
          
          // Log Vercel-specific headers if they exist
          const vercelError = termsResponse.headers.get('x-vercel-error');
          const vercelId = termsResponse.headers.get('x-vercel-id');
          
          if (vercelError) {
            console.error(`[Sitemap] Vercel error: ${vercelError}`);
          }
          
          if (vercelId) {
            console.error(`[Sitemap] Vercel request ID: ${vercelId}`);
          }
          
          // Try to get text response for more details
          try {
            const textResponse = await termsResponse.text();
            console.error(`[Sitemap] Error response (truncated): ${textResponse.substring(0, 200)}`);
          } catch (textError) {
            console.error(`[Sitemap] Could not read error response: ${textError.message}`);
          }
        }
        
        // Log all response headers for debugging
        console.error(`[Sitemap] Response headers: ${JSON.stringify(Object.fromEntries([...termsResponse.headers]))}`);
        
        // Continue with empty terms (fallback to just using static routes)
      } else {
        // Check content type to ensure it's JSON
        const contentType = termsResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          console.log(`[Sitemap] Response looks good. Content-Type: ${contentType}`);
          const termsData = await termsResponse.json();
          terms = termsData.terms || [];
          console.log(`[Sitemap] Successfully fetched ${terms.length} terms for sitemap`);
          // Terms fetched successfully
        } else {
          console.error(`[Sitemap] API returned non-JSON content: ${contentType}`);
          // Get text response for logging
          const textResponse = await termsResponse.text();
          console.error(`[Sitemap] Response body (truncated): ${textResponse.substring(0, 200)}`);
          
          // Continue with empty terms (fallback to just using static routes)
        }
      }
    } catch (error) {
      console.error(`[Sitemap] Error fetching terms for sitemap: ${error.message}`);
      console.error(`[Sitemap] Error stack: ${error.stack}`);
      
      // Continue with empty terms (fallback to just using static routes)
    }

  // URLs estáticas
  const staticPages = [
    {
      url: 'https://www.devlingo.com.br',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://www.devlingo.com.br/termos',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Páginas de lista alfabética
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const alphabetPages = alphabet.map(letter => ({
    url: `https://www.devlingo.com.br/lista/${letter}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Páginas de categorias
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

  // Páginas de termos individuais
  let termPages = [];
  
  // Check if terms is an array before mapping
  if (Array.isArray(terms)) {
    console.log(`[Sitemap] Processing ${terms.length} terms for sitemap`);
    
    // Safe mapping with error handling for each term
    termPages = terms.map(term => {
      try {
        // Validate term object to prevent errors
        if (!term || typeof term !== 'object') {
          console.error(`[Sitemap] Invalid term object: ${JSON.stringify(term)}`);
          return null;
        }
        
        // Ensure term has a name and it's a valid string
        if (!term.name || typeof term.name !== 'string' || term.name.trim() === '') {
          console.error(`[Sitemap] Term missing valid name: ${JSON.stringify(term)}`);
          return null;
        }
        
        // Sanitize name for URL (basic sanitization)
        const sanitizedName = term.name.trim();
        
        return {
          url: `https://www.devlingo.com.br/termos/${sanitizedName}`,
          lastModified: term.last_updated ? new Date(term.last_updated) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        };
      } catch (termError) {
        console.error(`[Sitemap] Error processing term: ${termError.message}`);
        return null;
      }
    }).filter(Boolean); // Filter out null entries
    
    console.log(`[Sitemap] Generated ${termPages.length} valid term URLs from ${terms.length} terms`);
  } else {
    console.warn(`[Sitemap] Terms is not an array, skipping term pages. Type: ${typeof terms}`);
  }

  // Combine todas as páginas
  const allPages = [
    ...staticPages,
    ...alphabetPages,
    ...categoryPages,
    ...termPages,
  ];
  
  console.log(`[Sitemap] Generated total of ${allPages.length} URLs for sitemap`);
  return allPages;
}