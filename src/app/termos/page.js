"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function TermsPage() {
  const [terms, setTerms] = useState([]);
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch(`/api/v1/terms?limit=100`);
        const data = await response.json();

        if (data.success) {
          setTerms(data.terms);
          setFilteredTerms(data.terms);
        }
      } catch (error) {
        console.error("Erro ao buscar termos:", error);
      }
    };
    fetchTerms();
  }, []);

  useEffect(() => {
    if (selectedLetter) {
        console.log(selectedLetter)
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


  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground px-6 mt-24">
      {/* Hero Section */}
      <section className="text-center max-w-3xl py-10">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Todos os Termos Técnicos
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Navegue pelos termos técnicos organizados por ordem alfabética.
        </p>
      </section>

      {/* Menu Alfabético */}
      <section className="w-full max-w-3xl py-4 flex justify-center flex-wrap gap-2">
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
      </section>

      <section className="text-center max-w-3xl py-10">
        <h2 className="text-3xl sm:text-6xl font-extrabold tracking-tight">
          Navegue por categoria
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-14">
            {["internet","hardware","software","tecnico","acronimo","bits-and-bytes","formato-de-arquivos"].map((item, index) => (
                <Card key={index} className="shadow-md hover:scale-105 transition-transform">
                <CardContent className="text-center py-6 text-lg font-bold">
                <Link href={`/categoria/${item}`} className="hover:underline capitalize">
                    {item.replaceAll("-", " ")}
                </Link>
                </CardContent>
            </Card>
            ))}
        </div>
      </section>
    </main>
  );
}
