-- Atualizar o trigger de delete para incluir pel_p_mnt
CREATE OR REPLACE FUNCTION public.sync_os_delete_to_ptec()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Delete from the corresponding PTEC table based on ptec_origem
  CASE OLD.ptec_origem
    WHEN 'com' THEN
      DELETE FROM ptec_com_os WHERE numero_os = OLD.numero_os;
    WHEN 'auto' THEN
      DELETE FROM ptec_auto_os WHERE numero_os = OLD.numero_os;
    WHEN 'blind' THEN
      DELETE FROM ptec_blind_os WHERE numero_os = OLD.numero_os;
    WHEN 'op' THEN
      DELETE FROM ptec_op_os WHERE numero_os = OLD.numero_os;
    WHEN 'armto' THEN
      DELETE FROM ptec_armto_os WHERE numero_os = OLD.numero_os;
    WHEN 'pel_p_mnt' THEN
      DELETE FROM pel_p_mnt_os WHERE numero_os = OLD.numero_os;
  END CASE;
  
  RETURN OLD;
END;
$function$;