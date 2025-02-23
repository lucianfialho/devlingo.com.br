import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from "@/components/ui/card";

import Link from "next/link";
import ReactMarkdown from "react-markdown";

const markdownComponents = {
    h1: ({ node, ...props }) => (
      <span className="text-3xl hidden font-bold mt-6 mb-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl font-semibold mt-5 mb-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />
    ),
    p: ({ node, children, ...props }) => (
      <p className="my-2 text-base" {...props}>{children}</p>
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc ml-6 my-2" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal ml-6 my-2" {...props} />
    ),
    li: ({ node, ...props }) => <li className="my-1" {...props} />,
    a: ({ node, ...props }) => (
      <a className="text-blue-600 underline" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 pl-4 italic text-gray-600 my-4" {...props} />
    ),
};

const fetchData = async (slug) => {

    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/v1/term/${slug}`);
    const data = await response.json();

    return data;
}

export default async function CategoryPage({ params }) {
    const { slug } = await params;

    const { term } = await fetchData(slug);

    const { category, content, codeExamples, relatedTerms } = term;

    return (
        <main className="flex flex-col items-center min-h-screen bg-background text-foreground px-6 mt-24 bg-dark">
        {/* Hero Section */}
            <Card className="max-w-3xl">
                <CardHeader>
                    <h1 className="capitalize text-3xl">{slug.replace(/-/g, " ")}</h1>
                    <CardDescription><Link href={`/categoria/${category}`}>{category}</Link></CardDescription>
                </CardHeader>
                <CardContent> 
                    <ReactMarkdown components={markdownComponents}>
                        {content}
                    </ReactMarkdown>

                    {codeExamples.length > 0 && (
                        <>
                            <h2>Exemplos de código em {slug.replace(/-/g, " ")}</h2>
                            {codeExamples.map((code, index) => (
                                <code key={index}>
                                    {code.code}
                                </code>
                            ))}
                        </>
                    )}
                    {Array.isArray(relatedTerms) && relatedTerms.length > 0 && (
                        <section className="w-full max-w-5xl py-12">
                            <h2 className="text-2xl font-bold mb-6">📂 Termos relacionados</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {relatedTerms.map((relatedTerm, index) => (
                                    <Card key={index} className="shadow-md hover:scale-105 transition-transform">
                                        <CardContent className="text-center py-4 text-lg font-bold">
                                            <Link href={`/termo/${relatedTerm.slug}`} className="hover:underline">
                                                {relatedTerm.name}
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}
                </CardContent>
            </Card>
            
        </main>
    );
}
