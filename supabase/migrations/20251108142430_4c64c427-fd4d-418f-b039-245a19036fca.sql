-- Atualizar políticas RLS de INSERT para permitir cia_mnt criar OSs em todas as tabelas PTEC

-- PTEC Com
DROP POLICY IF EXISTS "Admin, col and ptec_com can insert" ON ptec_com_os;
CREATE POLICY "Admin, col, cia_mnt and ptec_com can insert"
ON ptec_com_os FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'ptec_com'::app_role)
);

-- PTEC Auto
DROP POLICY IF EXISTS "Admin, col and ptec_auto can insert" ON ptec_auto_os;
CREATE POLICY "Admin, col, cia_mnt and ptec_auto can insert"
ON ptec_auto_os FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'ptec_auto'::app_role)
);

-- PTEC Blind
DROP POLICY IF EXISTS "Admin, col and ptec_blind can insert" ON ptec_blind_os;
CREATE POLICY "Admin, col, cia_mnt and ptec_blind can insert"
ON ptec_blind_os FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'ptec_blind'::app_role)
);

-- PTEC Op
DROP POLICY IF EXISTS "Admin, col and ptec_op can insert" ON ptec_op_os;
CREATE POLICY "Admin, col, cia_mnt and ptec_op can insert"
ON ptec_op_os FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'ptec_op'::app_role)
);

-- PTEC Armto
DROP POLICY IF EXISTS "Admin, col and ptec_armto can insert" ON ptec_armto_os;
CREATE POLICY "Admin, col, cia_mnt and ptec_armto can insert"
ON ptec_armto_os FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'ptec_armto'::app_role)
);