import redisClient from "@/lib/redisClient";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.MARITACA_API_KEY, baseURL: "https://chat.maritaca.ai/api"});

export const POST = async (req, {params}) => {
  const { term } = await params;
  
  try {
    // Verificar se o termo existe
    const termDataStr = await redisClient.get(`terms:${term}`);
    
    if (!termDataStr) {
      return NextResponse.json(
        { success: false, error: "Termo não encontrado" },
        { status: 404 }
      );
    }
    

    // Parsear o conteúdo existente
    const termData = JSON.parse(termDataStr);
    
    // Melhorar o conteúdo existente
    const enhancedContent = await enhanceContent(term, termData);
    
    // Salvar conteúdo melhorado
    await redisClient.set(`terms:${term}`, JSON.stringify(enhancedContent));
    
    // Criar backup do conteúdo original (opcional)
    await redisClient.set(`terms:${term}:original`, termDataStr);
    
    return NextResponse.json({ 
      success: true, 
      message: "Conteúdo aprimorado com sucesso",
      term: enhancedContent 
    });
    
  } catch (error) {
    console.error("❌ Erro ao aprimorar conteúdo:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao aprimorar conteúdo: " + error.message },
      { status: 500 }
    );
  }
};

async function enhanceContent(term, existingData) {
  // Extrair apenas o necessário do conteúdo existente
  const existingContent = {
    title: existingData.title || "",
    metaDescription: existingData.metaDescription || "",
    category: existingData.category || "",
    content: existingData.content || "",
    codeExamples: existingData.codeExamples || []
  };

  const prompt = `Você é um especialista em criação de conteúdo SEO de alta qualidade. Seu trabalho é aprimorar significativamente um artigo existente sobre "${term}" para um dicionário técnico, garantindo que ele atenda aos padrões da política do AdSense para conteúdo de alta qualidade.

Diretrizes para o aprimoramento:
1. SUBSTANCIALMENTE MAIS DETALHADO - expandir o conteúdo para cobrir o tema de forma abrangente
2. VALOR EDUCACIONAL ELEVADO - tornar o conteúdo mais didático e informativo
3. ORIGINAL E ÚNICO - garantir que o texto não pareça genérico ou gerado automaticamente
4. AUTORIDADE NO ASSUNTO - demonstrar conhecimento especializado e preciso
5. EXPERIÊNCIA DE USUÁRIO MELHORADA - melhorar a estrutura para facilitar a leitura e compreensão
6. RELEVÂNCIA COMERCIAL - destacar aplicações práticas e importância no mercado

Conteúdo existente para aprimorar:
${JSON.stringify(existingContent, null, 2)}

Por favor, forneça uma versão substancialmente melhorada e expandida deste conteúdo, mantendo a mesma estrutura JSON, mas:
- Ampliando cada seção de forma significativa
- Adicionando mais exemplos práticos e casos de uso
- Atualizando informações desatualizadas
- Reescrevendo qualquer texto que pareça superficial ou genérico
- Melhorando os exemplos de código para serem mais práticos e educativos
- Adicionando um novo campo "faq" com perguntas e respostas comuns
- Adicionando um novo campo "references" com fontes de alta qualidade

O resultado deve parecer escrito por um especialista humano no assunto, não por IA. Seja claro, informativo e aprofundado.`;

  try {
    const response = await openai.chat.completions.create({
      model: "sabiazinho-3",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    const responseText = response.choices[0]?.message?.content.trim();
    let enhancedData;
    console.log(responseText)
    // Extrair o JSON da resposta
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                      responseText.match(/\{[\s\S]*\}/);
                      
    if (jsonMatch) {
      try {
        enhancedData = JSON.parse(jsonMatch[0].replace(/```json|```/g, "").trim());
      } catch (e) {
        // Tentar encontrar e corrigir o JSON no texto completo
        try {
          const potentialJson = responseText.replace(/```json|```/g, "").trim();
          console.log(potentialJson)
          enhancedData = JSON.parse(potentialJson);
        } catch (innerError) {
          throw new Error("Não foi possível extrair JSON válido da resposta");
        }
      }
    } else {
      throw new Error("Resposta não contém JSON válido");
    }
    
    // Preservar campos que possam existir no conteúdo original, mas não no aprimorado
    const result = {
      ...existingData,
      ...enhancedData,
      enhanced_at: new Date().toISOString(),
      version: (parseFloat(existingData.version || "1.0") + 0.1).toFixed(1)
    };
    
    return result;
    
  } catch (error) {
    console.error("❌ Erro ao aprimorar conteúdo com IA:", error);
    throw new Error("Falha ao aprimorar conteúdo: " + error.message);
  }
}