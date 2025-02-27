import redisClient from "@/lib/redisClient";
import { NextResponse } from "next/server";

export const GET = async (request, {params}) => {
  const {category} = await params

  try {
    const categoryData = JSON.parse(await redisClient.get(`categories:${category}`))
    
    if(!categoryData) {
      return NextResponse.json({ success: false }, {status: 404});
    }

    const shuffledTerms = categoryData.terms.sort(() => 0.5 - Math.random());
    return NextResponse.json({ success: true, terms: shuffledTerms.slice(0, 5) });
  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar dados." }, { status: 500 });
  }
};
