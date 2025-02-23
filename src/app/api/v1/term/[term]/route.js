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

    const generatedContent = await generateContent(term);
    let termData = {};
    
    // Verifica se o conteúdo gerado é uma string JSON válida e parseia
    if (typeof generatedContent === 'string') {
      try {
        termData = JSON.parse(generatedContent);
      } catch (jsonError) {
        console.error("❌ Erro ao parsear JSON:", jsonError);
        return NextResponse.json(
          { success: false, error: "Erro ao parsear o conteúdo gerado." },
          { status: 500 }
        );
      }
    } else {
      termData = generatedContent;
    }

    // Salva o termo com o conteúdo gerado no Redis
    await redisClient.set(`terms:${term}`, JSON.stringify({ ...termData, content: termData.content }));

    // Verifica e manipula a categoria se necessário
    if (termData.category) {
      console.log(`🔍 Verificando categoria: ${termData.category}`);
      let category = await redisClient.get(`categories:${termData.category}`);
      if (!category) {
      console.log(`📦 Categoria não encontrada. Criando nova categoria: ${termData.category}`);
      // Se a categoria não existir, cria uma nova entrada com o termo atual
      await redisClient.set(`categories:${termData.category}`, JSON.stringify({ name: termData.category, terms: [term] }));
      } else {
      console.log(`📦 Categoria encontrada: ${termData.category}`);
      // Se a categoria existir, adiciona o termo ao array existente
      category = JSON.parse(category);
      if (!category.terms.includes(term)) {
        console.log(`➕ Adicionando termo à categoria: ${term}`);
        category.terms.push(term);
        await redisClient.set(`categories:${termData.category}`, JSON.stringify(category));
      } else {
        console.log(`✅ Termo já existe na categoria: ${term}`);
      }
      }
    }

    return NextResponse.json({ success: true, term: { ...termData, content: termData.content } });

  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar dados." },
      { status: 500 }
    );
  }
};