-- DevLingo Database Schema
-- Migration: 001 - Create terms and categories tables

-- Create terms table with full-text search and analytics
CREATE TABLE IF NOT EXISTS terms (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),

  -- Metadata and sources
  sources JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Stack Overflow related data
  stack_overflow_tag VARCHAR(255),
  stack_overflow_count INTEGER DEFAULT 0,
  related_terms TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Content status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'reviewing', 'archived')),

  -- Analytics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,

  -- Full-text search vector (Portuguese)
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(content, '')), 'B')
  ) STORED
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_terms_slug ON terms(slug);
CREATE INDEX IF NOT EXISTS idx_terms_category ON terms(category);
CREATE INDEX IF NOT EXISTS idx_terms_status ON terms(status);
CREATE INDEX IF NOT EXISTS idx_terms_search ON terms USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_terms_created_at ON terms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_terms_views ON terms(views DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER terms_updated_at
  BEFORE UPDATE ON terms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  term_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (slug, name, description, icon) VALUES
  ('internet', 'Internet', 'Termos técnicos relacionados à Internet, protocolos de rede, navegação web e tecnologias online.', '🌐'),
  ('hardware', 'Hardware', 'Componentes físicos de computadores e dispositivos eletrônicos, processadores, memória e periféricos.', '🖥️'),
  ('software', 'Software', 'Programas, aplicativos, sistemas operacionais e ferramentas de desenvolvimento de software.', '💿'),
  ('technical', 'Técnico', 'Termos técnicos gerais de programação, desenvolvimento e tecnologia da informação.', '⚙️'),
  ('acronyms', 'Acrônimos', 'Siglas e acrônimos comuns em tecnologia, programação e TI.', '🔤'),
  ('bits_and_bytes', 'Bits e Bytes', 'Conceitos fundamentais sobre unidades de informação digital e armazenamento de dados.', '💾'),
  ('file_formats', 'Formato de Arquivos', 'Extensões e formatos de arquivos usados em programação, desenvolvimento e armazenamento de dados.', '📁')
ON CONFLICT (slug) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE terms IS 'Tabela principal de termos técnicos do DevLingo';
COMMENT ON COLUMN terms.search_vector IS 'Vetor de busca full-text em português';
COMMENT ON COLUMN terms.sources IS 'Array de fontes/referências (URLs, docs oficiais)';
COMMENT ON COLUMN terms.metadata IS 'Dados adicionais (FAQ, exemplos, tags)';
COMMENT ON COLUMN terms.related_terms IS 'Array de slugs de termos relacionados';

-- Enable Row Level Security (RLS)
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read, authenticated write
CREATE POLICY "Public can read published terms"
  ON terms FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can manage terms"
  ON terms FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);
