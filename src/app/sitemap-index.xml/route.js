export async function GET() {
  const sitemaps = [
    'https://www.devlingo.com.br/sitemap.xml',
    // Future sitemaps can be added here
    // 'https://www.devlingo.com.br/sitemap-terms-1.xml',
    // 'https://www.devlingo.com.br/sitemap-terms-2.xml',
    // 'https://www.devlingo.com.br/sitemap-comparisons.xml',
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps
    .map(
      (sitemap) => `
  <sitemap>
    <loc>${sitemap}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
    )
    .join('')}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}