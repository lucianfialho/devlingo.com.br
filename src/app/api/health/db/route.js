import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";

export const maxDuration = 10;

/**
 * Health check do banco de dados
 * GET /api/health/db
 */
export async function GET() {
  try {
    // Debug: verificar DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    const urlParts = dbUrl ? {
      hasProtocol: dbUrl.startsWith('postgresql://'),
      length: dbUrl.length,
      host: dbUrl.split('@')[1]?.split('/')[0] || 'unknown'
    } : null;

    // Testar consulta simples
    const result = await db.execute(sql`SELECT 1 as test`);

    return NextResponse.json({
      success: true,
      message: "Conexão com PostgreSQL funcionando",
      result: result,
      env: {
        hasUrl: !!process.env.DATABASE_URL,
        urlParts,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    const dbUrl = process.env.DATABASE_URL;
    const urlParts = dbUrl ? {
      hasProtocol: dbUrl.startsWith('postgresql://'),
      length: dbUrl.length,
      host: dbUrl.split('@')[1]?.split('/')[0] || 'unknown'
    } : null;

    return NextResponse.json({
      success: false,
      error: "Falha na conexão com PostgreSQL",
      details: error.message,
      stack: error.stack,
      env: {
        hasUrl: !!process.env.DATABASE_URL,
        urlParts,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}
