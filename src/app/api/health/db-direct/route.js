import { NextResponse } from "next/server";

export const maxDuration = 10;

/**
 * Health check DIRETO do banco (sem Drizzle)
 * GET /api/health/db-direct
 */
export async function GET() {
  try {
    // Importar postgres dinamicamente APÓS ter certeza que env vars estão carregadas
    const postgres = (await import('postgres')).default;

    const dbUrl = process.env.DATABASE_URL;

    // Criar cliente direto
    const sql = postgres(dbUrl, {
      prepare: false,
      max: 1,
      ssl: 'require'
    });

    // Testar query
    const result = await sql`SELECT 1 as test, current_database() as db`;

    await sql.end();

    return NextResponse.json({
      success: true,
      message: "Conexão DIRETA funcionando!",
      result: result,
      env: {
        hasUrl: !!dbUrl,
        urlLength: dbUrl?.length,
        host: dbUrl?.split('@')[1]?.split('/')[0]
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Falha na conexão DIRETA",
      details: error.message,
      stack: error.stack,
      cause: error.cause?.message
    }, { status: 500 });
  }
}
