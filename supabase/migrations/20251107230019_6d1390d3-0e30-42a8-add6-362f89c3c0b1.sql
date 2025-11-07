-- Add pedido_transporte_id and chefe_viatura to cia_trp_fichas_saida
ALTER TABLE public.cia_trp_fichas_saida
ADD COLUMN IF NOT EXISTS pedido_transporte_id uuid REFERENCES public.cia_sup_pedidos_transporte(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS chefe_viatura text;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_fichas_saida_pedido_transporte ON public.cia_trp_fichas_saida(pedido_transporte_id);