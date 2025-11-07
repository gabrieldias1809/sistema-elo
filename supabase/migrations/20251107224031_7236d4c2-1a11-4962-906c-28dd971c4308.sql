-- Remover coluna unidade_medida da tabela col_pedidos_sup (agora é por material)
ALTER TABLE public.col_pedidos_sup
DROP COLUMN unidade_medida;