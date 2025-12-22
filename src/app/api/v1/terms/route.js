import { NextResponse } from "next/server";
import { listTerms } from "@/lib/services/termsService";
export const maxDuration = 60;

export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 20;
    const offset = Number(searchParams.get("offset")) || 0;
    const category = searchParams.get("category") || undefined;

    const result = await listTerms({ limit, offset, category });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      terms: result.terms,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.limit < result.total,
      }
    });

  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar dados." },
      { status: 500 }
    );
  }
};
