-- Atualizar política RLS para permitir que todas as oficinas visualizem todos os pedidos de material
DROP POLICY IF EXISTS "Users can view their own or related pedidos" ON public.ptec_pedidos_material;

CREATE POLICY "Users can view their own or related pedidos" 
ON public.ptec_pedidos_material 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (created_by = auth.uid()) 
  OR has_role(auth.uid(), 'p_distr'::app_role)
  OR has_role(auth.uid(), 'oficina_com'::app_role)
  OR has_role(auth.uid(), 'oficina_auto'::app_role)
  OR has_role(auth.uid(), 'oficina_blind'::app_role)
  OR has_role(auth.uid(), 'oficina_op'::app_role)
  OR has_role(auth.uid(), 'oficina_armto'::app_role)
);