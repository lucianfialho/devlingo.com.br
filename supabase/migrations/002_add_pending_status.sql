-- Migration 002: Adicionar status 'pending' e 'generating' à constraint
-- Para suportar geração automática de termos 404

ALTER TABLE terms DROP CONSTRAINT IF EXISTS terms_status_check;

ALTER TABLE terms ADD CONSTRAINT terms_status_check
  CHECK (status IN ('draft', 'published', 'reviewing', 'archived', 'pending', 'generating', 'failed'));

COMMENT ON COLUMN terms.status IS 'Status do termo: draft (rascunho), pending (aguardando geração), generating (gerando), published (publicado), reviewing (em revisão), failed (falha na geração), archived (arquivado)';
