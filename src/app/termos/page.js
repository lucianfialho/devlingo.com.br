"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Assumindo que você tem este componente

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function TermsPage() {
  const [terms, setTerms] = useState([]);
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [search, setSearch] = useState("");
  const [totalTerms, setTotalTerms] = useState(0);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch(`/api/v1/terms?limit=100`);
        const data = await response.json();

        if (data.success) {
          setTerms(data.terms);
          setFilteredTerms(data.terms);
          setTotalTerms(data.terms.length);
        }
      } catch (error) {
        console.error("Erro ao buscar termos:", error);
      }
    };
    fetchTerms();
  }, []);

  useEffect(() => {
    if (selectedLetter) {
      setFilteredTerms(
        terms.filter((term) => term.name.toUpperCase().startsWith(selectedLetter))
      );
    } else {
      setFilteredTerms(terms);
    }
  }, [selectedLetter, terms]);

  useEffect(() => {
    if (search.length > 0) {
      setFilteredTerms(
        terms.filter((term) =>
          term.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredTerms(
        selectedLetter
          ? terms.filter((term) => term.toUpperCase().startsWith(selectedLetter))
          : terms
      );
    }
  }, [search, terms, selectedLetter]);

  // Função para agrupar termos populares (os 10 mais acessados, por exemplo)
  const popularTerms = terms.slice(0, 10); // Exemplo - substitua pela lógica real

  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground px-6 mt-24">
      {/* Hero Section com Busca Integrada */}
      <section className="text-center max-w-3xl py-10">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Dicionário Brasileiro de Termos Técnicos
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {totalTerms} termos técnicos explicados de forma clara e objetiva para desenvolvedores.
        </p>
        
        {/* Busca proeminente */}
        <div className="mt-8 w-full max-w-xl mx-auto">
          <Input
            type="search"
            placeholder="Buscar termo técnico..."
            className="w-full py-6 text-lg rounded-full shadow-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Termos Populares */}
      <section className="w-full max-w-3xl py-6">
        <h2 className="text-2xl font-bold mb-4">Termos Mais Consultados</h2>
        <div className="flex flex-wrap gap-2">
          {popularTerms.map((term, index) => (
            <Link
              key={index}
              href={`/termos/${term.slug || term.toLowerCase()}`}
              className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium"
            >
              {term.name || term}
            </Link>
          ))}
        </div>
      </section>

      {/* Menu Alfabético */}
      <section className="w-full max-w-3xl py-6">
        <h2 className="text-2xl font-bold mb-4">Navegar por Letra</h2>
        <div className="flex justify-center flex-wrap gap-2">
          {alphabet.map((letter) => (
            <Link
              key={letter}
              className={`px-4 py-2 rounded-lg font-semibold ${
                selectedLetter === letter
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              href={`/lista/${letter}`}
            >
              {letter}
            </Link>
          ))}
        </div>
      </section>

      {/* Categorias com Ícones */}
      <section className="w-full max-w-3xl py-10">
        <h2 className="text-2xl font-bold mb-8 text-center">Navegar por Categoria</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {[
            { name: "Internet", icon: "🌐", slug: "internet" },
            { name: "Hardware", icon: "💻", slug: "hardware" },
            { name: "Software", icon: "📊", slug: "software" },
            { name: "Termos Técnicos", icon: "🔧", slug: "tecnico" },
            { name: "Acrônimos", icon: "📝", slug: "acronimo" },
            { name: "Bits e Bytes", icon: "🔢", slug: "bits-and-bytes" },
            { name: "Formatos de Arquivos", icon: "📁", slug: "formato-de-arquivos" },
          ].map((category) => (
            <Card key={category.slug} className="shadow-md hover:scale-105 transition-transform">
              <CardContent className="text-center py-6">
                <div className="text-3xl mb-2">{category.icon}</div>
                <Link href={`/categoria/${category.slug}`} className="hover:underline font-bold">
                  {category.name}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Seção de Lista (quando filtrada) */}
      {filteredTerms.length > 0 && search.length > 0 && (
        <section className="w-full max-w-3xl py-6">
          <h2 className="text-2xl font-bold mb-4">Resultados da Busca</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTerms.map((term, index) => (
              <Link
                key={index}
                href={`/termos/${term.slug || term.toLowerCase()}`}
                className="p-3 border rounded-lg hover:bg-gray-50"
              >
                {term.name || term}
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Footer com SEO */}
      <section className="w-full max-w-3xl py-10 text-center text-sm text-muted-foreground">
        <p>
          O DevLingo é um dicionário brasileiro de termos técnicos em tecnologia, 
          projetado para ajudar desenvolvedores e profissionais de TI a 
          compreenderem conceitos complexos explicados de forma clara e objetiva.
        </p>
      </section>
    </main>
  );
}