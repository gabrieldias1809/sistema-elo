-- Adicionar campos de unidade de medida e observações à tabela col_pedidos_sup
ALTER TABLE public.col_pedidos_sup
ADD COLUMN unidade_medida text,
ADD COLUMN observacoes text;