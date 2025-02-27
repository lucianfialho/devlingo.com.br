import { generateContent } from "@/lib/content";
import redisClient from "@/lib/redisClient";
import { NextResponse } from "next/server";

export const GET = async (req,{params}) => {
  
  const { term } = await params;
  
  try {
    // Verifica se o termo existe no Redis
    const termDataStr = await redisClient.get(`terms:${term}`);
    
    if (termDataStr) {
      const termData = JSON.parse(termDataStr);
      // Verifica se o termo possui o atributo content
      if (termData.content) {
        return NextResponse.json({ success: true, term: termData });
      }
    }

    
    return NextResponse.json({ success: false });

  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar dados." },
      { status: 500 }
    );
  }
};