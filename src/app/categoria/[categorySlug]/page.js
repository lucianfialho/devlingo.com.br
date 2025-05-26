
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
const slugData = {
  "internet":"internet",
  "hardware":"hardware",
  "software":"software",
  "tecnico":"technical",
  "acronimo":"acronyms",
  "bits-and-bytes":"bits_and_bytes",
  "formato-de-arquivos":"file_formats",
}


const fetchData = async (categorySlug) => {

  try {
    // Simulação de busca de termos por categoria (frontend)
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/v1/category/${categorySlug}`);
    const  data = await response.json();

    if(!data.success) {
      return notFound()
    }

    return data
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return notFound()
  }
};

export default async function CategoryPage({ params }) {
  const { categorySlug } = await params

  const {terms} = await fetchData(slugData[categorySlug])

  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground px-6 mt-24 bg-dark">
      {/* Hero Section */}
      <section className="text-center max-w-3xl py-20">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">{`Termos técnicos na categoria ${categorySlug}`}</h1>
      </section>

      {/* Lista de Termos da Categoria */}
      <section className="w-full max-w-5xl py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {terms.map((term, index) => (
            <Card key={index} className="shadow-md hover:scale-105 transition-transform">
              <CardContent className="text-center py-6 text-lg font-bold">
                <Link href={`/termos/${term}`} className="hover:underline">
                  {term.replaceAll("-", " ")}
                </Link>
              </CardContent>
            </Card>
            ))}
        </div>
      </section>
    </main>
  );
}
