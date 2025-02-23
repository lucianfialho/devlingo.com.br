import redisClient from "@/lib/redisClient";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  try {
    const keys = await redisClient.keys("categories:*")
    let categoryOb = {}
    for (const key of keys) {
        const categoryData = JSON.parse(await redisClient.get(key));
        categoryOb[key.replace("categories:", "")] = categoryData
    }

    return NextResponse.json({ success: true, categoryOb });
  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar dados." }, { status: 500 });
  }
};
