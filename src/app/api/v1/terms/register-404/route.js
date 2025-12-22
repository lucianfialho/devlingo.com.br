import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { terms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { resolveTermAlias } from "@/lib/termAliases";

export const maxDuration = 10;

/**
 * Registra um termo 404 para geração posterior
 * POST /api/v1/terms/register-404
 * Body: { slug: string }
 */
export const POST = async (req) => {
  try {
    const { slug } = await req.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { success: false, error: "Slug inválido" },
        { status: 400 }
      );
    }

    // Decode e resolve alias
    const decodedSlug = decodeURIComponent(slug);
    const resolvedSlug = resolveTermAlias(decodedSlug);
    const cleanSlug = resolvedSlug.toLowerCase().trim();

    // Verificar se já existe no banco
    const existingTerm = await db
      .select()
      .from(terms)
      .where(eq(terms.slug, cleanSlug))
      .limit(1);

    if (existingTerm.length > 0) {
      const term = existingTerm[0];

      // Se já está publicado, não precisa fazer nada
      if (term.status === 'published') {
        return NextResponse.json({
          success: true,
          message: "Termo já existe e está publicado",
          slug: cleanSlug,
          status: term.status
        });
      }

      // Se está em rascunho ou falhou, marcar como pending
      if (term.status === 'draft' || term.status === 'failed') {
        await db
          .update(terms)
          .set({
            status: 'pending',
            updatedAt: new Date()
          })
          .where(eq(terms.slug, cleanSlug));

        return NextResponse.json({
          success: true,
          message: "Termo marcado como pending para geração",
          slug: cleanSlug,
          status: 'pending'
        });
      }

      // Se já está pending ou generating, apenas confirma
      return NextResponse.json({
        success: true,
        message: `Termo já está ${term.status}`,
        slug: cleanSlug,
        status: term.status
      });
    }

    // Termo não existe - criar novo com status pending
    await db.insert(terms).values({
      slug: cleanSlug,
      title: cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      content: { note: "Aguardando geração automática" },
      status: 'pending',
      category: 'technical',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`📝 Novo termo 404 registrado para geração: ${cleanSlug}`);

    return NextResponse.json({
      success: true,
      message: "Termo registrado para geração nas próximas 24h",
      slug: cleanSlug,
      status: 'pending'
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Erro ao registrar termo 404:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao registrar termo" },
      { status: 500 }
    );
  }
};
