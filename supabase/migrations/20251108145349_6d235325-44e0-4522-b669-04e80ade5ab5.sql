-- Atualizar políticas RLS para permitir que cia_mnt visualize e gerencie OS

-- PTEC COM OS
DROP POLICY IF EXISTS "Admin, col, ptec_com and oficina_com can view" ON ptec_com_os;
CREATE POLICY "Admin, col, cia_mnt, ptec_com and oficina_com can view" 
ON ptec_com_os 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'ptec_com'::app_role) OR 
  has_role(auth.uid(), 'oficina_com'::app_role)
);

DROP POLICY IF EXISTS "Admin, col, ptec_com and oficina_com can update" ON ptec_com_os;
CREATE POLICY "Admin, col, cia_mnt, ptec_com and oficina_com can update" 
ON ptec_com_os 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'ptec_com'::app_role) OR 
  has_role(auth.uid(), 'oficina_com'::app_role)
);

DROP POLICY IF EXISTS "Admin, col and ptec_com can delete" ON ptec_com_os;
CREATE POLICY "Admin, col and cia_mnt can delete" 
ON ptec_com_os 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR
  has_role(auth.uid(), 'cia_mnt'::app_role)
);

-- PTEC OP OS
DROP POLICY IF EXISTS "Admin, col, ptec_op and oficina_op can view" ON ptec_op_os;
CREATE POLICY "Admin, col, cia_mnt, ptec_op and oficina_op can view" 
ON ptec_op_os 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'ptec_op'::app_role) OR 
  has_role(auth.uid(), 'oficina_op'::app_role)
);

DROP POLICY IF EXISTS "Admin, col, ptec_op and oficina_op can update" ON ptec_op_os;
CREATE POLICY "Admin, col, cia_mnt, ptec_op and oficina_op can update" 
ON ptec_op_os 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'ptec_op'::app_role) OR 
  has_role(auth.uid(), 'oficina_op'::app_role)
);

DROP POLICY IF EXISTS "Admin, col and ptec_op can delete" ON ptec_op_os;
CREATE POLICY "Admin, col and cia_mnt can delete" 
ON ptec_op_os 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR
  has_role(auth.uid(), 'cia_mnt'::app_role)
);

-- PTEC ARMTO OS
DROP POLICY IF EXISTS "Admin, col, ptec_armto and oficina_armto can view" ON ptec_armto_os;
CREATE POLICY "Admin, col, cia_mnt, ptec_armto and oficina_armto can view" 
ON ptec_armto_os 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'ptec_armto'::app_role) OR 
  has_role(auth.uid(), 'oficina_armto'::app_role)
);

DROP POLICY IF EXISTS "Admin, col, ptec_armto and oficina_armto can update" ON ptec_armto_os;
CREATE POLICY "Admin, col, cia_mnt, ptec_armto and oficina_armto can update" 
ON ptec_armto_os 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'ptec_armto'::app_role) OR 
  has_role(auth.uid(), 'oficina_armto'::app_role)
);

DROP POLICY IF EXISTS "Admin, col and ptec_armto can delete" ON ptec_armto_os;
CREATE POLICY "Admin, col and cia_mnt can delete" 
ON ptec_armto_os 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR
  has_role(auth.uid(), 'cia_mnt'::app_role)
);

-- PEL P MNT OS
DROP POLICY IF EXISTS "Admin, col, pel_p_mnt can view" ON pel_p_mnt_os;
CREATE POLICY "Admin, col, cia_mnt and pel_p_mnt can view" 
ON pel_p_mnt_os 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'oficina_auto'::app_role) OR 
  has_role(auth.uid(), 'oficina_blind'::app_role)
);

DROP POLICY IF EXISTS "Admin, col, pel_p_mnt can update" ON pel_p_mnt_os;
CREATE POLICY "Admin, col, cia_mnt and pel_p_mnt can update" 
ON pel_p_mnt_os 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'oficina_auto'::app_role) OR 
  has_role(auth.uid(), 'oficina_blind'::app_role)
);

DROP POLICY IF EXISTS "Admin and col can delete" ON pel_p_mnt_os;
CREATE POLICY "Admin, col and cia_mnt can delete" 
ON pel_p_mnt_os 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR
  has_role(auth.uid(), 'cia_mnt'::app_role)
);