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
          <span className="text-gray-700 font-medium" itemProp="name">{slug.replace(/-/g, " ")}</span>
          <meta itemProp="position" content="4" />
        </li>
      </ol>
    </nav>
  );
};

// Componente para tabela de conteúdo
const TableOfContents = ({ content, isStructured, structuredContent, faq }) => {
  const headings = [];
  
  if (isStructured && structuredContent) {
    // Para conteúdo estruturado
    Object.keys(structuredContent).forEach(key => {
      if (structuredContent[key].heading) {
        headings.push({
          id: structuredContent[key].heading.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-'),
          text: structuredContent[key].heading
        });
      }
    });
  } else {
    // Para conteúdo tradicional (formato texto)
    content.split('\n')
      .filter(line => line.startsWith('## '))
      .forEach(line => {
        headings.push({
          id: line.replace('## ', '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-'),
          text: line.replace('## ', '')
        });
      });
  }
  
  // Adicionar FAQ ao índice se existir
  if (faq && faq.length > 0) {
    headings.push({
      id: 'perguntas-frequentes',
      text: 'Perguntas Frequentes'
    });
  }
  
  if (headings.length < 2) return null;

  return (
    <nav className="toc bg-gray-50 p-4 rounded-lg my-4">
      <h3 className="text-lg font-semibold mb-2">Neste artigo:</h3>
      <ul className="list-none ml-0 space-y-1">
        {headings.map((heading, index) => (
          <li key={index}>
            <a 
              href={`#${heading.id}`} 
              className="text-blue-600 hover:underline"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// Componente para detecção do nível técnico do termo
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

// Componente para a definição em destaque
const HighlightedDefinition = ({ firstParagraph }) => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r">
      <p className="text-blue-900">{firstParagraph}</p>
    </div>
  );
};

// Componente para exemplos de código com syntax highlighting
const CodeExamples = ({ codeExamples, slug }) => {
  if (!codeExamples?.length) return null;
  
  return (
    <div className="my-6">
      <h2 id="exemplos-de-codigo" className="text-2xl font-semibold mt-5 mb-3">
        Exemplos de código em {slug.replace(/-/g, " ")}
      </h2>
      <div className="space-y-4">
        {codeExamples.map((codeExample, index) => (
          <div key={index} className="bg-gray-900 rounded-lg overflow-x-auto">
            <div className="flex items-center px-4 py-2 text-xs text-white">
              <span className="text-sm font-semibold">{codeExample.language}</span>
            </div>
            <pre className="language-javascript p-4 text-white">
              <code>{codeExample.code}</code>
            </pre>
            {codeExample.description && (
              <div className="p-2 bg-gray-800 text-gray-300 text-sm">
                {codeExample.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para FAQs
const FAQSection = ({ faq }) => {
  if (!Array.isArray(faq) || faq.length === 0) return null;
  
  return (
    <section className="w-full py-6">
      <h2 id="perguntas-frequentes" className="text-2xl font-semibold mb-4">❓ Perguntas Frequentes</h2>
      <div className="space-y-4">
        {faq.map((item, index) => (
          <details key={index} className="group border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
            <summary className="cursor-pointer font-medium text-gray-900 list-none flex items-center justify-between">
              <span className="flex-1">{item.question}</span>
              <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="mt-3 pt-3 border-t border-gray-300 text-gray-700 leading-relaxed">
              <ReactMarkdown components={customMarkdownComponents}>
                {item.answer}
              </ReactMarkdown>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
};


// Componente para renderizar conteúdo estruturado
const StructuredContent = ({ structuredContent }) => {
  if (!structuredContent) return null;
  
  return (
    <div className="prose prose-blue max-w-none">
      {Object.keys(structuredContent).map((key, index) => {
        const section = structuredContent[key];
        const headingId = section.heading?.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
        
        return (
          <div key={index} className="mb-8">
            {section.heading && (
              <h2 id={headingId} className="text-2xl font-semibold mt-6 mb-3 pt-2 border-t border-gray-200">
                {section.heading}
              </h2>
            )}
            <ReactMarkdown components={customMarkdownComponents}>
              {section.content}
            </ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
};

// Componente para modificar os títulos e adicionar IDs para âncoras
const customMarkdownComponents = {
  h1: ({ node, ...props }) => (
    <span className="text-3xl hidden font-bold mt-6 mb-4" {...props} />
  ),
  h2: ({ node, children, ...props }) => {
    const id = String(children).toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
    return (
      <h2 id={id} className="text-2xl font-semibold mt-6 mb-3 pt-2 border-t border-gray-200" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    const id = String(children).toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
    return (
      <h3 id={id} className="text-xl font-semibold mt-5 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  p: ({ node, children, ...props }) => (
    <p className="my-3 text-base leading-relaxed" {...props}>{children}</p>
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-disc ml-6 my-3 space-y-1" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal ml-6 my-3 space-y-1" {...props} />
  ),
  li: ({ node, ...props }) => <li className="my-1" {...props} />,
  a: ({ node, ...props }) => (
    <a className="text-blue-600 underline hover:text-blue-800" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-4 pl-4 italic text-gray-600 my-4" {...props} />
  ),
  code: ({ node, inline, className, children, ...props }) => {
    if (inline) {
      return (
        <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      );
    }
    return (
      <div className="bg-gray-900 rounded-lg overflow-x-auto my-4">
        <pre className="p-4 text-white">
          <code className="text-sm" {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  },
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-4">
      <table className="table-auto border-collapse border border-gray-300 w-full" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => (
    <thead className="bg-gray-100" {...props} />
  ),
  tbody: ({ node, ...props }) => (
    <tbody {...props} />
  ),
  tr: ({ node, ...props }) => (
    <tr className="border-t border-gray-300" {...props} />
  ),
  th: ({ node, ...props }) => (
    <th className="px-4 py-2 text-left font-semibold text-gray-700" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td className="px-4 py-2 text-gray-600" {...props} />
  ),
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

const fetchCategoryData = async (category) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/v1/category/${category}`);
  const data = await response.json();
  return data;
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { term } = await fetchData(slug);

  if (!term) return notFound();
  
  // Criação da meta description melhorada
  const cleanSlug = slug.replaceAll("-", " ");
  const metaDescription = term.metaDescription || `Entenda o que é ${cleanSlug}, como funciona, principais características e exemplos práticos de uso. Explicação clara em português para desenvolvedores.`;

  return {
    title: `${cleanSlug} - Definição e Como Funciona | DevLingo`,
    description: metaDescription,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_URL}/termos/${slug}`,
    },
    openGraph: {
      title: `${cleanSlug} - Definição e Como Funciona | DevLingo`,
      description: metaDescription,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_URL}/termos/${slug}`,
      images: [`https://www.devlingo.com.br/api/og?term=${slug}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cleanSlug} - Definição e Como Funciona | DevLingo`,
      description: metaDescription,
    }
  };
}

export default async function TermPage({ params }) {
  const { slug } = await params;
  const { term } = await fetchData(slug);
  
  if (!term) return notFound();

  // Verificar o formato do conteúdo (estruturado ou string)
  const isStructuredContent = typeof term.content === 'object' && !Array.isArray(term.content);
  const category = term.category;
  const content = isStructuredContent ? '' : term.content;
  const codeExamples = term.codeExamples;
  const faq = term.faq; // Nova propriedade FAQ
  
  // Extrair o primeiro parágrafo para uso na descrição
  let firstParagraph = '';
  if (isStructuredContent) {
    const firstSection = Object.values(term.content)[0];
    firstParagraph = removeMarkdown(firstSection?.content || '');
  } else {
    const paragraphs = content.split('\n');
    firstParagraph = removeMarkdown(paragraphs[2] || '');
  }
  
  const withoutMark = isStructuredContent 
    ? removeMarkdown(Object.values(term.content).map(item => item.content || '').join(' ')) 
    : removeMarkdown(content);

  const { terms: categoryTerms } = await fetchCategoryData(category);
  const relatedTerms = term.relatedTerms || categoryTerms;

  // Schema.org aprimorado com DefinedTerm e FAQPage
  const jsonLdData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": term.title || `O que é ${slug.replace(/-/g, " ")}?`,
      "description": firstParagraph,
      "abstract": firstParagraph,
      "text": withoutMark,
      "author": {
        "@type": "Organization",
        "name": "Devlingo",
        "url": "https://devlingo.com.br"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Devlingo",
      },
      "datePublished": "2025-05-16",
      "copyrightYear": "2025",
      "copyrightHolder": {
        "@type": "Organization",
        "name": "Devlingo"
      },
      "mainEntityOfPage": `${process.env.NEXT_PUBLIC_URL}/termos/${slug}`,
      "url": `${process.env.NEXT_PUBLIC_URL}/termos/${slug}`,
      "teaches": {
        "@type": "DefinedTerm",
        "url": `${process.env.NEXT_PUBLIC_URL}/termos/${slug}`,
        "name": term.slug || slug,
        "description": firstParagraph
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "everyone"
      },
      "genre": "Technology",
      "inLanguage": "pt-BR",
      "isFamilyFriendly": "True",
      "keywords": (term.title || slug.replace(/-/g, " ")).toLowerCase().split(" ").join(", "),
      "locationCreated": {
        "@type": "Place",
        "name": "Brasil"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      "name": slug.replace(/-/g, " "),
      "description": firstParagraph,
      "inDefinedTermSet": {
        "@type": "DefinedTermSet",
        "name": "DevLingo: Dicionário Brasileiro de Termos Técnicos em Tecnologia"
      },
      "termCode": category
    }
  ];

  // Adicionar Schema.org para FAQ se existir
  if (faq && faq.length > 0) {
    jsonLdData.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faq.map(item => ({
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
              <div>
                <h1 className="capitalize text-3xl font-bold">{term.title || `O que é ${slug.replace(/-/g, " ")}?`}</h1>
                <CardDescription className="flex items-center gap-2 mt-2">
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
            {/* Definição em destaque */}
            <HighlightedDefinition firstParagraph={firstParagraph} />
            
            {/* Tabela de conteúdo */}
            <TableOfContents 
              content={content} 
              isStructured={isStructuredContent} 
              structuredContent={term.content}
            />
            
            {/* Conteúdo principal */}
            {isStructuredContent ? (
              <StructuredContent structuredContent={term.content} />
            ) : (
              <div className="prose prose-blue max-w-none">
                <ReactMarkdown components={customMarkdownComponents}>
                  {content}
                </ReactMarkdown>
              </div>
            )}
            
            {/* Exemplos de código */}
            <CodeExamples codeExamples={codeExamples} slug={slug} />
            
            {/* FAQ Section */}
            <FAQSection faq={faq} />
            
            {/* Termos relacionados */}
            <RelatedTerms currentTerm={slug} />
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <UseFulnessFeedback />
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}