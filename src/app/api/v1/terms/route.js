import redisClient from "@/lib/redisClient";
import { NextResponse } from "next/server";
export const maxDuration = 60
export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const cursorParam = searchParams.get("cursor") || "0";
    const limit = Number(searchParams.get("limit")) || 10;

    let cursor = cursorParam;
    let keys = [];

    while (true) {
      // O resultado do scan é um objeto com as propriedades "cursor" e "keys"
      const scanResult = await redisClient.scan(cursor, { MATCH: "terms:*", COUNT: limit });

      const { cursor: newCursor, keys: foundKeys } = scanResult;
      cursor = newCursor;
      keys.push(...foundKeys);
      if (keys.length >= limit || cursor === "0") break;
    }

    keys = keys.slice(0, limit);
    const terms = [];
    for (const key of keys) {
      const termStr = await redisClient.get(key);
      const termWithKey = {
        ...JSON.parse(termStr),
        name: key.split(":")[1],
      }
      
      if (termStr) {
        terms.push(termWithKey);
      }
    }

    return NextResponse.json({ success: true, terms, nextCursor: cursor });
  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar dados." }, { status: 500 });
  }
};
