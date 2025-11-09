-- Atualizar política RLS para permitir que cia_trp visualize pedidos de suprimento
DROP POLICY IF EXISTS "Admin, col and cia_sup can view" ON public.col_pedidos_sup;

CREATE POLICY "Admin, col, cia_sup and cia_trp can view" 
ON public.col_pedidos_sup 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'col'::app_role) 
  OR has_role(auth.uid(), 'cia_sup'::app_role)
  OR has_role(auth.uid(), 'cia_trp'::app_role)
  OR (created_by = auth.uid())
);