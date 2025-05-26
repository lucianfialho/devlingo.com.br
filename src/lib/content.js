import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.MARITACA_API_KEY, baseURL: "https://chat.maritaca.ai/api"});

export async function generateContent(term) {
  const prompt = `Crie um artigo técnico detalhado e aprofundado sobre "${term}" para um dicionário de termos técnicos em tecnologia. O conteúdo deve ser:

1. DETALHADO E APROFUNDADO - não superficial, com pelo menos 1500 palavras
2. ORIGINAL - sem nenhum conteúdo copiado de outras fontes
3. EDUCACIONAL - com explicações claras e didáticas
4. ESTRUTURADO - com seções bem definidas e progressão lógica
5. RICO EM VALOR - com exemplos práticos, casos de uso, e insights técnicos
6. ATUAL - com informações atualizadas sobre o estado da arte

O resultado deve ser um objeto JSON estruturado, contendo:

1. **title**: Título principal com a palavra-chave "${term}" naturalmente integrada.

2. **metaDescription**: Meta descrição persuasiva e otimizada para SEO (150-160 caracteres).

3. **category**: Uma das seguintes categorias mais apropriada:
   - "internet" (para termos relacionados à web, protocolos, serviços online)
   - "hardware" (para componentes físicos, dispositivos, equipamentos)
   - "software" (para programas, aplicativos, sistemas operacionais)
   - "technical" (para conceitos técnicos gerais, arquitetura, princípios)
   - "acronyms" (para siglas e abreviações técnicas)
   - "bits_and_bytes" (para conceitos de dados, armazenamento, manipulação binária)
   - "file_formats" (para formatos de arquivo e padrões de dados)

4. **content**: Corpo do artigo estruturado e detalhado, incluindo:
   - Introdução abrangente: definição clara e contextualização do termo
   - Histórico e evolução: quando e como surgiu, como evoluiu
   - Funcionamento detalhado: explicação técnica aprofundada
   - Casos de uso: exemplos reais e práticos de aplicação
   - Comparações: relação com tecnologias similares ou alternativas
   - Estado atual: tendências recentes e relevância no mercado
   - Futuro: possíveis evoluções ou direções
   - Conclusão: síntese e importância no ecossistema técnico
   
   Cada seção deve ter cabeçalhos H2 e H3 apropriados, com quebras de linha marcadas com "\\n\\n".
   
   O conteúdo deve ser original, educacional e fornecer um valor real para desenvolvedores e profissionais de tecnologia.

5. **codeExamples**: 2-3 exemplos de código reais e funcionais que ilustram o uso prático, cada um com:
   - "language": Linguagem de programação apropriada
   - "code": Código funcional, não apenas ilustrativo
   - "description": Explicação detalhada do que o código faz e como funciona

6. **whyLearn**: Explicação convincente sobre a importância do termo no mercado de tecnologia atual.

7. **relatedTerms**: 5-7 termos técnicos relacionados, com:
   - "name": Nome do termo
   - "slug": Versão slug do termo
   - "description": Breve explicação da relação com o termo principal

8. **faq**: 4-6 perguntas frequentes sobre o termo, cada uma com:
   - "question": Pergunta relevante e comum
   - "answer": Resposta detalhada e informativa

9. **references**: 3-5 referências de alta qualidade (documentações oficiais, livros, artigos técnicos):
   - "title": Título da referência
   - "url": URL da fonte (se aplicável)
   - "description": Breve descrição do conteúdo da referência

Forneça conteúdo técnico preciso, detalhado e valioso que seria escrito por um especialista no assunto. O conteúdo deve ser de alta qualidade para uma plataforma educacional respeitável.`;

  try {
    const response = await openai.chat.completions.create({
      model: "sabiazinho-3",  // Ou o modelo mais recente disponível
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 4096  // Aumentado para gerar conteúdo mais longo
    });

    const formatedData = response.choices[0]?.message?.content.replace(/```json|```/g, "").trim();
    if (formatedData.startsWith("{") && formatedData.endsWith("}")) {
      try {
        const generatedContent = JSON.parse(formatedData);
        
        // Verificações de qualidade
        if (!generatedContent.content || generatedContent.content.length < 1000) {
          throw new Error("Conteúdo gerado muito curto ou vazio");
        }
        
        if (!generatedContent.codeExamples || generatedContent.codeExamples.length < 1) {
          // Adicionar um exemplo padrão se necessário
          generatedContent.codeExamples = [{
            language: "JavaScript",
            code: "// Exemplo de uso de " + term + "\nconsole.log('Exemplo básico');\n// Este é apenas um placeholder",
            description: "Exemplo básico de uso em JavaScript."
          }];
        }
        
        // Adicionar data de geração
        generatedContent.generated_at = new Date().toISOString();
        generatedContent.version = "2.0"; // Para acompanhar versões do conteúdo
        
        return generatedContent;
      } catch (jsonError) {
        console.error("❌ Erro ao parsear JSON. Conteúdo recebido:", formatedData);
        throw new Error("Erro ao parsear o conteúdo JSON gerado pela OpenAI.");
      }
    } else {
      console.error("❌ A resposta da OpenAI não parece ser um JSON válido. Conteúdo recebido:", formatedData);
      throw new Error("Resposta da OpenAI não é um JSON válido.");
    }

  } catch (error) {
    console.error("❌ Erro ao gerar conteúdo com OpenAI:", error);
    throw new Error("Falha ao gerar conteúdo.");
  }
}