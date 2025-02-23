import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.MARITACA_API_KEY, baseURL: "https://chat.maritaca.ai/api"});

export async function generateContent(term) {
  const prompt = `Gere um artigo otimizado para SEO sobre o termo técnico "${term}". O resultado deve ser um objeto JSON estruturado, contendo:

  1. **title**: O título principal do artigo, contendo a palavra-chave "${term}" naturalmente.

  2. **metaDescription**: Uma meta descrição persuasiva e otimizada para SEO (150 a 160 caracteres), contendo a palavra-chave "${term}".

  3. **category**: Escolha uma das seguintes categorias para classificar este termo:
      - "internet"
      - "hardware"
      - "software"
      - "technical"
      - "acronyms"
      - "bits_and_bytes"
      - "file_formats"

  4. **content**: O corpo do artigo estruturado para SEO, incluindo:
      - Introdução clara, mencionando a palavra-chave "${term}" já no primeiro parágrafo.
      - **Subtítulos (h2, h3) relevantes** distribuindo a palavra-chave ao longo do texto.
      - Não inclua exemplos de código no conteudo
      - Utilize "\\n\\n" para realizar as quebras de linha. O texto precisa estar normalizado.\n\n
      - O artigo deve ser escrito de forma natural e otimizada para leitura e indexação no Google.\n\n



    5. **codeExamples**: Uma lista de até 1 exemplos de código reais ilustrando o uso do termo em diferentes linguagens, cada um com:
      - "language": A linguagem de programação usada.
      - "code": O código formatado corretamente.
      - "description": Uma breve explicação.

  6. **whyLearn**: Um texto explicando por que esse termo é relevante no mercado de tecnologia.

  7. **relatedTerms**: Uma lista de até 5 termos técnicos similares que podem ser confundidos ou usados junto com o termo, cada um com:
      - "name": Nome do termo.
      - "slug": Versão slug do termo.

  **Formato de saída esperado é o JSON sem markdown (exemplo para o termo 'DNS')**:

  {
    "title": "O que é DNS? Como Funciona o Sistema de Nomes de Domínio",
    "metaDescription": "DNS é um sistema que traduz domínios para IPs, permitindo o funcionamento da web. Saiba como funciona e por que é essencial.",
    "category": "internet",
    "content": "# O que é DNS?

O **DNS** (Sistema de Nomes de Domínio) é um serviço fundamental para o funcionamento da internet. Ele permite que os usuários acessem sites e serviços online usando nomes de domínio legíveis, como "www.exemplo.com", em vez de se lembrar de endereços IP numéricos, como "192.168.1.1". O DNS basicamente traduz os nomes de domínio em endereços IP, permitindo que o navegador de um usuário se conecte ao servidor correto para carregar uma página da web.

## Como Funciona o DNS?

Quando você digita um nome de domínio em seu navegador, como "www.google.com", o seu dispositivo precisa saber o endereço IP desse domínio. O processo de resolução de nomes de domínio é feito em várias etapas:

1. **Consulta Local**: O computador verifica se o endereço IP correspondente ao nome já está armazenado em seu cache.
2. **Consulta ao Servidor de Resolução**: Se não encontrado localmente, o computador envia uma solicitação a um servidor de DNS (geralmente fornecido pelo seu provedor de internet).
3. **Busca Recursiva**: O servidor de DNS consulta outros servidores de DNS para encontrar a correspondência exata.
4. **Resposta**: O endereço IP é retornado ao seu dispositivo, que então se conecta ao servidor web para carregar o conteúdo.

## Tipos de Registros DNS

Existem diferentes tipos de registros DNS, sendo os mais comuns:
- **A**: Mapeia um nome de domínio para um endereço IPv4.
- **AAAA**: Mapeia um nome de domínio para um endereço IPv6.
- **MX**: Define os servidores de email para um domínio.
- **CNAME**: Redireciona um domínio para outro nome de domínio.

## Importância do DNS
Sem o DNS, a navegação na internet seria extremamente difícil, pois todos teriam que usar endereços IP numéricos para acessar sites. O sistema de DNS facilita a internet moderna, tornando-a mais acessível e eficiente.
",
    "codeExamples": [
      {
        "language": "Bash",
        "code": "nslookup google.com",
        "description": "Comando para buscar informações de DNS de um domínio."
      }
    ],
    "whyLearn": "Entender DNS é fundamental para administradores de redes e desenvolvedores web.",
    "relatedTerms": [
      { "name": "IP Address", "slug": "ip-address" },
      { "name": "HTTP", "slug": "http" },
      { "name": "CDN", "slug": "cdn" }
    ]
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: "sabiazinho-3",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2048
    });


    const formatedData = response.choices[0]?.message?.content.replace(/```json|```/g, "").trim();
    if (formatedData.startsWith("{") && formatedData.endsWith("}")) {
      try {
        const generatedContent = JSON.parse(formatedData);
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
