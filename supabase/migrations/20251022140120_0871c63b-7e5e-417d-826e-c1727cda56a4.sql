-- Update RLS policies for ptec_com_os
DROP POLICY IF EXISTS "Admin and ptec_com can delete" ON public.ptec_com_os;
DROP POLICY IF EXISTS "Admin and ptec_com can insert" ON public.ptec_com_os;
DROP POLICY IF EXISTS "Admin, ptec_com and oficina_com can update" ON public.ptec_com_os;
DROP POLICY IF EXISTS "Admin, ptec_com and oficina_com can view" ON public.ptec_com_os;

CREATE POLICY "Admin, col and ptec_com can delete" ON public.ptec_com_os
FOR DELETE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role)
);

CREATE POLICY "Admin, col and ptec_com can insert" ON public.ptec_com_os
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_com'::app_role)
);

CREATE POLICY "Admin, col, ptec_com and oficina_com can update" ON public.ptec_com_os
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_com'::app_role) OR 
  has_role(auth.uid(), 'oficina_com'::app_role)
);

CREATE POLICY "Admin, col, ptec_com and oficina_com can view" ON public.ptec_com_os
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_com'::app_role) OR 
  has_role(auth.uid(), 'oficina_com'::app_role)
);

-- Update RLS policies for ptec_auto_os
DROP POLICY IF EXISTS "Admin and ptec_auto can delete" ON public.ptec_auto_os;
DROP POLICY IF EXISTS "Admin and ptec_auto can insert" ON public.ptec_auto_os;
DROP POLICY IF EXISTS "Admin, ptec_auto and oficina_auto can update" ON public.ptec_auto_os;
DROP POLICY IF EXISTS "Admin, ptec_auto and oficina_auto can view" ON public.ptec_auto_os;

CREATE POLICY "Admin, col and ptec_auto can delete" ON public.ptec_auto_os
FOR DELETE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role)
);

CREATE POLICY "Admin, col and ptec_auto can insert" ON public.ptec_auto_os
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_auto'::app_role)
);

CREATE POLICY "Admin, col, ptec_auto and oficina_auto can update" ON public.ptec_auto_os
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_auto'::app_role) OR 
  has_role(auth.uid(), 'oficina_auto'::app_role)
);

CREATE POLICY "Admin, col, ptec_auto and oficina_auto can view" ON public.ptec_auto_os
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_auto'::app_role) OR 
  has_role(auth.uid(), 'oficina_auto'::app_role)
);

-- Update RLS policies for ptec_blind_os
DROP POLICY IF EXISTS "Admin and ptec_blind can delete" ON public.ptec_blind_os;
DROP POLICY IF EXISTS "Admin and ptec_blind can insert" ON public.ptec_blind_os;
DROP POLICY IF EXISTS "Admin, ptec_blind and oficina_blind can update" ON public.ptec_blind_os;
DROP POLICY IF EXISTS "Admin, ptec_blind and oficina_blind can view" ON public.ptec_blind_os;

CREATE POLICY "Admin, col and ptec_blind can delete" ON public.ptec_blind_os
FOR DELETE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role)
);

CREATE POLICY "Admin, col and ptec_blind can insert" ON public.ptec_blind_os
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_blind'::app_role)
);

CREATE POLICY "Admin, col, ptec_blind and oficina_blind can update" ON public.ptec_blind_os
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_blind'::app_role) OR 
  has_role(auth.uid(), 'oficina_blind'::app_role)
);

CREATE POLICY "Admin, col, ptec_blind and oficina_blind can view" ON public.ptec_blind_os
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_blind'::app_role) OR 
  has_role(auth.uid(), 'oficina_blind'::app_role)
);

-- Update RLS policies for ptec_op_os
DROP POLICY IF EXISTS "Admin and ptec_op can delete" ON public.ptec_op_os;
DROP POLICY IF EXISTS "Admin and ptec_op can insert" ON public.ptec_op_os;
DROP POLICY IF EXISTS "Admin, ptec_op and oficina_op can update" ON public.ptec_op_os;
DROP POLICY IF EXISTS "Admin, ptec_op and oficina_op can view" ON public.ptec_op_os;

CREATE POLICY "Admin, col and ptec_op can delete" ON public.ptec_op_os
FOR DELETE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role)
);

CREATE POLICY "Admin, col and ptec_op can insert" ON public.ptec_op_os
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_op'::app_role)
);

CREATE POLICY "Admin, col, ptec_op and oficina_op can update" ON public.ptec_op_os
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_op'::app_role) OR 
  has_role(auth.uid(), 'oficina_op'::app_role)
);

CREATE POLICY "Admin, col, ptec_op and oficina_op can view" ON public.ptec_op_os
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_op'::app_role) OR 
  has_role(auth.uid(), 'oficina_op'::app_role)
);

-- Update RLS policies for ptec_armto_os
DROP POLICY IF EXISTS "Admin and ptec_armto can delete" ON public.ptec_armto_os;
DROP POLICY IF EXISTS "Admin and ptec_armto can insert" ON public.ptec_armto_os;
DROP POLICY IF EXISTS "Admin, ptec_armto and oficina_armto can update" ON public.ptec_armto_os;
DROP POLICY IF EXISTS "Admin, ptec_armto and oficina_armto can view" ON public.ptec_armto_os;

CREATE POLICY "Admin, col and ptec_armto can delete" ON public.ptec_armto_os
FOR DELETE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role)
);

CREATE POLICY "Admin, col and ptec_armto can insert" ON public.ptec_armto_os
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_armto'::app_role)
);

CREATE POLICY "Admin, col, ptec_armto and oficina_armto can update" ON public.ptec_armto_os
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_armto'::app_role) OR 
  has_role(auth.uid(), 'oficina_armto'::app_role)
);

CREATE POLICY "Admin, col, ptec_armto and oficina_armto can view" ON public.ptec_armto_os
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_armto'::app_role) OR 
  has_role(auth.uid(), 'oficina_armto'::app_role)
);

-- Update RLS policies for ptec_mb_os
DROP POLICY IF EXISTS "Admin and ptec_mb can delete" ON public.ptec_mb_os;
DROP POLICY IF EXISTS "Admin and ptec_mb can insert" ON public.ptec_mb_os;
DROP POLICY IF EXISTS "Admin and ptec_mb can update" ON public.ptec_mb_os;
DROP POLICY IF EXISTS "Admin and ptec_mb can view" ON public.ptec_mb_os;

CREATE POLICY "Admin, col and ptec_mb can delete" ON public.ptec_mb_os
FOR DELETE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role)
);

CREATE POLICY "Admin, col and ptec_mb can insert" ON public.ptec_mb_os
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_mb'::app_role)
);

CREATE POLICY "Admin, col and ptec_mb can update" ON public.ptec_mb_os
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_mb'::app_role)
);

CREATE POLICY "Admin, col and ptec_mb can view" ON public.ptec_mb_os
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_mb'::app_role)
);

-- Update RLS policies for ptec_pedidos_material
DROP POLICY IF EXISTS "Admin can delete pedidos" ON public.ptec_pedidos_material;
DROP POLICY IF EXISTS "P_distr and creator can update pedidos" ON public.ptec_pedidos_material;

CREATE POLICY "Admin and col can delete pedidos" ON public.ptec_pedidos_material
FOR DELETE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role)
);

CREATE POLICY "Admin, col, p_distr and creator can update pedidos" ON public.ptec_pedidos_material
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'p_distr'::app_role) OR 
  created_by = auth.uid()
);