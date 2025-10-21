-- Add classe_material column to ptec_pedidos_material table
ALTER TABLE public.ptec_pedidos_material 
ADD COLUMN IF NOT EXISTS classe_material text;

COMMENT ON COLUMN public.ptec_pedidos_material.classe_material IS 'Classe do material solicitado (I-X)';