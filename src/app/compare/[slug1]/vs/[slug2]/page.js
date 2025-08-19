import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import JsonLd from "@/components/JsonLd";
import RelatedTerms from "@/components/RelatedTerms";
import redisClient from "@/lib/redisClient";

async function getTerm(slug) {
  try {
    const termData = await redisClient.get(`terms:${slug}`);
    if (!termData) return null;
    
    return {
      ...JSON.parse(termData),
      slug: slug
    };
  } catch (error) {
    console.error("Error fetching term:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug1, slug2 } = params;
  const term1 = await getTerm(slug1);
  const term2 = await getTerm(slug2);
  
  if (!term1 || !term2) {
    return {
      title: "Comparação não encontrada",
      description: "Os termos solicitados não foram encontrados."
    };
  }
  
  const title = `${term1.title} vs ${term2.title}: Qual a Diferença?`;
  const description = `Compare ${term1.title} e ${term2.title}. Entenda as diferenças, semelhanças e quando usar cada um no desenvolvimento de software.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://devlingo.com.br/compare/${slug1}/vs/${slug2}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://devlingo.com.br/compare/${slug1}/vs/${slug2}`
    }
  };
}

export default async function ComparePage({ params }) {
  const { slug1, slug2 } = params;
  const term1 = await getTerm(slug1);
  const term2 = await getTerm(slug2);
  
  if (!term1 || !term2) {
    notFound();
  }
  
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${term1.title} vs ${term2.title}: Qual a Diferença?`,
    "description": `Compare ${term1.title} e ${term2.title}. Entenda as diferenças, semelhanças e quando usar cada um.`,
    "author": {
      "@type": "Organization",
      "name": "DevLingo"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DevLingo",
      "url": "https://devlingo.com.br"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://devlingo.com.br/compare/${slug1}/vs/${slug2}`
    }
  };
  
  return (
    <main className="min-h-screen bg-background px-6 py-8 mt-20">
      <JsonLd data={jsonLdData} />
      
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/termos" className="hover:text-foreground">Termos</Link>
          <span className="mx-2">/</span>
          <span>Comparação</span>
        </nav>
        
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {term1.title} <span className="text-muted-foreground">vs</span> {term2.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            Entenda as diferenças e quando usar cada tecnologia
          </p>
        </header>
        
        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Term 1 */}
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">{term1.title}</h2>
                <Badge variant="outline" className="mb-3">
                  {term1.category || "technical"}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">📝 Definição</h3>
                  <p className="text-muted-foreground">
                    {term1.metaDescription}
                  </p>
                </div>
                
                {term1.whyLearn && (
                  <div>
                    <h3 className="font-semibold mb-2">💡 Por que aprender?</h3>
                    <p className="text-muted-foreground">
                      {term1.whyLearn}
                    </p>
                  </div>
                )}
                
                <div className="pt-4">
                  <Link 
                    href={`/termos/${slug1}`}
                    className="text-primary hover:underline font-medium"
                  >
                    Ver detalhes completos →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Term 2 */}
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">{term2.title}</h2>
                <Badge variant="outline" className="mb-3">
                  {term2.category || "technical"}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">📝 Definição</h3>
                  <p className="text-muted-foreground">
                    {term2.metaDescription}
                  </p>
                </div>
                
                {term2.whyLearn && (
                  <div>
                    <h3 className="font-semibold mb-2">💡 Por que aprender?</h3>
                    <p className="text-muted-foreground">
                      {term2.whyLearn}
                    </p>
                  </div>
                )}
                
                <div className="pt-4">
                  <Link 
                    href={`/termos/${slug2}`}
                    className="text-primary hover:underline font-medium"
                  >
                    Ver detalhes completos →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Key Differences */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">🔍 Principais Diferenças</h2>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="font-semibold">Aspecto</div>
                <div className="font-semibold text-center">{term1.title}</div>
                <div className="font-semibold text-center">{term2.title}</div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 p-4 border-b">
                <div>Categoria</div>
                <div className="text-center">{term1.category || "technical"}</div>
                <div className="text-center">{term2.category || "technical"}</div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 p-4 border-b">
                <div>Complexidade</div>
                <div className="text-center">
                  {term1.content?.length > 2000 ? "Avançado" : "Intermediário"}
                </div>
                <div className="text-center">
                  {term2.content?.length > 2000 ? "Avançado" : "Intermediário"}
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 p-4">
                <div>Termos Relacionados</div>
                <div className="text-center">
                  {term1.relatedTerms?.length || 0} termos
                </div>
                <div className="text-center">
                  {term2.relatedTerms?.length || 0} termos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* When to Use */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">
                ✅ Quando usar {term1.title}
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Quando você precisa de {term1.title.toLowerCase()}</li>
                <li>• Em projetos que requerem essa tecnologia específica</li>
                <li>• Para resolver problemas relacionados a {term1.category}</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">
                ✅ Quando usar {term2.title}
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Quando você precisa de {term2.title.toLowerCase()}</li>
                <li>• Em projetos que requerem essa tecnologia específica</li>
                <li>• Para resolver problemas relacionados a {term2.category}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        {/* Related Terms */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">🔗 Explore Mais Termos</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {term1.relatedTerms && term1.relatedTerms.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Relacionados a {term1.title}
                </h3>
                <RelatedTerms terms={term1.relatedTerms} />
              </div>
            )}
            
            {term2.relatedTerms && term2.relatedTerms.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Relacionados a {term2.title}
                </h3>
                <RelatedTerms terms={term2.relatedTerms} />
              </div>
            )}
          </div>
        </div>
        
        {/* CTA */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              📚 Continue Aprendendo
            </h2>
            <p className="text-muted-foreground mb-6">
              Explore mais de 15.000 termos técnicos em português
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/termos"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Ver Todos os Termos
              </Link>
              <Link 
                href="/"
                className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10"
              >
                Voltar ao Início
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}