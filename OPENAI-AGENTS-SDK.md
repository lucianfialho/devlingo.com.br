# 🤖 OpenAI Agents SDK - DevLingo

## 📋 O Que São Agents?

**OpenAI Agents SDK** permite criar agentes autônomos que:
- 🛠️ Usam ferramentas (functions) para buscar informações
- 🔄 Tomam decisões sobre quais ferramentas usar
- 🧠 Mantém contexto entre interações
- ✅ Validam outputs com schemas Zod

## 🎯 Por Que Usar Agents?

### Antes (Legacy)
```typescript
// Geração simples sem contexto externo
const content = await generateContent('api');
// Resultado: Conteúdo genérico, sem dados reais
```

### Depois (Com Agents)
```typescript
// Agent decide buscar dados do Stack Overflow
// Agent acessa documentação oficial
// Agent gera conteúdo rico e contextualizado
const content = await generateContentWithAgent('api');
// Resultado: Conteúdo com dados reais da comunidade + docs oficiais
```

## 🛠️ Ferramentas Disponíveis

### 1. `fetch_stackoverflow_data`
**O que faz:** Busca dados reais do Stack Overflow API

**Dados retornados:**
- **Tag info**: Popularidade, contagem de perguntas
- **Related tags**: Top 10 tags relacionadas
- **Top questions**: 5 perguntas mais votadas

**Exemplo de uso pelo Agent:**
```
User: "Gere conteúdo sobre JavaScript"
Agent: "Vou buscar dados do Stack Overflow..."
Tool: fetch_stackoverflow_data({ tag: "javascript" })
Result: {
  tagInfo: { count: 2435962, ... },
  relatedTags: ["node.js", "react", "html", ...],
  topQuestions: [...]
}
Agent: "Com base nos dados, JavaScript tem 2.4M de perguntas..."
```

### 2. `fetch_official_docs`
**O que faz:** Encontra documentação oficial

**Fontes suportadas:**
- **MDN**: Mozilla Developer Network
- **GitHub**: Repositórios oficiais
- **npm**: Pacotes JavaScript
- **PyPI**: Pacotes Python
- **General**: Busca Google

**Exemplo de uso pelo Agent:**
```
User: "Gere conteúdo sobre React"
Agent: "Vou buscar a documentação oficial..."
Tool: fetch_official_docs({ term: "react", source: "github" })
Result: { searchUrl: "https://github.com/facebook/react" }
Agent: "Incluindo link para o repo oficial do React..."
```

## 📊 Arquitetura do Agent

```
┌─────────────────────────────────────────────────────────┐
│                  DevLingoContentGenerator               │
│                                                         │
│  Instructions:                                          │
│  - Especialista técnico sênior                          │
│  - 2000+ palavras por termo                             │
│  - Usar ferramentas para enriquecer                     │
│  - Retornar JSON estruturado                            │
│                                                         │
│  Tools:                                                 │
│  1. fetch_stackoverflow_data                            │
│  2. fetch_official_docs                                 │
│                                                         │
│  Model: sabiazinho-3 (Maritaca AI)                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
              ┌────────────────────────┐
              │   run(agent, prompt)   │
              └────────────────────────┘
                           │
                    maxTurns: 5
                           │
              ┌────────────┴────────────┐
              │                         │
         Turn 1: Prompt            Turn 2: Use tool
         Turn 3: Use tool          Turn 4: Generate
         Turn 5: Refine (if needed)
              │                         │
              └────────────┬────────────┘
                           │
                           ↓
                  ┌─────────────────┐
                  │  finalOutput    │
                  │  (JSON válido)  │
                  └─────────────────┘
                           │
                           ↓
                  ┌─────────────────┐
                  │  Zod Validation │
                  └─────────────────┘
                           │
                           ↓
                    ✅ Content ready!
```

## 🧪 Testando o Agent

### Teste Rápido
```bash
npm run test:agent
```

**O que acontece:**
1. ✅ Gera conteúdo para o termo "api"
2. ✅ Agent usa ferramentas Stack Overflow + Docs
3. ✅ Valida output com Zod schema
4. ✅ Salva no PostgreSQL
5. ✅ Mostra preview do conteúdo

**Output esperado:**
```
╔════════════════════════════════════════════════════════════╗
║          🧪 OpenAI Agents SDK Test 🧪                     ║
╚════════════════════════════════════════════════════════════╝

🎯 Gerando conteúdo para termo de teste: api

🤖 Agent está usando fetch_stackoverflow_data...
📊 Stack Overflow data: 124,562 perguntas sobre API

🤖 Agent está usando fetch_official_docs...
🔗 Documentação encontrada: https://...

══════════════════════════════════════════════════════════
✅ CONTEÚDO GERADO COM SUCESSO
══════════════════════════════════════════════════════════
Título: API - Application Programming Interface
Categoria: technical
Seções: 7
Exemplos de código: 2
FAQ: 5
Referências: 3
Duração: 8.5s
══════════════════════════════════════════════════════════

💾 Salvando no PostgreSQL...
✅ Termo salvo!

🌐 Teste no site: http://localhost:3000/termos/api
```

### Geração em Lote (COM Agent)
```bash
# Usar Agent para top 100 (recomendado)
npm run generate:top100

# Internamente usa: useAgent = true por padrão
```

### Geração em Lote (SEM Agent - Legacy)
```bash
# Usar modo legacy (fallback se Agent falhar)
tsx scripts/generate-top-terms.ts 100 3 false
```

## 📈 Comparação de Qualidade

### Modo Legacy (Sem Agent)
```json
{
  "title": "API - O que é?",
  "content": {
    "introduction": {
      "content": "API significa Application Programming Interface..."
    }
  },
  "references": [
    {
      "title": "Documentação genérica",
      "url": "https://exemplo.com",
      "description": "Referência básica"
    }
  ]
}
```
**Problemas:**
- ❌ Sem dados reais de popularidade
- ❌ Referências genéricas
- ❌ Sem contexto da comunidade

### Modo Agent (Com Ferramentas)
```json
{
  "title": "API - Application Programming Interface: Guia Completo 2025",
  "content": {
    "introduction": {
      "content": "API (Application Programming Interface) é um dos conceitos mais fundamentais da programação moderna, com mais de 124,562 perguntas no Stack Overflow. APIs permitem que diferentes sistemas se comuniquem..."
    }
  },
  "references": [
    {
      "title": "MDN Web Docs - API",
      "url": "https://developer.mozilla.org/en-US/docs/Glossary/API",
      "description": "Documentação oficial da Mozilla sobre APIs web"
    },
    {
      "title": "REST API Tutorial",
      "url": "https://restfulapi.net/",
      "description": "Guia completo sobre design de APIs RESTful"
    },
    {
      "title": "Stack Overflow - API Questions",
      "url": "https://stackoverflow.com/questions/tagged/api",
      "description": "124,562 perguntas da comunidade sobre APIs"
    }
  ],
  "relatedTerms": ["rest", "graphql", "webhook", "http", "json"]
}
```
**Vantagens:**
- ✅ Dados reais do Stack Overflow (124k perguntas)
- ✅ Referências de documentação oficial
- ✅ Related terms automáticos
- ✅ Contexto da comunidade

## 🔧 Configuração Avançada

### Ajustar Temperatura
```typescript
// src/lib/agents/contentAgent.ts
const agent = new Agent({
  name: 'DevLingoContentGenerator',
  model: 'sabiazinho-3',
  temperature: 0.4, // ← Ajustar aqui
  // 0.0 = Mais determinístico
  // 1.0 = Mais criativo
});
```

### Limitar Turns
```typescript
const result = await run(agent, prompt, {
  maxTurns: 10, // ← Mais turns = mais uso de ferramentas
});
```

### Adicionar Nova Ferramenta
```typescript
const newTool = {
  name: 'fetch_github_stats',
  description: 'Fetches repository statistics from GitHub',
  parameters: z.object({
    repo: z.string(),
  }),
  execute: async ({ repo }) => {
    const response = await fetch(
      `https://api.github.com/repos/${repo}`
    );
    return response.json();
  },
};

// Adicionar ao agent
const agent = new Agent({
  // ...
  tools: [
    stackOverflowTool,
    documentationTool,
    newTool, // ← Nova ferramenta
  ],
});
```

## 🐛 Troubleshooting

### Problema 1: Agent não usa ferramentas
**Sintoma:** Agent gera conteúdo sem chamar tools

**Solução:**
```typescript
// Melhorar instruções para encorajar uso de ferramentas
instructions: `
IMPORTANTE: Você DEVE usar as ferramentas disponíveis:
1. SEMPRE use fetch_stackoverflow_data primeiro
2. SEMPRE use fetch_official_docs para referências
3. Só após coletar dados, gere o conteúdo
`
```

### Problema 2: JSON inválido
**Sintoma:** `Zod validation error`

**Solução:**
```typescript
// Reforçar formato JSON nas instruções
instructions: `
CRÍTICO: Retorne APENAS JSON válido.
NÃO inclua markdown, explicações ou texto adicional.
FORMATO EXATO:
{ "title": "...", "content": {...}, ... }
`
```

### Problema 3: Timeout
**Sintoma:** `Error: Timeout after 60s`

**Solução:**
```bash
# Aumentar timeout no run()
const result = await run(agent, prompt, {
  maxTurns: 5,
  timeout: 120000, // 2 minutos
});
```

## 💰 Custos

### Por Termo (Com Agent)
- **Requisições API:** 3-5 calls por termo
  - 1x Stack Overflow API (grátis)
  - 1x Docs search (grátis)
  - 3x LLM calls (~$0.003)
- **Total:** ~$0.003-0.005 por termo

### Por Termo (Sem Agent)
- **Requisições API:** 1 call LLM
- **Total:** ~$0.002 por termo

**Diferença:** +50% custo, mas **3x melhor qualidade**

## 🎯 Recomendações

### ✅ Quando Usar Agent
- Termos populares (top 500)
- Conteúdo de alta qualidade necessário
- Quando tem referências oficiais disponíveis
- Termos técnicos complexos

### ⚠️ Quando Usar Legacy
- Termos muito nichados
- Testes rápidos
- Budget limitado
- Termos sem dados no Stack Overflow

## 📚 Recursos

### Documentação
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-js)
- [Zod Schema Validation](https://zod.dev/)
- [Stack Overflow API](https://api.stackexchange.com/docs)

### Exemplos
```bash
# Ver código do agent
cat src/lib/agents/contentAgent.ts

# Testar agent isoladamente
npm run test:agent

# Usar em batch
npm run generate:top100
```

## 🚀 Próximos Passos

1. **Testar Agent:**
   ```bash
   npm run test:agent
   ```

2. **Gerar primeiros termos:**
   ```bash
   npm run generate:top100
   ```

3. **Comparar qualidade:**
   - Agent vs Legacy
   - Verificar uso de ferramentas nos logs
   - Validar referências e dados do Stack Overflow

4. **Otimizar prompts:**
   - Ajustar instruções se necessário
   - Adicionar mais ferramentas se útil
   - Fine-tune temperatura

---

**Agent pronto para produção! 🎉**

Use `npm run test:agent` para começar.
