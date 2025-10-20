-- Atualizar policies da ptec_com_os para incluir oficina
DROP POLICY IF EXISTS "Admin and ptec_com can view" ON public.ptec_com_os;
CREATE POLICY "Admin, ptec_com and oficina_com can view"
ON public.ptec_com_os FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_com'::app_role) OR has_role(auth.uid(), 'oficina_com'::app_role));

DROP POLICY IF EXISTS "Admin and ptec_com can update" ON public.ptec_com_os;
CREATE POLICY "Admin, ptec_com and oficina_com can update"
ON public.ptec_com_os FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_com'::app_role) OR has_role(auth.uid(), 'oficina_com'::app_role));

-- Políticas RLS para ptec_auto_os
CREATE POLICY "Admin, ptec_auto and oficina_auto can view"
ON public.ptec_auto_os FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_auto'::app_role) OR has_role(auth.uid(), 'oficina_auto'::app_role));

CREATE POLICY "Admin and ptec_auto can insert"
ON public.ptec_auto_os FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_auto'::app_role));

CREATE POLICY "Admin, ptec_auto and oficina_auto can update"
ON public.ptec_auto_os FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_auto'::app_role) OR has_role(auth.uid(), 'oficina_auto'::app_role));

CREATE POLICY "Admin and ptec_auto can delete"
ON public.ptec_auto_os FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_auto'::app_role));

-- Políticas RLS para ptec_blind_os
CREATE POLICY "Admin, ptec_blind and oficina_blind can view"
ON public.ptec_blind_os FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_blind'::app_role) OR has_role(auth.uid(), 'oficina_blind'::app_role));

CREATE POLICY "Admin and ptec_blind can insert"
ON public.ptec_blind_os FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_blind'::app_role));

CREATE POLICY "Admin, ptec_blind and oficina_blind can update"
ON public.ptec_blind_os FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_blind'::app_role) OR has_role(auth.uid(), 'oficina_blind'::app_role));

CREATE POLICY "Admin and ptec_blind can delete"
ON public.ptec_blind_os FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_blind'::app_role));

-- Políticas RLS para ptec_op_os
CREATE POLICY "Admin, ptec_op and oficina_op can view"
ON public.ptec_op_os FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_op'::app_role) OR has_role(auth.uid(), 'oficina_op'::app_role));

CREATE POLICY "Admin and ptec_op can insert"
ON public.ptec_op_os FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_op'::app_role));

CREATE POLICY "Admin, ptec_op and oficina_op can update"
ON public.ptec_op_os FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_op'::app_role) OR has_role(auth.uid(), 'oficina_op'::app_role));

CREATE POLICY "Admin and ptec_op can delete"
ON public.ptec_op_os FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_op'::app_role));

-- Políticas RLS para ptec_armto_os
CREATE POLICY "Admin, ptec_armto and oficina_armto can view"
ON public.ptec_armto_os FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_armto'::app_role) OR has_role(auth.uid(), 'oficina_armto'::app_role));

CREATE POLICY "Admin and ptec_armto can insert"
ON public.ptec_armto_os FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_armto'::app_role));

CREATE POLICY "Admin, ptec_armto and oficina_armto can update"
ON public.ptec_armto_os FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_armto'::app_role) OR has_role(auth.uid(), 'oficina_armto'::app_role));

CREATE POLICY "Admin and ptec_armto can delete"
ON public.ptec_armto_os FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_armto'::app_role));

-- Políticas RLS para ptec_pedidos_material
CREATE POLICY "Users can view their own or related pedidos"
ON public.ptec_pedidos_material FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR created_by = auth.uid() 
  OR has_role(auth.uid(), 'p_distr'::app_role)
  OR (oficina_destino = 'com' AND has_role(auth.uid(), 'oficina_com'::app_role))
  OR (oficina_destino = 'auto' AND has_role(auth.uid(), 'oficina_auto'::app_role))
  OR (oficina_destino = 'blind' AND has_role(auth.uid(), 'oficina_blind'::app_role))
  OR (oficina_destino = 'op' AND has_role(auth.uid(), 'oficina_op'::app_role))
  OR (oficina_destino = 'armto' AND has_role(auth.uid(), 'oficina_armto'::app_role))
);

CREATE POLICY "Ptecs and oficinas can insert pedidos"
ON public.ptec_pedidos_material FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'ptec_com'::app_role)
  OR has_role(auth.uid(), 'ptec_auto'::app_role)
  OR has_role(auth.uid(), 'ptec_blind'::app_role)
  OR has_role(auth.uid(), 'ptec_op'::app_role)
  OR has_role(auth.uid(), 'ptec_armto'::app_role)
  OR has_role(auth.uid(), 'oficina_com'::app_role)
  OR has_role(auth.uid(), 'oficina_auto'::app_role)
  OR has_role(auth.uid(), 'oficina_blind'::app_role)
  OR has_role(auth.uid(), 'oficina_op'::app_role)
  OR has_role(auth.uid(), 'oficina_armto'::app_role)
);

CREATE POLICY "P_distr and creator can update pedidos"
ON public.ptec_pedidos_material FOR UPDATE
USING (has_role(auth.uid(), 'p_distr'::app_role) OR created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete pedidos"
ON public.ptec_pedidos_material FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));