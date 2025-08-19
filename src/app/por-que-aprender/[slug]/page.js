import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import JsonLd from "@/components/JsonLd";
import RelatedTerms from "@/components/RelatedTerms";
import redisClient from "@/lib/redisClient";
import { CheckCircle2, TrendingUp, Users, Zap, BookOpen, Target } from "lucide-react";

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
  const term = await getTerm(params.slug);
  
  if (!term) {
    return {
      title: "Termo não encontrado",
      description: "O termo solicitado não foi encontrado."
    };
  }
  
  const title = `Por que aprender ${term.title}? Importância e Benefícios`;
  const description = term.whyLearn || `Descubra por que ${term.title} é importante para sua carreira. Entenda os benefícios, aplicações e o impacto no mercado de tecnologia.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://devlingo.com.br/por-que-aprender/${params.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://devlingo.com.br/por-que-aprender/${params.slug}`
    }
  };
}

export default async function WhyLearnPage({ params }) {
  const term = await getTerm(params.slug);
  
  if (!term) {
    notFound();
  }
  
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `Por que aprender ${term.title}?`,
    "description": term.whyLearn || `Entenda a importância de aprender ${term.title} e como isso pode impactar sua carreira.`,
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
      "@id": `https://devlingo.com.br/por-que-aprender/${params.slug}`
    }
  };
  
  const benefits = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Alta Demanda no Mercado",
      description: `Profissionais que dominam ${term.title} são muito procurados pelas empresas.`
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Aumento de Produtividade",
      description: `Conhecer ${term.title} pode acelerar significativamente seu desenvolvimento.`
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Comunidade Ativa",
      description: `Faça parte de uma comunidade global de desenvolvedores.`
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Resolução de Problemas",
      description: `${term.title} oferece soluções para desafios técnicos complexos.`
    }
  ];
  
  const learningPath = [
    { step: 1, title: "Fundamentos", description: "Comece pelos conceitos básicos" },
    { step: 2, title: "Prática", description: "Aplique em projetos pequenos" },
    { step: 3, title: "Aprofundamento", description: "Explore recursos avançados" },
    { step: 4, title: "Domínio", description: "Torne-se especialista na tecnologia" }
  ];
  
  return (
    <main className="min-h-screen bg-background px-6 py-8 mt-20">
      <JsonLd data={jsonLdData} />
      
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/termos" className="hover:text-foreground">Termos</Link>
          <span className="mx-2">/</span>
          <Link href={`/termos/${params.slug}`} className="hover:text-foreground">
            {term.title}
          </Link>
          <span className="mx-2">/</span>
          <span>Por que aprender</span>
        </nav>
        
        {/* Header */}
        <header className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">
            {term.category || "technical"}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Por que aprender {term.title}?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra os benefícios e a importância de dominar esta tecnologia
          </p>
        </header>
        
        {/* Main Reason */}
        {term.whyLearn && (
          <Card className="mb-12 bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <BookOpen className="w-8 h-8 text-primary mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-4">Importância Principal</h2>
                  <p className="text-lg leading-relaxed">
                    {term.whyLearn}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Benefits Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">💡 Benefícios de Aprender {term.title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-primary">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Learning Path */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">🎯 Roteiro de Aprendizado</h2>
          <Card>
            <CardContent className="p-8">
              <div className="space-y-6">
                {learningPath.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                      {index < learningPath.length - 1 && (
                        <div className="mt-4 border-l-2 border-dashed border-muted h-6 ml-5"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">🚀 Onde {term.title} é Utilizado</h2>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Desenvolvimento de aplicações modernas e escaláveis</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Resolução de problemas técnicos complexos</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Otimização de performance e eficiência</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Integração com outras tecnologias e ferramentas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Projetos de empresas líderes no mercado</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
        
        {/* Related Terms */}
        {term.relatedTerms && term.relatedTerms.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">📚 Próximos Passos de Aprendizado</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  Depois de dominar {term.title}, considere aprender:
                </p>
                <RelatedTerms terms={term.relatedTerms} />
              </CardContent>
            </Card>
          </section>
        )}
        
        {/* CTA Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              🎓 Comece a Aprender Agora
            </h2>
            <p className="text-muted-foreground mb-6">
              Aprofunde seu conhecimento em {term.title} e acelere sua carreira
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link 
                href={`/termos/${params.slug}`}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Ver Definição Completa
              </Link>
              {term.relatedTerms && term.relatedTerms.length > 0 && term.relatedTerms[0] && (
                <Link 
                  href={`/compare/${params.slug}/vs/${term.relatedTerms[0].slug}`}
                  className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10"
                >
                  Comparar com {term.relatedTerms[0].name}
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Newsletter CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            📧 Receba novos termos técnicos toda semana
          </p>
          <Link 
            href="/#newsletter"
            className="text-primary hover:underline font-medium"
          >
            Assinar Newsletter Gratuita →
          </Link>
        </div>
      </div>
    </main>
  );
}