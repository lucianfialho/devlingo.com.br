'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TermNotFound() {
  const params = useParams();
  const slug = params?.slug;

  useEffect(() => {
    // Registrar o termo 404 para geração automática
    if (slug) {
      fetch('/api/v1/terms/register-404', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log(`✅ Termo "${slug}" registrado para geração:`, data.message);
          }
        })
        .catch(err => {
          console.error('❌ Erro ao registrar termo 404:', err);
        });
    }
  }, [slug]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 sm:px-6">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-6xl">🔍</div>
              <div>
                <CardTitle className="text-3xl font-bold">
                  Termo não encontrado
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  O termo "{slug?.replace(/-/g, ' ')}" ainda não existe no DevLingo
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
              <p className="text-blue-900 font-medium">
                📝 Boa notícia! Registramos sua busca.
              </p>
              <p className="text-blue-800 text-sm mt-1">
                Este termo será gerado automaticamente nas próximas 24 horas e ficará disponível no site.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">O que você pode fazer agora:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">→</span>
                  <span>Volte amanhã e o termo estará disponível</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">→</span>
                  <span>Explore outros termos técnicos na nossa biblioteca</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">→</span>
                  <span>Pesquise por termos relacionados</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button asChild>
                <Link href="/termos">
                  Ver todos os termos
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  Voltar ao início
                </Link>
              </Button>
            </div>

            <div className="text-xs text-gray-500 pt-4 border-t">
              <p>
                💡 <strong>Dica:</strong> Nosso sistema de geração automática cria conteúdo técnico
                de alta qualidade em português brasileiro. Todos os termos são revisados e otimizados
                para SEO.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
