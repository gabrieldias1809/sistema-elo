-- Add registro_material column to ptec_auto_os and ptec_blind_os tables
ALTER TABLE ptec_auto_os ADD COLUMN IF NOT EXISTS registro_material TEXT;
ALTER TABLE ptec_blind_os ADD COLUMN IF NOT EXISTS registro_material TEXT;