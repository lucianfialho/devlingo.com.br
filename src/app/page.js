"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import BlurText from "@/components/bits/BlurText";
import SpotlightCard from "@/components/bits/SpotlightCard";

export default function Home() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/v1/terms/`)
      const {terms} = await response.json()

      setWords(terms)
      setLoading(false)
    }
    fetchData()
  }, [])
  
  const wordOfTheDay = words.length > 0 ? words[0] : null;

  const categories = ["internet","hardware","software","tecnico","acronimo","bits-and-bytes","formato-de-arquivos"];
  
  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground px-6 mt-24 bg-dark">
      {/* Hero Section */}
      <section className="text-center max-w-3xl py-20">
        <h1 className="sr-only">Dicionário Brasileiro de Termos Técnicos em Tecnologia</h1> 
          <BlurText
            text="Dicionário Brasileiro de Termos Técnicos em Tecnologia"
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
          Explicações claras e objetivas de mais de 15.000 termos técnicos em português, para desenvolvedores e profissionais de tecnologia.
        </motion.p>
      </section>

      {/* Palavra do Dia */}
      <section className="w-full max-w-3xl py-12">
        {loading ? (
          <p className="text-center text-lg text-muted-foreground">Carregando...</p>
        ) : (
          wordOfTheDay && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Link href={`/termos/${wordOfTheDay.name}`}>
                <SpotlightCard className="custom-spotlight-card flex gap-6 items-center justify-center" spotlightColor="rgba(0, 229, 255, 0.2)">
                  
                  <span className="text-white text-base">Palavra do dia:</span>
                  <h2 className="text-white text-4xl">{wordOfTheDay.name.replaceAll("-", " ")}</h2>
                </SpotlightCard>
              </Link>
            </motion.div>
          )
        )}
      </section>

      {/* Lista de Termos Populares */}
      <section className="w-full max-w-5xl py-12">
        <h2 className="text-3xl font-bold mb-6">📈 Termos Populares</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {words.map((word, index) => (
            <motion.div
              key={word.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-md hover:scale-105 transition-transform">
                <CardContent className="text-center py-6 text-lg font-bold">
                  <Link href={`/termos/${word.name}`} className="hover:underline">
                    {word.name.replaceAll("-", " ")}
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categorias */}
      <section className="w-full max-w-5xl py-12">
        <h2 className="text-3xl font-bold mb-6">📂 Categorias</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-md hover:scale-105 transition-transform">
                <CardContent className="text-center py-6 text-lg font-bold">
                  <Link href={`/categoria/${category.toLowerCase()}`} className="hover:underline">
                    {category.replaceAll("-", " ")}
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
