import redisClient from "@/lib/redisClient";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  try {
    // Parâmetros opcionais
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const minLength = parseInt(searchParams.get("minLength") || "0", 10);
    const maxLength = parseInt(searchParams.get("maxLength") || "1500", 10);
    
    // Obter todas as chaves de termos
    const keys = await redisClient.keys("terms:*");
    
    // Filtrar apenas termos regulares (não backups)
    const termKeys = keys.filter(key => !key.includes(":original") && !key.includes(":backup"));
    
    const candidates = [];
    let count = 0;
    
    for (const key of termKeys) {
      if (count >= limit) break;
      
      const termData = JSON.parse(await redisClient.get(key));
      const contentLength = termData.content ? termData.content.length : 0;
      
      // Verificar se o conteúdo é um candidato para aprimoramento
      if (contentLength >= minLength && contentLength <= maxLength) {
        candidates.push({
          term: key.replace("terms:", ""),
          title: termData.title || key.replace("terms:", ""),
          contentLength,
          category: termData.category || "uncategorized",
          hasCodeExamples: !!(termData.codeExamples && termData.codeExamples.length > 0),
          lastUpdated: termData.enhanced_at || termData.generated_at || null,
          version: termData.version || "1.0"
        });
        
        count++;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      candidates,
      total: candidates.length
    });
    
  } catch (error) {
    console.error("❌ Erro ao listar candidatos para aprimoramento:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao listar candidatos: " + error.message },
      { status: 500 }
    );
  }
};