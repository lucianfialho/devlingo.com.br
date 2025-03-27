
import JsonLd from "@/components/JsonLd";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardFooter,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import removeMarkdown from "markdown-to-text";
import UseFulnessFeedback from "@/components/UseFulnessFeedback";

// Componente para breadcrumbs
const Breadcrumbs = ({ category, slug }) => {
  const slugData = {
    "internet": "Internet",
    "hardware": "Hardware",
    "software": "Software",
    "tecnico": "Técnico",
    "acronimo": "Acrônimos",
    "bits_and_bytes": "Bits e Bytes",
    "formato-de-arquivos": "Formatos de Arquivos",
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
const TableOfContents = ({ content }) => {
  // Extrai os títulos H2 do conteúdo markdown
  const headings = content.split('\n')
    .filter(line => line.startsWith('## '))
    .map(line => ({
      id: line.replace('## ', '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-'),
      text: line.replace('## ', '')
    }));
  
  if (headings.length < 2) return null; // Não mostrar se tiver poucos headings
  
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
const TechnicalLevel = ({ content }) => {
  // Esta é uma lógica simples - em produção, você pode querer uma abordagem mais robusta
  const contentLength = content.length;
  const complexityWords = ['avançado', 'complexo', 'especializado', 'profissional'];
  const hasComplexWords = complexityWords.some(word => content.toLowerCase().includes(word));
  
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
            <pre className="language-javascript p-4 text-white">
              <code>{codeExample.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para termos relacionados
const RelatedTerms = ({ relatedTerms }) => {
  if (!Array.isArray(relatedTerms) || relatedTerms.length === 0) return null;
  
  return (
    <section className="w-full py-6">
      <h2 id="termos-relacionados" className="text-2xl font-semibold mb-4">📂 Termos relacionados</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {relatedTerms.map((relatedTerm, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="text-center py-3 px-2">
              <Link href={`/termos/${relatedTerm}`} className="text-blue-600 hover:underline text-sm md:text-base">
                {relatedTerm}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
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
};

const slugData = {
  "internet": "internet",
  "hardware": "hardware",
  "software": "software",
  "technical": "tecnico",
  "acronyms": "acronimo",
  "bits-and-bytes": "bits_and_bytes",
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
  const metaDescription = `Entenda o que é ${cleanSlug}, como funciona, principais características e exemplos práticos de uso. Explicação clara em português para desenvolvedores.`;

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
  const { category, content, codeExamples } = term;
  
  const paragraphs = content.split('\n');
  const firstParagraph = removeMarkdown(paragraphs[2] || '');
  const withoutMark = removeMarkdown(content);

  const { terms } = await fetchCategoryData(category);
  const relatedTerms = terms;

  // Schema.org aprimorado com DefinedTerm
  const jsonLdData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": term.title,
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
      "datePublished": "2025-02-25",
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
        "name": term.slug,
        "description": firstParagraph
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "everyone"
      },
      "genre": "Technology",
      "inLanguage": "pt-BR",
      "isFamilyFriendly": "True",
      "keywords": term.title.toLowerCase().split(" ").join(", "),
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
                <h1 className="capitalize text-3xl font-bold">{`O que é ${slug.replace(/-/g, " ")}?`}</h1>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Link href={`/categoria/${slugData[category]}`} className="text-blue-600 hover:underline">
                    {category}
                  </Link>
                  <span className="text-gray-400">•</span>
                  <TechnicalLevel content={content} />
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Definição em destaque */}
            <HighlightedDefinition firstParagraph={firstParagraph} />
            
            {/* Tabela de conteúdo */}
            <TableOfContents content={content} />
            
            {/* Conteúdo principal */}
            <div className="prose prose-blue max-w-none">
              <ReactMarkdown components={customMarkdownComponents}>
                {content}
              </ReactMarkdown>
            </div>
            
            {/* Exemplos de código */}
            <CodeExamples codeExamples={codeExamples} slug={slug} />
            
            {/* Termos relacionados */}
            <RelatedTerms relatedTerms={relatedTerms} />
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <UseFulnessFeedback />
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}