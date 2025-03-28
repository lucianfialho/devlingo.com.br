export default async function sitemap() {
  // Obtenha todos os termos da sua API
  const termsResponse = await fetch(`https://www.devlingo.com.br/api/v1/terms?limit=1000`);
  const termsData = await termsResponse.json();
  const terms = termsData.terms || [];

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
  const termPages = terms.map(term => ({
    url: `https://www.devlingo.com.br/termos/${term.name}`,
    lastModified: new Date(term.last_updated) || new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Combine todas as páginas
  return [
    ...staticPages,
    ...alphabetPages,
    ...categoryPages,
    ...termPages,
  ];
}