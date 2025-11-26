import { NextResponse } from "next/server";
import { getTerm, incrementViews } from "@/lib/services/termsService";
import { resolveTermAlias } from "@/lib/termAliases";
export const maxDuration = 60;

export const GET = async (req, { params }) => {
  const { term } = await params;

  // Decode URL-encoded characters (ex: c%2B%2B → c++)
  const decodedTerm = decodeURIComponent(term);

  // Resolver aliases (ex: c-- → c++)
  const resolvedTerm = resolveTermAlias(decodedTerm);

  try {
    // Buscar termo via service layer (Redis → PostgreSQL → Generate)
    const result = await getTerm(resolvedTerm);

    if (!result.success || !result.term) {
      return NextResponse.json(
        { success: false, error: "Termo não encontrado" },
        { status: 404 }
      );
    }

    // Incrementar visualizações de forma assíncrona (não bloqueia resposta)
    incrementViews(resolvedTerm).catch(err => console.error('Erro ao incrementar views:', err));

    return NextResponse.json({
      success: true,
      term: result.term,
      _meta: {
        source: result.source, // 'redis', 'postgres', ou 'generated'
      }
    });

  } catch (error) {
    console.error("❌ Erro ao buscar termo:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar dados." },
      { status: 500 }
    );
  }
};