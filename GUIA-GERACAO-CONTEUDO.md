# 🤖 Guia de Geração de Conteúdo em Lote

## 📋 Visão Geral

Este guia explica como usar o **Content Generator Agent** para criar conteúdo em massa para o DevLingo de forma automatizada e eficiente.

## 🎯 Estratégia de Geração

### Fase 1: Top 100 Termos (Prioridade ALTA)
Gere os 100 termos mais populares do Stack Overflow primeiro. Esses termos têm:
- Maior volume de busca
- Maior potencial de tráfego orgânico
- ROI mais alto

```bash
npm run generate:top100
```

**Tempo estimado:** ~10-15 minutos
**Custo estimado:** ~$0.20 USD

### Fase 2: Top 500 Termos (Prioridade MÉDIA)
Expanda para os 500 termos mais buscados:

```bash
npm run generate:top500
```

**Tempo estimado:** ~1-1.5 horas
**Custo estimado:** ~$1.00 USD

### Fase 3: Top 1000 Termos (Prioridade BAIXA)
Cobertura completa dos principais termos:

```bash
npm run generate:top1000
```

**Tempo estimado:** ~2-3 horas
**Custo estimado:** ~$2.00 USD

## 📝 Comandos Disponíveis

### 1. Gerar Top N Termos do Stack Overflow

```bash
# Top 100 termos
npm run generate:top100

# Top 500 termos
npm run generate:top500

# Top 1000 termos
npm run generate:top1000
```

**O que faz:**
1. Busca as tags mais populares do Stack Overflow API
2. Filtra termos já existentes no PostgreSQL
3. Gera conteúdo para termos faltantes
4. Salva no PostgreSQL com status "published"
5. Mostra estatísticas detalhadas ao final

**Características:**
- ✅ Skip automático de termos existentes
- ✅ Controle de concorrência (3 requisições simultâneas)
- ✅ Rate limiting (1 segundo entre requisições)
- ✅ Estatísticas em tempo real
- ✅ Tratamento de erros robusto

### 2. Gerar Termos Customizados

Para gerar conteúdo para termos específicos:

```bash
# Lista separada por vírgulas
npm run generate:custom api,react,nodejs,python,docker

# Lista separada por espaços
npm run generate:custom "javascript typescript go rust"
```

**Use quando:**
- Você tem uma lista específica de termos
- Quer preencher lacunas no conteúdo
- Precisa gerar termos de nicho

### 3. Regenerar Termos Existentes

Para melhorar a qualidade de termos já criados:

```bash
npm run regenerate api,react,vue
```

**⚠️ ATENÇÃO:** Isso irá **deletar e recriar** os termos especificados!

**Use quando:**
- Melhorou o prompt de geração
- Encontrou erros no conteúdo
- Quer atualizar informações desatualizadas

## 🔍 Monitoramento e Logs

Durante a execução, você verá logs detalhados:

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          🚀 DevLingo Batch Content Generator 🚀           ║
║                                                            ║
║  Gerando conteúdo para os top 100  termos do Stack Overflow  ║
║  Concorrência: 3 requisições simultâneas                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

🔍 Buscando top 100 tags do Stack Overflow...
✅ 100 tags encontradas
📊 Top 5: javascript (2435962), python (2098874), java (1912243), ...

📊 Termos existentes: 25
📝 Termos faltantes: 75

📦 Processando lote 1/8 (10 termos)
   Termos: javascript, python, java, c#, php, android, html, jquery, css, ios
   ✅ Sucesso: 9 | ❌ Erros: 1
   📈 Progresso geral: 13.3%

...

📊 ESTATÍSTICAS FINAIS
══════════════════════════════════════════════════════════
Total de termos:     100
✅ Gerados:          73
❌ Erros:            2
⏭️  Pulados:          25
⏱️  Duração:          847.32s
⚡ Taxa:             0.09 termos/s
💰 Custo estimado:   $0.15 USD
══════════════════════════════════════════════════════════
```

## 📊 Verificando Resultados

### Via Drizzle Studio (GUI)

```bash
npm run db:studio
```

Abre uma interface visual em `http://localhost:4983` para explorar os termos gerados.

### Via SQL

```bash
npm run db:test
```

Mostra estatísticas básicas do banco.

### Via API

```bash
# Listar termos
curl http://localhost:3000/api/v1/terms?limit=10

# Buscar termo específico
curl http://localhost:3000/api/v1/term/javascript
```

## 🎨 Qualidade do Conteúdo Gerado

Cada termo inclui:

### 📝 Conteúdo Estruturado
- **Introduction**: O que é o termo
- **Fundamentals**: Conceitos essenciais (400+ palavras)
- **Implementation**: Como funciona na prática (350+ palavras)
- **Use Cases**: Aplicações reais (300+ palavras)
- **Comparison**: Comparação com alternativas (250+ palavras)
- **Best Practices**: Melhores práticas (200+ palavras)
- **Future**: Tendências e perspectivas (200+ palavras)

**Total:** 2000+ palavras por termo

### 💻 Exemplos de Código
- Mínimo 2 exemplos funcionais
- Código comentado e explicado
- Múltiplas linguagens quando aplicável

### ❓ FAQ
- Mínimo 5 perguntas e respostas
- Baseadas em dúvidas reais do Stack Overflow
- Linguagem clara e técnica

### 🔗 Referências
- Documentação oficial
- Artigos técnicos
- Recursos práticos

## 🚨 Tratamento de Erros

### Erros Comuns

**1. Rate Limiting da API**
```
❌ Erro: Stack Overflow API rate limit exceeded
```
**Solução:** Aguarde 1 minuto e tente novamente

**2. Timeout na Geração**
```
❌ Erro: Timeout da requisição
```
**Solução:** Termo será pulado, tente regenerar individualmente

**3. Erro de Parsing JSON**
```
❌ Erro ao parsear JSON
```
**Solução:** Problema no modelo de IA, tente regenerar

### Como Lidar com Erros

1. **Durante batch generation**: Erros são logados mas não param o processo
2. **Ao final**: Lista de termos com erro é exibida
3. **Retry manual**: Use `npm run regenerate <termos-com-erro>`

## 📈 Otimização de Performance

### Ajustar Concorrência

Edite o script ou passe parâmetros:

```bash
# Mais rápido (mas pode estressar APIs)
tsx scripts/generate-top-terms.ts 100 5

# Mais conservador
tsx scripts/generate-top-terms.ts 100 2
```

### Processar em Horários de Baixo Tráfego

Execute geração em lote durante madrugada para:
- Menos carga nas APIs
- Melhor performance do banco
- Menor impacto no site

### Usar Cron Job

```bash
# Crontab para gerar 100 novos termos toda noite às 3am
0 3 * * * cd /path/to/devlingo && npm run generate:top100 >> /var/log/devlingo-gen.log 2>&1
```

## 💰 Estimativa de Custos

### Por Termo
- **IA (Maritaca):** ~$0.002 USD
- **Stack Overflow API:** Grátis (rate limit: 300 req/dia)
- **PostgreSQL:** Incluído no plano Supabase

### Por Lote
| Termos | Tempo | Custo IA | Custo Total |
|--------|-------|----------|-------------|
| 100    | ~15min| $0.20    | $0.20       |
| 500    | ~1.5h | $1.00    | $1.00       |
| 1000   | ~3h   | $2.00    | $2.00       |

### Mensal (manutenção)
- **Supabase:** $25/mês (plano Pro)
- **Redis:** $0 (incluído no plano atual)
- **Regeneração:** ~$5/mês (melhorias de qualidade)

**Total:** ~$30/mês

## 🎯 Recomendações

### Para Começar
1. ✅ Execute `npm run generate:top100` primeiro
2. ✅ Verifique qualidade no Drizzle Studio
3. ✅ Teste alguns termos no site
4. ✅ Ajuste prompts se necessário
5. ✅ Escale para top 500

### Para SEO
1. **Priorize termos de cauda longa**: Menor concorrência
2. **Regenere termos populares**: Mais qualidade = melhor ranqueamento
3. **Adicione termos de nicho**: Oportunidades específicas

### Para Qualidade
1. **Revise amostra de 10%**: Garanta consistência
2. **Use feedback de usuários**: Regenere termos problemáticos
3. **Atualize periodicamente**: Tecnologia muda rápido

## 🔄 Workflow Recomendado

```bash
# Dia 1: Setup inicial
npm run db:test                    # Verificar conexão
npm run generate:top100            # Gerar primeiros 100

# Dia 2-3: Revisão e expansão
npm run db:studio                  # Revisar qualidade
npm run generate:top500            # Expandir para 500

# Semana 2: Cobertura completa
npm run generate:top1000           # 1000 termos principais

# Manutenção mensal
npm run regenerate api,react,vue   # Atualizar termos populares
npm run generate:custom <novos>    # Adicionar termos emergentes
```

## 🐛 Debug e Troubleshooting

### Modo Verbose

Adicione variável de ambiente para logs detalhados:

```bash
DEBUG=* npm run generate:top100
```

### Verificar Termo Específico

```bash
# No PostgreSQL
npm run db:studio

# Ou via psql
psql $DATABASE_URL -c "SELECT slug, status, views, created_at FROM terms WHERE slug = 'javascript'"
```

### Limpar Termos de Teste

```sql
-- Via Drizzle Studio ou psql
DELETE FROM terms WHERE status = 'draft';
DELETE FROM terms WHERE views = 0 AND created_at < NOW() - INTERVAL '7 days';
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique logs de erro
2. Confira `ARQUITETURA-DATABASE.md`
3. Teste conexão: `npm run db:test`
4. Verifique rate limits das APIs

---

**Última atualização:** 25/11/2025
**Versão do agente:** 1.0.0
