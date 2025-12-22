# Arquitetura de Database - DevLingo

## 📊 Visão Geral

O DevLingo agora utiliza uma arquitetura de **3 camadas** para otimizar performance e custos:

```
┌─────────────┐
│  Next.js    │  Application Layer
│   API       │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────────┐
│    Terms Service (Service Layer)    │
│  src/lib/services/termsService.ts    │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────┬──────────────┬────────────────┐
│   Redis      │  PostgreSQL  │   AI Engine    │
│   (Cache)    │  (Database)  │  (Generator)   │
│              │              │                │
│  TTL: 24h    │  Supabase    │  Maritaca AI   │
│  Top 1000    │  Source of   │  + SO RAG      │
│  terms       │  Truth       │                │
└──────────────┴──────────────┴────────────────┘
```

## 🎯 Estratégia de Busca

Quando um termo é solicitado, o fluxo é:

### 1️⃣ Cache Layer (Redis) - **Fastest**
- **Quando usar**: Termos populares com alta taxa de acesso
- **TTL**: 24 horas
- **Formato**: JSON completo do termo
- **Key pattern**: `terms:{slug}`

### 2️⃣ Database Layer (PostgreSQL/Supabase) - **Source of Truth**
- **Quando usar**: Termo existe mas não está em cache
- **Recursos**:
  - Full-text search em Português
  - Analytics (views, clicks, impressions)
  - Versionamento de conteúdo
  - Metadados de geração (IA model, tempo, RAG status)
- **After fetch**: Automaticamente cacheia no Redis

### 3️⃣ Generation Layer (AI) - **Fallback**
- **Quando usar**: Termo não existe em nenhuma camada
- **Processo**:
  1. Gera conteúdo com Maritaca AI + Stack Overflow RAG
  2. Salva no PostgreSQL (status: published)
  3. Cacheia no Redis
  4. Retorna para usuário
- **Tempo**: ~2-5 segundos

## 🗄️ Schema PostgreSQL

### Tabela: `terms`

```sql
CREATE TABLE terms (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  content JSONB NOT NULL,  -- Estrutura: {introduction, fundamentals, implementation, ...}
  category VARCHAR(100),

  -- SEO & Metadata
  meta_description TEXT,
  sources JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',

  -- Stack Overflow Data
  stack_overflow_tag VARCHAR(255),
  stack_overflow_count INTEGER DEFAULT 0,
  stack_overflow_data JSONB,
  related_terms TEXT[] DEFAULT ARRAY[],

  -- Content Structure
  code_examples JSONB DEFAULT '[]',
  faq JSONB DEFAULT '[]',
  term_references JSONB DEFAULT '[]',
  why_learn TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'draft',  -- draft, published, reviewing, archived

  -- Analytics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,

  -- Generation Metadata
  model_used VARCHAR(100),
  generation_time_ms INTEGER,
  rag_enabled BOOLEAN DEFAULT false,
  version VARCHAR(20) DEFAULT '1.0',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ,

  -- Full-text Search (Portuguese)
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(meta_description, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(content::text, '')), 'C')
  ) STORED
);
```

### Índices

```sql
CREATE INDEX idx_terms_slug ON terms(slug);              -- Busca por slug
CREATE INDEX idx_terms_category ON terms(category);      -- Filtro por categoria
CREATE INDEX idx_terms_status ON terms(status);          -- Filtro por status
CREATE INDEX idx_terms_search ON terms USING GIN(search_vector);  -- Full-text search
CREATE INDEX idx_terms_created_at ON terms(created_at DESC);       -- Ordenação temporal
CREATE INDEX idx_terms_views ON terms(views DESC);                 -- Top terms
```

## 🔧 Scripts Disponíveis

### Testar Conexão
```bash
npm run db:test
```
Verifica conectividade com PostgreSQL e mostra estatísticas.

### Migrar Dados Redis → PostgreSQL
```bash
npm run db:migrate
```
Migra todos os termos do Redis para PostgreSQL. Características:
- Processa em lotes de 10 termos
- Skip termos já existentes
- Estatísticas detalhadas ao final
- Preserva Redis após migração

### Drizzle Studio (GUI)
```bash
npm run db:studio
```
Interface visual para gerenciar dados no PostgreSQL.

### Push Schema
```bash
npm run db:push
```
Sincroniza mudanças no schema TypeScript com o PostgreSQL.

## 📡 API Endpoints

### GET `/api/v1/term/[slug]`
Busca termo individual.

**Response:**
```json
{
  "success": true,
  "term": {
    "slug": "api",
    "title": "API - Application Programming Interface",
    "content": {...},
    "category": "acronyms",
    "codeExamples": [...],
    "faq": [...]
  },
  "_meta": {
    "source": "redis"  // ou "postgres" ou "generated"
  }
}
```

### GET `/api/v1/terms`
Lista termos com paginação.

**Query params:**
- `limit` (default: 20)
- `offset` (default: 0)
- `category` (opcional)

**Response:**
```json
{
  "success": true,
  "terms": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

## 🚀 Migração de Dados

### Passo 1: Verificar Dados no Redis
```bash
# Contar termos no Redis
redis-cli --url $REDIS_URL DBSIZE
```

### Passo 2: Executar Migração
```bash
npm run db:migrate
```

### Passo 3: Verificar Dados no PostgreSQL
```bash
npm run db:test
```

### Passo 4: Validar API
```bash
curl http://localhost:3000/api/v1/term/api
curl http://localhost:3000/api/v1/terms?limit=5
```

## 🎯 Próximos Passos

### 1. Geração em Lote
Criar agente OpenAI para pré-gerar top 1000 termos:
- Usar Stack Overflow API para identificar tags mais populares
- Gerar conteúdo com MCP Context7 (documentação oficial)
- Salvar diretamente no PostgreSQL
- Popular cache Redis para termos top 100

### 2. Analytics Dashboard
Interface admin para:
- Visualizar termos mais acessados
- Monitorar performance de geração
- Identificar termos sem conteúdo
- Gerenciar status (draft/published)

### 3. Busca Avançada
Implementar endpoint de busca full-text:
```
GET /api/v1/search?q=javascript&limit=10
```

### 4. Sitemap Dinâmico
Gerar sitemap baseado em termos publicados no PostgreSQL ao invés de todos os termos teóricos.

## 💰 Custos Estimados

### PostgreSQL (Supabase)
- **Plano Free**: até 500MB, 2 CPU compartilhadas
- **Pro ($25/mês)**: 8GB, 2 CPU dedicadas, backups automáticos
- **Estimativa para 15k termos**: ~200-300MB (Pro recomendado)

### Redis (Upstash)
- **Plano atual**: Caching de top 1000 termos
- **Custo**: Incluído no plano existente

### Total mensal estimado
- Supabase Pro: $25
- Redis: $0 (plano atual)
- **Total: $25/mês** (vs $50-100/mês no Firebase para mesma carga)

## 📈 Benefícios da Nova Arquitetura

### Performance
- ⚡ Cache Redis: ~5ms de latência
- 🐘 PostgreSQL: ~20-50ms de latência
- 🤖 Geração AI: ~2-5s (apenas primeira vez)

### SEO
- ✅ Conteúdo pré-gerado indexável
- ✅ Busca full-text em português
- ✅ Metadata estruturada
- ✅ Analytics de views por termo

### Custos
- 💰 50-75% mais barato que Firebase
- 📊 Melhor custo por query
- 🔄 Backup automático incluído

### Developer Experience
- 🎨 Drizzle Studio (GUI)
- 🔒 Type-safety com TypeScript
- 🧪 Testes mais fáceis
- 📝 Migrations versionadas
