# 🚀 GUIA RÁPIDO: Setup Google AdSense no DevLingo

## ✅ O QUE JÁ ESTÁ FEITO:

1. ✅ Script global do AdSense adicionado no `src/app/layout.js`
2. ✅ Componente `AdSenseAd.js` criado e pronto para uso
3. ✅ Anúncios adicionados na página `/o-que-e/[slug]`
4. ✅ Client ID configurado: `ca-pub-5795702444937299`

---

## 📋 PRÓXIMOS PASSOS (VOCÊ PRECISA FAZER):

### 1️⃣ Criar Unidades de Anúncio no Painel AdSense

#### Acesse o painel:
1. Vá em: https://www.google.com/adsense
2. Login com sua conta aprovada
3. Menu lateral: **"Anúncios" → "Por unidade"**
4. Clique em **"Criar unidade de anúncio"**

---

### 2️⃣ Criar 3 Unidades de Anúncio

#### **Ad Unit #1: In-Article Após Quick Answer**

```
Nome: DevLingo - O que é - Após Resposta
Tipo: In-article (anúncio dentro do artigo)
Tamanhos: Automático/Responsivo

Clique em "Criar"
→ Copie apenas o número do data-ad-slot (ex: 1234567890)
```

#### **Ad Unit #2: In-Article Antes do FAQ**

```
Nome: DevLingo - O que é - Antes FAQ
Tipo: In-article (anúncio dentro do artigo)
Tamanhos: Automático/Responsivo

Clique em "Criar"
→ Copie o data-ad-slot
```

#### **Ad Unit #3: Multiplex Relacionados**

```
Nome: DevLingo - O que é - Related Terms
Tipo: Multiplex (anúncios de conteúdo relacionado)
Tamanhos: Automático

Clique em "Criar"
→ Copie o data-ad-slot
```

---

### 3️⃣ Substituir os Placeholders no Código

Depois de criar as 3 unidades, você terá 3 números do tipo:

```
1234567890
2345678901
3456789012
```

**Abra o arquivo:**
`src/app/o-que-e/[slug]/page.js`

**Encontre e substitua:**

```javascript
// ANTES (linha ~439):
<AdSenseAd
  adSlot="YOUR_AD_SLOT_1"  ← Substituir
  ...
/>

// DEPOIS:
<AdSenseAd
  adSlot="1234567890"  ← Seu número real do AdSense
  ...
/>
```

**Faça isso para os 3 anúncios:**
- `YOUR_AD_SLOT_1` → Número do Ad Unit #1
- `YOUR_AD_SLOT_2` → Número do Ad Unit #2
- `YOUR_AD_SLOT_3` → Número do Ad Unit #3

---

### 4️⃣ Testar Localmente (Opcional mas Recomendado)

```bash
npm run dev

# Acesse:
http://localhost:3000/o-que-e/char
http://localhost:3000/o-que-e/react

# Verifique:
# - Anúncios aparecem (podem estar em branco no início)
# - Console do navegador sem erros
# - Código AdSense carregando
```

**NOTA:** Ads podem não aparecer localhost. Normal! Vão funcionar em produção.

---

### 5️⃣ Deploy para Produção

```bash
# 1. Commitar mudanças
git add src/app/o-que-e/[slug]/page.js

git commit -m "feat: add AdSense ads to /o-que-e route

- Add 3 strategic ad placements
- In-article ads after Quick Answer and before FAQ
- Multiplex ad after Related Terms
- Optimize for high RPM without hurting UX

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# 2. Push
git push

# 3. Aguarde deploy Vercel (2-3 min)
```

---

### 6️⃣ Verificar em Produção (1-2 horas depois do deploy)

```bash
# Acesse seu site em produção:
https://devlingo.com.br/o-que-e/char
https://devlingo.com.br/o-que-e/react

# Verifique:
✓ Anúncios aparecem
✓ Estão bem posicionados
✓ Não quebram o layout
✓ Funcionam em mobile E desktop
```

**IMPORTANTE:** Ads podem demorar 10-30 minutos para aparecer pela primeira vez!

---

### 7️⃣ Monitorar no Painel AdSense (24-48h depois)

```
AdSense > Home > Resumo

Métricas iniciais esperadas:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dia 1-2: $0.10 - $0.50
Impressões: 100-500
CTR: 0.5-2%
Fill Rate: 80-95%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Se aparecer $0.00:**
- Normal nos primeiros 1-2 dias
- AdSense precisa coletar dados
- Aguarde 48-72h

**Se ads não aparecem:**
- Verificar se código está correto
- Verificar console do navegador (F12)
- Verificar se site está aprovado no AdSense

---

## 🎯 PRÓXIMAS UNIDADES DE ANÚNCIO (Depois de Validar)

Quando as primeiras 3 estiverem funcionando, criar mais:

### Para página `/termos/[slug]` (artigo completo):
```
4. DevLingo - Termos - Header Desktop (Display 728x90)
5. DevLingo - Termos - Após Título (In-article)
6. DevLingo - Termos - Meio Conteúdo (In-article)
7. DevLingo - Termos - Sidebar Top (Display 300x250)
8. DevLingo - Termos - Multiplex Final (Multiplex)
```

### Para Mobile:
```
9. DevLingo - Mobile Anchor (Anchor - sticky bottom)
```

### Para Home/Categorias:
```
10. DevLingo - In-Feed Lista (In-feed)
```

---

## ⚠️ REGRAS DE OURO - NUNCA QUEBRAR!

```javascript
const neverDo = [
  '❌ Clicar nos próprios anúncios',
  '❌ Pedir para amigos/família clicarem',
  '❌ Usar "Clique aqui" perto dos ads',
  '❌ Modificar o código do AdSense',
  '❌ Comprar tráfego low-quality',
  '❌ Auto-refresh páginas com ads',
  '❌ Colocar ads em pop-ups',
  '❌ Mais de 3 ads por tela visível'
]
```

**Penalidade:** BAN PERMANENTE 🚨

---

## 📊 MÉTRICAS PARA ACOMPANHAR (Semanal)

```javascript
const weeklyChecklist = {
  adsense: {
    revenue: 'Crescendo?',
    rpm: '$5+ (mês 1) → $12+ (mês 2)',
    ctr: '0.5-2% (normal)',
    impressions: '3-4x pageviews',
    invalidTraffic: '< 5%'
  },

  analytics: {
    pageviews: 'Aumentando?',
    bounceRate: 'Não piorou > 5%?',
    timeOnPage: 'Mantido?'
  },

  gsc: {
    impressions: 'Crescendo?',
    clicks: 'Aumentando?',
    ctr: 'Melhorando?'
  }
}
```

---

## 🚀 TIMELINE ESPERADA

```
Dia 0 (Hoje):
━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Criar 3 unidades AdSense
✓ Substituir placeholders
✓ Deploy
━━━━━━━━━━━━━━━━━━━━━━━━━━

Dia 1-2:
━━━━━━━━━━━━━━━━━━━━━━━━━━
○ Ads começam a aparecer
○ Primeiras impressões
○ Receita: $0.10-0.50
━━━━━━━━━━━━━━━━━━━━━━━━━━

Dia 3-7:
━━━━━━━━━━━━━━━━━━━━━━━━━━
○ Dados estabilizam
○ RPM: $5-8
○ Receita: $2-5/dia
━━━━━━━━━━━━━━━━━━━━━━━━━━

Semana 2-4:
━━━━━━━━━━━━━━━━━━━━━━━━━━
○ Otimizar baseado em dados
○ Adicionar ads em /termos
○ RPM: $8-12
○ Receita: $5-10/dia
━━━━━━━━━━━━━━━━━━━━━━━━━━

Mês 2+:
━━━━━━━━━━━━━━━━━━━━━━━━━━
○ Tráfego crescendo (SEO)
○ RPM otimizado: $12-18
○ Receita: $150-300/mês
━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📝 RESUMO: O QUE FAZER AGORA

```bash
[ ] 1. Acessar google.com/adsense
[ ] 2. Criar 3 unidades de anúncio
[ ] 3. Copiar os 3 números (data-ad-slot)
[ ] 4. Substituir YOUR_AD_SLOT_1/2/3 no código
[ ] 5. Commit & push
[ ] 6. Aguardar deploy Vercel
[ ] 7. Verificar ads em produção (1-2h depois)
[ ] 8. Monitorar painel AdSense (24-48h)
```

---

## 🆘 PROBLEMAS COMUNS

### "Ads não aparecem"
```
Causas possíveis:
□ AdSense ainda processando (aguarde 24-48h)
□ Ad slots incorretos
□ Script não carregou (verificar console)
□ Adblocker ativo (desabilitar)
□ Site não 100% aprovado

Solução: Aguardar 48h. Se persistir, verificar console.
```

### "Revenue $0.00"
```
Normal nos primeiros 2-3 dias
AdSense precisa coletar dados e atrair anunciantes
Aguardar pacientemente
```

### "CTR muito alto (> 3%)"
```
RED FLAG! Google pode investigar
Causas: Posicionamento enganoso ou tráfego suspeito
Solução: Revisar placements
```

### "Invalid traffic alta (> 10%)"
```
CRÍTICO! Risco de ban
Causas: Bots, tráfego low-quality
Solução: Investigar fonte, bloquear se necessário
```

---

**Bora implementar! 🚀**

Qualquer dúvida, me avisa!
