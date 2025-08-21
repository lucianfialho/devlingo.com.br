import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import JsonLd from "@/components/JsonLd";
import RelatedTerms from "@/components/RelatedTerms";
import redisClient from "@/lib/redisClient";
import { Code2, Terminal, FileCode, Lightbulb, Copy, Check } from "lucide-react";
import { useState } from "react";

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

// Client component for copy functionality
function CodeBlock({ code, language }) {
  "use client";
  
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative group">
      <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-slate-800 rounded hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-slate-400" />
        )}
      </button>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const term = await getTerm(params.slug);
  
  if (!term) {
    return {
      title: "Exemplos não encontrados",
      description: "Os exemplos solicitados não foram encontrados."
    };
  }
  
  const title = `${term.title}: Exemplos de Código e Implementação`;
  const description = `Veja exemplos práticos de ${term.title} com código comentado. Aprenda através de implementações reais e casos de uso.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://devlingo.com.br/exemplos/${params.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://devlingo.com.br/exemplos/${params.slug}`
    }
  };
}

export default async function ExamplesPage({ params }) {
  const term = await getTerm(params.slug);
  
  if (!term) {
    notFound();
  }
  
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": `Exemplos de ${term.title}`,
    "description": `Exemplos práticos e implementações de ${term.title}`,
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
      "@id": `https://devlingo.com.br/exemplos/${params.slug}`
    }
  };
  
  // Generate example code based on the term category
  const generateExamples = (term) => {
    const examples = [];
    
    // Basic example
    examples.push({
      title: `Exemplo Básico de ${term.title}`,
      description: `Um exemplo simples mostrando o uso fundamental de ${term.title}`,
      language: "javascript",
      code: `// Exemplo básico de ${term.title}
// Este código demonstra o conceito fundamental

function exemplo${term.slug.charAt(0).toUpperCase() + term.slug.slice(1)}() {
  // Implementação básica
  console.log("Trabalhando com ${term.title}");
  
  // Adicione sua lógica aqui
  const resultado = processarDados();
  return resultado;
}

// Uso
const result = exemplo${term.slug.charAt(0).toUpperCase() + term.slug.slice(1)}();
console.log(result);`
    });
    
    // Intermediate example
    examples.push({
      title: "Exemplo Intermediário",
      description: "Implementação mais complexa com tratamento de erros",
      language: "javascript",
      code: `// Exemplo intermediário com ${term.title}
class ${term.slug.charAt(0).toUpperCase() + term.slug.slice(1)}Handler {
  constructor(config) {
    this.config = config;
    this.initialize();
  }
  
  async initialize() {
    try {
      // Configuração inicial
      await this.setup();
      console.log("${term.title} inicializado com sucesso");
    } catch (error) {
      console.error("Erro ao inicializar:", error);
      throw error;
    }
  }
  
  async processData(data) {
    // Validação
    if (!data) {
      throw new Error("Dados inválidos");
    }
    
    // Processamento
    const result = await this.transform(data);
    return result;
  }
}

// Uso
const handler = new ${term.slug.charAt(0).toUpperCase() + term.slug.slice(1)}Handler({ debug: true });
await handler.processData(myData);`
    });
    
    // Advanced example
    examples.push({
      title: "Exemplo Avançado",
      description: "Implementação completa com padrões de projeto",
      language: "typescript",
      code: `// Exemplo avançado usando ${term.title} com TypeScript
interface ${term.slug.charAt(0).toUpperCase() + term.slug.slice(1)}Config {
  timeout?: number;
  retries?: number;
  debug?: boolean;
}

class Advanced${term.slug.charAt(0).toUpperCase() + term.slug.slice(1)} {
  private config: ${term.slug.charAt(0).toUpperCase() + term.slug.slice(1)}Config;
  private cache: Map<string, any>;
  
  constructor(config: ${term.slug.charAt(0).toUpperCase() + term.slug.slice(1)}Config = {}) {
    this.config = {
      timeout: 5000,
      retries: 3,
      debug: false,
      ...config
    };
    this.cache = new Map();
  }
  
  async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Check cache
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    let lastError: Error | null = null;
    
    for (let i = 0; i < this.config.retries!; i++) {
      try {
        const result = await this.withTimeout(fn(), this.config.timeout!);
        this.cache.set(key, result);
        return result;
      } catch (error) {
        lastError = error as Error;
        if (this.config.debug) {
          console.error(\`Attempt \${i + 1} failed:\`, error);
        }
      }
    }
    
    throw lastError;
  }
  
  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), ms)
      )
    ]);
  }
}`
    });
    
    return examples;
  };
  
  const examples = term.codeExamples && term.codeExamples.length > 0 
    ? term.codeExamples 
    : generateExamples(term);
  
  const useCases = [
    {
      icon: <Terminal className="w-5 h-5" />,
      title: "Linha de Comando",
      description: `Use ${term.title} em scripts e automações CLI`
    },
    {
      icon: <FileCode className="w-5 h-5" />,
      title: "Aplicações Web",
      description: `Implemente ${term.title} em projetos frontend e backend`
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      title: "APIs e Serviços",
      description: `Integre ${term.title} em APIs RESTful e microsserviços`
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Projetos Reais",
      description: `Aplique ${term.title} em soluções empresariais`
    }
  ];
  
  return (
    <main className="min-h-screen bg-background px-6 py-8 mt-20">
      <JsonLd data={jsonLdData} />
      
      <div className="max-w-5xl mx-auto">
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
          <span>Exemplos</span>
        </nav>
        
        {/* Header */}
        <header className="mb-12">
          <Badge variant="outline" className="mb-4">
            {term.category || "technical"}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Exemplos de {term.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            Aprenda através de código prático e implementações reais
          </p>
        </header>
        
        {/* Quick Overview */}
        <Card className="mb-12 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-3">📋 Resumo Rápido</h2>
            <p className="text-muted-foreground">
              {term.metaDescription}
            </p>
          </CardContent>
        </Card>
        
        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">💼 Onde Usar {term.title}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {useCases.map((useCase, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-primary mt-1">{useCase.icon}</div>
                    <div>
                      <h3 className="font-semibold mb-1">{useCase.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {useCase.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Code Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">💻 Exemplos de Código</h2>
          <div className="space-y-8">
            {examples.map((example, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {example.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {example.description}
                    </p>
                  </div>
                  <CodeBlock 
                    code={example.code} 
                    language={example.language || "javascript"} 
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">✅ Boas Práticas</h2>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Sempre valide dados de entrada ao trabalhar com {term.title}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Implemente tratamento de erros adequado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Use tipos TypeScript para maior segurança</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Documente seu código com comentários claros</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Escreva testes para validar implementações</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
        
        {/* Common Mistakes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">⚠️ Erros Comuns</h2>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">⚠</span>
                  <span>Não tratar casos de erro adequadamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">⚠</span>
                  <span>Esquecer de validar inputs do usuário</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">⚠</span>
                  <span>Não considerar performance em grandes volumes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">⚠</span>
                  <span>Ignorar boas práticas de segurança</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
        
        {/* Related Terms */}
        {term.relatedTerms && term.relatedTerms.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">🔗 Termos Relacionados</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  Explore outros conceitos relacionados a {term.title}:
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
              🚀 Pratique {term.title}
            </h2>
            <p className="text-muted-foreground mb-6">
              A melhor forma de aprender é praticando. Experimente os exemplos em seu próprio projeto!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link 
                href={`/termos/${params.slug}`}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Ver Definição Completa
              </Link>
              <Link 
                href={`/por-que-aprender/${params.slug}`}
                className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10"
              >
                Por que Aprender?
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Newsletter */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            📧 Receba novos exemplos de código toda semana
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