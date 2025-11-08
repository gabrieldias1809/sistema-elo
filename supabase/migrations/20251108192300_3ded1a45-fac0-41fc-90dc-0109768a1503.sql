-- Update RLS policies for ptec_auto_os to include 2pel_p
DROP POLICY IF EXISTS "Admin, col, ptec_auto and oficina_auto can view" ON ptec_auto_os;
CREATE POLICY "Admin, col, ptec_auto, oficina_auto and 2pel_p can view" 
ON ptec_auto_os 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_auto'::app_role) OR 
  has_role(auth.uid(), 'oficina_auto'::app_role) OR
  has_role(auth.uid(), '2pel_p'::app_role)
);

DROP POLICY IF EXISTS "Admin, col, ptec_auto and oficina_auto can update" ON ptec_auto_os;
CREATE POLICY "Admin, col, ptec_auto, oficina_auto and 2pel_p can update" 
ON ptec_auto_os 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_auto'::app_role) OR 
  has_role(auth.uid(), 'oficina_auto'::app_role) OR
  has_role(auth.uid(), '2pel_p'::app_role)
);

-- Update RLS policies for ptec_blind_os to include 2pel_p
DROP POLICY IF EXISTS "Admin, col, ptec_blind and oficina_blind can view" ON ptec_blind_os;
CREATE POLICY "Admin, col, ptec_blind, oficina_blind and 2pel_p can view" 
ON ptec_blind_os 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_blind'::app_role) OR 
  has_role(auth.uid(), 'oficina_blind'::app_role) OR
  has_role(auth.uid(), '2pel_p'::app_role)
);

DROP POLICY IF EXISTS "Admin, col, ptec_blind and oficina_blind can update" ON ptec_blind_os;
CREATE POLICY "Admin, col, ptec_blind, oficina_blind and 2pel_p can update" 
ON ptec_blind_os 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'ptec_blind'::app_role) OR 
  has_role(auth.uid(), 'oficina_blind'::app_role) OR
  has_role(auth.uid(), '2pel_p'::app_role)
);

-- Update RLS policies for pel_p_mnt_os to include 2pel_p
DROP POLICY IF EXISTS "Admin, col, cia_mnt and pel_p_mnt can view" ON pel_p_mnt_os;
CREATE POLICY "Admin, col, cia_mnt, oficinas and 2pel_p can view" 
ON pel_p_mnt_os 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR 
  has_role(auth.uid(), 'oficina_auto'::app_role) OR 
  has_role(auth.uid(), 'oficina_blind'::app_role) OR
  has_role(auth.uid(), '2pel_p'::app_role)
);

DROP POLICY IF EXISTS "Admin, col, cia_mnt and pel_p_mnt can update" ON pel_p_mnt_os;
CREATE POLICY "Admin, col, cia_mnt, oficinas and 2pel_p can update" 
ON pel_p_mnt_os 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR 
  has_role(auth.uid(), 'oficina_auto'::app_role) OR 
  has_role(auth.uid(), 'oficina_blind'::app_role) OR
  has_role(auth.uid(), '2pel_p'::app_role)
);

DROP POLICY IF EXISTS "Admin, col, cia_mnt and pel_p_mnt can insert" ON pel_p_mnt_os;
CREATE POLICY "Admin, col, cia_mnt, oficinas and 2pel_p can insert" 
ON pel_p_mnt_os 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR 
  has_role(auth.uid(), 'oficina_auto'::app_role) OR 
  has_role(auth.uid(), 'oficina_blind'::app_role) OR
  has_role(auth.uid(), '2pel_p'::app_role)
);