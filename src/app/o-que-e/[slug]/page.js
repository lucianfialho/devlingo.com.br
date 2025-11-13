import JsonLd from "@/components/JsonLd";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardFooter,
} from "@/components/ui/card";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import removeMarkdown from "markdown-to-text";
import UseFulnessFeedback from "@/components/UseFulnessFeedback";
import RelatedTerms from "@/components/RelatedTerms";
import AdSenseAd from "@/components/AdSenseAd";

// Componente para breadcrumbs
const Breadcrumbs = ({ category, slug }) => {
  const slugData = {
    "internet": "Internet",
    "hardware": "Hardware",
    "software": "Software",
    "tecnico": "Técnico",
    "technical": "Técnico",
    "acronimo": "Acrônimos",
    "acronyms": "Acrônimos",
    "bits_and_bytes": "Bits e Bytes",
    "bits-and-bytes": "Bits e Bytes",
    "formato-de-arquivos": "Formatos de Arquivos",
    "file_formats": "Formatos de Arquivos",
  };

  return (
    <nav className="text-sm breadcrumbs mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2" itemScope itemType="https://schema.org/BreadcrumbList">
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link href="/" className="text-gray-500 hover:text-blue-600" itemProp="item">
            <span itemProp="name">Início</span>
          </Link>
          <meta itemProp="position" content="1" />
          <span className="mx-2 text-gray-400">/</span>
        </li>
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link href="/termos" className="text-gray-500 hover:text-blue-600" itemProp="item">
            <span itemProp="name">Termos</span>
          </Link>
          <meta itemProp="position" content="2" />
          <span className="mx-2 text-gray-400">/</span>
        </li>
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link href={`/categoria/${category}`} className="text-gray-500 hover:text-blue-600" itemProp="item">
            <span itemProp="name">{slugData[category] || category}</span>
          </Link>
          <meta itemProp="position" content="3" />
          <span className="mx-2 text-gray-400">/</span>
        </li>
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <span className="text-gray-700 font-medium" itemProp="name">O que é {slug.replace(/-/g, " ")}</span>
          <meta itemProp="position" content="4" />
        </li>
      </ol>
    </nav>
  );
};

// Componente para o nível técnico
const TechnicalLevel = ({ content, isStructured, structuredContent }) => {
  let contentToAnalyze = '';

  if (isStructured && structuredContent) {
    contentToAnalyze = Object.values(structuredContent)
      .map(section => section.content || '')
      .join(' ');
  } else {
    contentToAnalyze = content;
  }

  const contentLength = contentToAnalyze.length;
  const complexityWords = ['avançado', 'complexo', 'especializado', 'profissional'];
  const hasComplexWords = complexityWords.some(word => contentToAnalyze.toLowerCase().includes(word));

  let level = "Básico";
  if (contentLength > 2000 || hasComplexWords) {
    level = "Avançado";
  } else if (contentLength > 1000) {
    level = "Intermediário";
  }

  const colors = {
    "Básico": "bg-green-100 text-green-800",
    "Intermediário": "bg-blue-100 text-blue-800",
    "Avançado": "bg-purple-100 text-purple-800"
  };

  return (
    <Badge className={`${colors[level]} text-xs font-medium px-2.5 py-0.5 rounded`}>
      {level}
    </Badge>
  );
};

// Componente para a definição em destaque (FEATURED SNIPPET OPTIMIZED)
const QuickAnswer = ({ firstParagraph, slug }) => {
  // Extrair os primeiros 40-60 palavras para featured snippet
  const words = firstParagraph.split(' ');
  const quickAnswer = words.slice(0, Math.min(60, words.length)).join(' ') + (words.length > 60 ? '...' : '');

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 my-6 rounded-r-lg shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-2">
            Resposta Rápida
          </h2>
          <p className="text-blue-900 text-lg leading-relaxed font-medium">
            {quickAnswer}
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente para renderizar só a seção de introdução (definition focus)
const DefinitionContent = ({ term, slug }) => {
  const isStructuredContent = typeof term.content === 'object' && !Array.isArray(term.content);

  // Extrair só a introdução/primeira seção
  let introductionContent = '';

  if (isStructuredContent && term.content) {
    // Pegar a primeira seção (geralmente "introduction" ou similar)
    const firstSection = Object.values(term.content)[0];
    introductionContent = firstSection?.content || '';
  } else {
    // Para conteúdo markdown tradicional, pegar até o segundo H2
    const content = term.content || '';
    const sections = content.split(/##\s/);
    introductionContent = sections[0] || content;
  }

  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => null, // Remove H1 duplicado
          h2: ({ node, children, ...props }) => {
            const id = String(children).toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
            return (
              <h2 id={id} className="text-2xl font-semibold mt-8 mb-4 text-gray-900" {...props}>
                {children}
              </h2>
            );
          },
          h3: ({ node, children, ...props }) => {
            const id = String(children).toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
            return (
              <h3 id={id} className="text-xl font-semibold mt-6 mb-3 text-gray-800" {...props}>
                {children}
              </h3>
            );
          },
          p: ({ node, children, ...props }) => (
            <p className="my-4 text-base leading-relaxed text-gray-700" {...props}>{children}</p>
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc ml-6 my-4 space-y-2 text-gray-700" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal ml-6 my-4 space-y-2 text-gray-700" {...props} />
          ),
          li: ({ node, ...props }) => <li className="my-1" {...props} />,
          a: ({ node, ...props }) => (
            <a className="text-blue-600 underline hover:text-blue-800" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-gray-900" {...props} />
          ),
          code: ({ node, inline, ...props }) => {
            if (inline) {
              return (
                <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
              );
            }
            return (
              <div className="bg-gray-900 rounded-lg overflow-x-auto my-4">
                <pre className="p-4 text-white">
                  <code className="text-sm font-mono" {...props} />
                </pre>
              </div>
            );
          },
        }}
      >
        {introductionContent}
      </ReactMarkdown>

      {/* CTA para ver mais detalhes */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-700 mb-3">
          <strong>Quer saber mais?</strong> Veja o artigo completo com exemplos de código, casos de uso e comparações:
        </p>
        <Link
          href={`/termos/${slug}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver artigo completo sobre {slug.replace(/-/g, " ")}
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

// FAQ Component (optimized for featured snippets)
const FAQSection = ({ faq }) => {
  if (!Array.isArray(faq) || faq.length === 0) return null;

  // Pegar só as 3 primeiras perguntas para página de definição
  const topFAQ = faq.slice(0, 3);

  return (
    <section className="w-full py-8 mt-8 border-t border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">Perguntas Frequentes</h2>
      <div className="space-y-4">
        {topFAQ.map((item, index) => (
          <details
            key={index}
            className="group border border-gray-200 rounded-lg p-5 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <summary className="cursor-pointer font-medium text-gray-900 list-none flex items-center justify-between text-lg">
              <span className="flex-1 pr-4">{item.question}</span>
              <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="mt-4 pt-4 border-t border-gray-200 text-gray-700 leading-relaxed">
              {item.answer}
            </div>
          </details>
        ))}
      </div>

      {faq.length > 3 && (
        <p className="mt-4 text-sm text-gray-600">
          <Link href={`/termos/${slug}`} className="text-blue-600 hover:underline">
            Ver todas as {faq.length} perguntas frequentes →
          </Link>
        </p>
      )}
    </section>
  );
};

const slugData = {
  "internet": "internet",
  "hardware": "hardware",
  "software": "software",
  "technical": "tecnico",
  "tecnico": "tecnico",
  "acronyms": "acronimo",
  "acronimo": "acronimo",
  "bits-and-bytes": "bits_and_bytes",
  "bits_and_bytes": "bits_and_bytes",
  "file_formats": "formato-de-arquivos",
};

const fetchData = async (slug) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/v1/term/${slug}`);
  const data = await response.json();
  return data;
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { term } = await fetchData(slug);

  if (!term) return notFound();

  const cleanSlug = slug.replaceAll("-", " ");

  // Meta description OTIMIZADA para "o que é" intent
  const metaDescription = `O que é ${cleanSlug}? Entenda a definição, conceito e significado de forma clara e objetiva. Explicação simples em português para desenvolvedores.`;

  return {
    title: `O que é ${cleanSlug}? Definição e Significado | DevLingo`,
    description: metaDescription,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_URL}/o-que-e/${slug}`,
    },
    openGraph: {
      title: `O que é ${cleanSlug}? Definição Completa`,
      description: metaDescription,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_URL}/o-que-e/${slug}`,
      images: [`https://www.devlingo.com.br/api/og?term=${slug}&type=definition`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `O que é ${cleanSlug}?`,
      description: metaDescription,
    }
  };
}

export default async function OQueEPage({ params }) {
  const { slug } = await params;
  const { term } = await fetchData(slug);

  if (!term) return notFound();

  const isStructuredContent = typeof term.content === 'object' && !Array.isArray(term.content);
  const category = term.category;
  const content = isStructuredContent ? '' : term.content;
  const faq = term.faq;

  // Extrair primeiro parágrafo para Quick Answer
  let firstParagraph = '';
  if (isStructuredContent) {
    const firstSection = Object.values(term.content)[0];
    firstParagraph = removeMarkdown(firstSection?.content || '');
  } else {
    const paragraphs = content.split('\n').filter(p => p.trim().length > 0);
    firstParagraph = removeMarkdown(paragraphs[0] || '');
  }

  const cleanSlug = slug.replace(/-/g, " ");

  // Schema.org OTIMIZADO para definição + Featured Snippet
  const jsonLdData = [
    {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      "name": cleanSlug,
      "description": firstParagraph,
      "url": `${process.env.NEXT_PUBLIC_URL}/o-que-e/${slug}`,
      "inDefinedTermSet": {
        "@type": "DefinedTermSet",
        "name": "DevLingo: Dicionário Técnico Brasileiro",
        "url": "https://devlingo.com.br"
      },
      "termCode": category
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": `O que é ${cleanSlug}?`,
      "description": firstParagraph,
      "articleBody": firstParagraph,
      "author": {
        "@type": "Organization",
        "name": "DevLingo",
        "url": "https://devlingo.com.br"
      },
      "publisher": {
        "@type": "Organization",
        "name": "DevLingo",
        "logo": {
          "@type": "ImageObject",
          "url": "https://devlingo.com.br/logo.png"
        }
      },
      "datePublished": "2025-05-16",
      "dateModified": new Date().toISOString(),
      "mainEntityOfPage": `${process.env.NEXT_PUBLIC_URL}/o-que-e/${slug}`,
      "url": `${process.env.NEXT_PUBLIC_URL}/o-que-e/${slug}`,
      "inLanguage": "pt-BR",
      "about": {
        "@type": "Thing",
        "name": cleanSlug,
        "description": firstParagraph
      }
    }
  ];

  // Adicionar FAQPage schema se existir (CRUCIAL para featured snippets!)
  if (faq && faq.length > 0) {
    jsonLdData.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faq.slice(0, 3).map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    });
  }

  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground px-4 sm:px-6 mt-24 bg-dark">
      <JsonLd data={jsonLdData} />

      <div className="w-full max-w-3xl">
        {/* Breadcrumbs */}
        <Breadcrumbs category={category} slug={slug} />

        <Card className="shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div className="flex-1">
                {/* H1 otimizado para "o que é" query */}
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                  O que é <span className="text-blue-600">{cleanSlug}</span>?
                </h1>
                <CardDescription className="flex items-center gap-2 mt-3">
                  <Link href={`/categoria/${slugData[category]}`} className="text-blue-600 hover:underline">
                    {category}
                  </Link>
                  <span className="text-gray-400">•</span>
                  <TechnicalLevel
                    content={content}
                    isStructured={isStructuredContent}
                    structuredContent={term.content}
                  />
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Quick Answer (Featured Snippet Optimized) */}
            <QuickAnswer firstParagraph={firstParagraph} slug={slug} />

            {/* Ad #1: In-Article após Quick Answer */}
            <AdSenseAd
              adSlot="7280255067"
              adFormat="fluid"
              adLayout="in-article"
              className="my-6"
            />

            {/* Conteúdo de definição (só introdução) */}
            <DefinitionContent term={term} slug={slug} />

            {/* Ad #2: In-Article antes do FAQ */}
            <AdSenseAd
              adSlot="3497633164"
              adFormat="fluid"
              adLayout="in-article"
              className="my-8"
            />

            {/* FAQ Section (Top 3) */}
            <FAQSection faq={faq} slug={slug} />

            {/* Termos relacionados */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Termos Relacionados
              </h2>
              <RelatedTerms currentTerm={slug} />
            </div>

            {/* Ad #3: Multiplex após Related Terms */}
            <AdSenseAd
              adSlot="8042672391"
              adFormat="autorelaxed"
              className="mt-8"
            />
          </CardContent>

          <CardFooter className="flex justify-center border-t border-gray-200 pt-6">
            <UseFulnessFeedback />
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
