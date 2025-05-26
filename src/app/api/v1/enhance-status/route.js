import redisClient from "@/lib/redisClient";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const statusData = await redisClient.get("enhance:batch:status");
    
    if (!statusData) {
      return NextResponse.json({ 
        success: true, 
        status: {
          inProgress: false,
          message: "Nenhum processo de aprimoramento em lote em andamento ou concluído"
        }
      });
    }
    
    const status = JSON.parse(statusData);
    
    return NextResponse.json({ 
      success: true, 
      status
    });
    
  } catch (error) {
    console.error("❌ Erro ao verificar status do aprimoramento:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao verificar status: " + error.message },
      { status: 500 }
    );
  }
};