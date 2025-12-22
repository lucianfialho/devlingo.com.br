# 🤖 Comparação de Modelos IA - DevLingo

## 📊 Resumo Executivo

| Modelo | Custo 100 termos | Custo 500 termos | Custo 1000 termos | Qualidade | Velocidade |
|--------|------------------|------------------|-------------------|-----------|------------|
| **Maritaca sabiazinho-3** | R$ 1,05 | R$ 5,25 | R$ 10,50 | ⭐⭐⭐ | ⚡⚡⚡ |
| **Maritaca sabia-3.1** | R$ 4,00 | R$ 20,00 | R$ 40,00 | ⭐⭐⭐⭐ | ⚡⚡ |
| **OpenAI GPT-5 nano** | R$ 0,67 | R$ 3,35 | R$ 6,70 | ⭐⭐⭐ | ⚡⚡⚡ |
| **OpenAI GPT-5 mini** | R$ 3,35 | R$ 16,75 | R$ 33,50 | ⭐⭐⭐⭐⭐ | ⚡⚡ |

**Conversão: US$ 1,00 = R$ 5,82**

---

## 💰 Análise Detalhada de Custos

### Estimativas por Termo
- **Tokens de entrada**: ~3,000 (prompt + dados Stack Overflow + instruções)
- **Tokens de saída**: ~2,500 (artigo completo com 2000+ palavras)
- **Total por termo**: ~5,500 tokens

---

## 🇧🇷 Maritaca AI (Brasileiro)

### sabiazinho-3 ⚡ (Mais Rápido e Barato)

**Preços:**
- Entrada: R$ 1,00 / 1M tokens
- Saída: R$ 3,00 / 1M tokens
- **Fora de pico (22h-06h)**: -30% (R$ 0,70 / R$ 2,10)
- **Batch API**: -50% (R$ 0,50 / R$ 1,50)

**Características:**
- ✅ Contexto: 32k tokens (suficiente para nosso caso)
- ✅ Conhecimento até meados de 2023
- ✅ Rate limit: 1000 RPM / 2M TPM
- ✅ Português nativo (melhor para conteúdo BR)
- ❌ Dados mais antigos (até 2023)

**Custo para 100 termos:**
- Normal: R$ 1,05
- Fora de pico: R$ 0,74 (-30%)
- Batch API: R$ 0,53 (-50%)

**Estratégia recomendada:**
```bash
# Usar Batch API + horário fora de pico
# 500 termos = R$ 2,63 (vs R$ 5,25)
```

---

### sabia-3.1 📚 (Mais Atual)

**Preços:**
- Entrada: R$ 5,00 / 1M tokens
- Saída: R$ 10,00 / 1M tokens
- **Fora de pico**: R$ 3,50 / R$ 7,00
- **Batch API**: R$ 2,50 / R$ 5,00

**Características:**
- ✅ Contexto: 128k tokens
- ✅ Conhecimento até **agosto 2024** (mais atual!)
- ✅ Melhor qualidade que sabiazinho-3
- ✅ Português nativo
- ❌ 4x mais caro que sabiazinho-3

**Custo para 100 termos:**
- Normal: R$ 4,00
- Batch API fora de pico: R$ 1,58 (-60%)

---

## 🇺🇸 OpenAI GPT-5

### GPT-5 nano 🚀 (Mais Barato da OpenAI)

**Preços:**
- Entrada: US$ 0,050 / 1M tokens (R$ 0,29)
- Saída: US$ 0,400 / 1M tokens (R$ 2,33)
- **Cache**: -90% na entrada (US$ 0,005 / R$ 0,03)

**Características:**
- ✅ Conhecimento até outubro 2024
- ✅ Cache reduz 90% do custo de entrada
- ✅ Perfeito para tarefas de classificação e resumo
- ⚠️ Qualidade inferior ao GPT-5 mini
- ❌ Inglês nativo (precisa instruir para PT-BR)

**Custo para 100 termos:**
- Sem cache: R$ 0,67
- Com cache (95% hit): R$ 0,35 (-48%)

**Custo para 500 termos com cache:**
- Primeiros 100: R$ 0,67
- Próximos 400 com cache: R$ 1,12
- **Total: R$ 1,79** (vs R$ 3,35 sem cache)

---

### GPT-5 mini ⭐ (Recomendado OpenAI)

**Preços:**
- Entrada: US$ 0,250 / 1M tokens (R$ 1,46)
- Saída: US$ 2,000 / 1M tokens (R$ 11,64)
- **Cache**: -90% (US$ 0,025 / R$ 0,15)

**Características:**
- ✅ Melhor custo-benefício da OpenAI
- ✅ Qualidade superior para conteúdo técnico
- ✅ Cache disponível
- ✅ Conhecimento até outubro 2024
- ⚠️ Precisa instruções para escrever em PT-BR

**Custo para 100 termos:**
- Sem cache: R$ 3,35
- Com cache (95%): R$ 1,69 (-50%)

---

## 🎯 Recomendação Final

### Cenário 1: Budget Mínimo (R$ 0,53 para 100 termos)
**Escolha: Maritaca sabiazinho-3 + Batch API + Fora de Pico**

```bash
# Gerar às 22h-06h usando Batch API
npm run generate:top100 # Custo: R$ 0,53
npm run generate:top500 # Custo: R$ 2,63
```

**Prós:**
- ✅ Custo extremamente baixo
- ✅ Português nativo
- ✅ Velocidade alta

**Contras:**
- ❌ Dados até 2023 (2 anos defasados)
- ❌ Qualidade inferior

---

### Cenário 2: Melhor Custo-Benefício (R$ 1,58 para 100 termos)
**Escolha: Maritaca sabia-3.1 + Batch API + Fora de Pico**

```bash
# Mudar modelo para sabia-3.1
# Gerar às 22h-06h
npm run generate:top500 # Custo: R$ 7,90
```

**Prós:**
- ✅ Conhecimento até agosto 2024
- ✅ Melhor qualidade
- ✅ Português nativo
- ✅ Ainda muito barato

**Contras:**
- ⚠️ Precisa agendar para horário fora de pico

---

### Cenário 3: Máxima Qualidade com Cache (R$ 1,69 para 100 termos)
**Escolha: OpenAI GPT-5 mini + Cache**

```bash
# Adicionar OPENAI_API_KEY no .env
# Usar Agent SDK com GPT-5 mini
npm run generate:top100 # Custo: ~R$ 1,69
npm run generate:top500 # Custo: ~R$ 4,22 (com cache)
```

**Prós:**
- ✅ Melhor qualidade absoluta
- ✅ Conhecimento até outubro 2024
- ✅ Cache reduz 50% após primeiros termos
- ✅ Suporte a Agent SDK nativo

**Contras:**
- ⚠️ Precisa configurar OpenAI
- ⚠️ Precisa instruir para escrever em PT-BR

---

## 📈 Análise de ROI

### Para 10,000 Termos (escala futura)

| Modelo | Custo Total | Tempo Estimado | Custo/hora* |
|--------|-------------|----------------|-------------|
| sabiazinho-3 (batch + off-peak) | R$ 52,50 | ~8h | R$ 6,56/h |
| sabia-3.1 (batch + off-peak) | R$ 158,00 | ~12h | R$ 13,17/h |
| GPT-5 nano (com cache) | R$ 33,50 | ~10h | R$ 3,35/h |
| GPT-5 mini (com cache) | R$ 168,00 | ~15h | R$ 11,20/h |

*Assumindo concorrência de 3 req/s

---

## ✅ Decisão Recomendada

### Para DevLingo (10k termos já migrados):

**Fase 1: Top 100 termos (alta prioridade)**
- Usar: **OpenAI GPT-5 mini + Cache**
- Custo: ~R$ 1,69
- Por quê: Máxima qualidade para termos mais acessados

**Fase 2: Top 500 termos**
- Usar: **Maritaca sabia-3.1 (batch + off-peak)**
- Custo: ~R$ 7,90
- Por quê: Ótima qualidade, conhecimento recente, custo baixo

**Fase 3: Termos restantes (quando necessário)**
- Usar: **Maritaca sabiazinho-3 (batch + off-peak)**
- Custo: ~R$ 50 para 10k termos
- Por quê: Escala com custo mínimo

---

## 🚀 Próximos Passos

1. **Testar ambos com 1 termo:**
   ```bash
   # Teste Maritaca sabiazinho-3
   tsx scripts/test-maritaca.ts

   # Teste OpenAI GPT-5 mini
   tsx scripts/test-openai.ts
   ```

2. **Comparar qualidade:**
   - Ler artigos gerados lado a lado
   - Verificar dados do Stack Overflow
   - Avaliar naturalidade do português

3. **Decidir estratégia:**
   - Top 100: GPT-5 mini (qualidade máxima)
   - Top 500: sabia-3.1 (ótimo custo-benefício)
   - Resto: sabiazinho-3 (escala barata)

---

## 📝 Notas Importantes

### Maritaca Batch API
- Processa requisições em lote (não imediato)
- Pode levar 1-24h para processar
- Ideal para geração não-urgente
- 50% de desconto

### OpenAI Cache
- Cache dura 1 hora
- Efetivo quando:
  - Mesmo prompt base
  - Mesmos dados de contexto
  - Termos relacionados em sequência
- Reduz entrada em até 90%

### Horário Fora de Pico (Maritaca)
- 22h-06h BRT
- 30% de desconto
- Ideal para batch processing noturno

---

## 💡 Recomendação Final

**Para começar AGORA:**
1. Adicionar créditos na Maritaca
2. Testar 1 termo com **sabiazinho-3** (R$ 0,01)
3. Se qualidade OK → gerar top 100 (R$ 1,05)
4. Se qualidade insuficiente → testar **GPT-5 mini** (R$ 0,03)

**Para máxima qualidade:**
- Adicionar `OPENAI_API_KEY`
- Usar **GPT-5 mini** para top 100-500
- Custo total: ~R$ 5-10
- ROI: Melhora indexação do Google = +tráfego orgânico
