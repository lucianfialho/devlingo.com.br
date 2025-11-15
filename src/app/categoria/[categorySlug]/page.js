import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { ChevronRight, FolderOpen, Hash } from "lucide-react";

const slugData = {
  "internet": "internet",
  "hardware": "hardware",
  "software": "software",
  "tecnico": "technical",
  "acronimo": "acronyms",
  "bits-and-bytes": "bits_and_bytes",
  "formato-de-arquivos": "file_formats",
};

const categoryInfo = {
  "internet": {
    name: "Internet",
    description: "Termos técnicos relacionados à Internet, protocolos de rede, navegação web e tecnologias online.",
    icon: "🌐"
  },
  "hardware": {
    name: "Hardware",
    description: "Componentes físicos de computadores e dispositivos eletrônicos, processadores, memória e periféricos.",
    icon: "🖥️"
  },
  "software": {
    name: "Software",
    description: "Programas, aplicativos, sistemas operacionais e ferramentas de desenvolvimento de software.",
    icon: "💿"
  },
  "tecnico": {
    name: "Técnico",
    description: "Termos técnicos gerais de programação, desenvolvimento e tecnologia da informação.",
    icon: "⚙️"
  },
  "acronimo": {
    name: "Acrônimos",
    description: "Siglas e acrônimos comuns em tecnologia, programação e TI.",
    icon: "🔤"
  },
  "bits-and-bytes": {
    name: "Bits e Bytes",
    description: "Conceitos fundamentais sobre unidades de informação digital e armazenamento de dados.",
    icon: "💾"
  },
  "formato-de-arquivos": {
    name: "Formato de Arquivos",
    description: "Extensões e formatos de arquivos usados em programação, desenvolvimento e armazenamento de dados.",
    icon: "📁"
  },
};

const fetchData = async (categorySlug) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/v1/category/${categorySlug}`);
    const data = await response.json();

    if (!data.success) {
      return notFound();
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return notFound();
  }
};

export async function generateMetadata({ params }) {
  const { categorySlug } = await params;
  const category = categoryInfo[categorySlug];

  if (!category) {
    return {
      title: "Categoria não encontrada"
    };
  }

  return {
    title: `${category.name}: Glossário de Termos Técnicos | DevLingo`,
    description: category.description,
    openGraph: {
      title: `${category.name} - Termos Técnicos em Português`,
      description: category.description,
    }
  };
}

export default async function CategoryPage({ params }) {
  const { categorySlug } = await params;
  const { terms } = await fetchData(slugData[categorySlug]);
  const category = categoryInfo[categorySlug];

  if (!category) {
    return notFound();
  }

  // Outras categorias para sugestão
  const otherCategories = Object.entries(categoryInfo)
    .filter(([slug]) => slug !== categorySlug)
    .slice(0, 3);

  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground px-6 mt-24">
      {/* Breadcrumbs */}
      <div className="w-full max-w-5xl mb-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition">
            Início
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/categorias" className="hover:text-foreground transition">
            Categorias
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="text-center max-w-3xl py-12">
        <div className="text-6xl mb-4">{category.icon}</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          {category.name}
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          {category.description}
        </p>
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
          <Hash className="w-4 h-4" />
          <span className="font-semibold">{terms.length} termos disponíveis</span>
        </div>
      </section>

      {/* Lista de Termos da Categoria */}
      <section className="w-full max-w-5xl py-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FolderOpen className="w-6 h-6" />
          Todos os Termos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {terms.map((term, index) => (
            <Link key={index} href={`/termos/${term}`}>
              <Card className="h-full shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer border-2 hover:border-primary/50">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold capitalize">
                    {term.replaceAll("-", " ")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Outras Categorias */}
      <section className="w-full max-w-5xl py-12 border-t">
        <h2 className="text-2xl font-bold mb-6">Explorar Outras Categorias</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherCategories.map(([slug, info]) => (
            <Link key={slug} href={`/categoria/${slug}`}>
              <Card className="h-full shadow-sm hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
                <CardHeader>
                  <div className="text-4xl mb-2">{info.icon}</div>
                  <h3 className="text-xl font-bold">{info.name}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {info.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
