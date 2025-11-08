-- Adicionar colunas necessárias para pel_p_mnt na tabela centralizada
ALTER TABLE cia_mnt_os_centralizadas 
ADD COLUMN IF NOT EXISTS tipo_viatura TEXT,
ADD COLUMN IF NOT EXISTS registro_material TEXT;