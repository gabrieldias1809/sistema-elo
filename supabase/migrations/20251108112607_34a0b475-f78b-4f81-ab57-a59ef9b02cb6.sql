-- Atualizar políticas da tabela cia_mnt_os_centralizadas para incluir cia_mnt
DROP POLICY IF EXISTS "Admin, col and PTECs can view consolidated OS" ON cia_mnt_os_centralizadas;
CREATE POLICY "Admin, col, cia_mnt and PTECs can view consolidated OS"
ON cia_mnt_os_centralizadas
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'ptec_com'::app_role) OR 
  has_role(auth.uid(), 'ptec_auto'::app_role) OR 
  has_role(auth.uid(), 'ptec_blind'::app_role) OR 
  has_role(auth.uid(), 'ptec_op'::app_role) OR 
  has_role(auth.uid(), 'ptec_armto'::app_role) OR 
  has_role(auth.uid(), 'oficina_com'::app_role) OR 
  has_role(auth.uid(), 'oficina_auto'::app_role) OR 
  has_role(auth.uid(), 'oficina_blind'::app_role) OR 
  has_role(auth.uid(), 'oficina_op'::app_role) OR 
  has_role(auth.uid(), 'oficina_armto'::app_role)
);

DROP POLICY IF EXISTS "Admin, col, PTECs and oficinas can update OS" ON cia_mnt_os_centralizadas;
CREATE POLICY "Admin, col, cia_mnt, PTECs and oficinas can update OS"
ON cia_mnt_os_centralizadas
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'ptec_com'::app_role) OR 
  has_role(auth.uid(), 'ptec_auto'::app_role) OR 
  has_role(auth.uid(), 'ptec_blind'::app_role) OR 
  has_role(auth.uid(), 'ptec_op'::app_role) OR 
  has_role(auth.uid(), 'ptec_armto'::app_role) OR 
  has_role(auth.uid(), 'oficina_com'::app_role) OR 
  has_role(auth.uid(), 'oficina_auto'::app_role) OR 
  has_role(auth.uid(), 'oficina_blind'::app_role) OR 
  has_role(auth.uid(), 'oficina_op'::app_role) OR 
  has_role(auth.uid(), 'oficina_armto'::app_role)
);

DROP POLICY IF EXISTS "Admin and col can delete OS" ON cia_mnt_os_centralizadas;
CREATE POLICY "Admin, col and cia_mnt can delete OS"
ON cia_mnt_os_centralizadas
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role)
);