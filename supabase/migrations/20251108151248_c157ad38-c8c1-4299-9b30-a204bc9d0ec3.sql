-- Fix RLS policy for cia_mnt role to insert into consolidated OS table
DROP POLICY IF EXISTS "PTECs can insert their OS" ON cia_mnt_os_centralizadas;

CREATE POLICY "PTECs and cia_mnt can insert their OS" 
ON cia_mnt_os_centralizadas
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'col'::app_role) 
  OR has_role(auth.uid(), 'cia_mnt'::app_role)
  OR (has_role(auth.uid(), 'ptec_com'::app_role) AND ptec_origem = 'com')
  OR (has_role(auth.uid(), 'ptec_auto'::app_role) AND ptec_origem = 'auto')
  OR (has_role(auth.uid(), 'ptec_blind'::app_role) AND ptec_origem = 'blind')
  OR (has_role(auth.uid(), 'ptec_op'::app_role) AND ptec_origem = 'op')
  OR (has_role(auth.uid(), 'ptec_armto'::app_role) AND ptec_origem = 'armto')
);