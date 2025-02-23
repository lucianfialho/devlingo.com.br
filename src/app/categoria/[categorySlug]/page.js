import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import BlurText from "@/components/bits/BlurText";

export default function CategoryPage({ categorySlug }) {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulação de busca de termos por categoria (frontend)
        const response = await fetch(`/api/v1/category/${categorySlug}`);
        const { terms } = await response.json();
        setTerms(terms);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [categorySlug]);

  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground px-6 mt-24 bg-dark">
      {/* Hero Section */}
      <section className="text-center max-w-3xl py-20">
        <BlurText
          text={`Termos técnicos na categoria ${categorySlug}`}
          delay={150}
          animateBy="words"
          direction="top"
          className="text-4xl sm:text-6xl font-extrabold tracking-tight"
        />
        <motion.p 
          className="mt-4 text-lg text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Explore os termos técnicos mais populares nesta categoria.
        </motion.p>
        <motion.div 
          className="mt-6 flex w-full max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Input placeholder="Busque um termo..." className="text-lg h-12 w-full" />
        </motion.div>
      </section>

      {/* Lista de Termos da Categoria */}
      <section className="w-full max-w-5xl py-12">
        <h2 className="text-3xl font-bold mb-6">Termos Populares</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {loading ? (
            <p className="text-center text-lg text-muted-foreground">Carregando...</p>
          ) : (
            terms.map((term, index) => (
              <motion.div
                key={term.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-md hover:scale-105 transition-transform">
                  <CardContent className="text-center py-6 text-lg font-bold">
                    <Link href={`/termos/${term.name}`} className="hover:underline">
                      {term.name.replaceAll("-", " ")}
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
