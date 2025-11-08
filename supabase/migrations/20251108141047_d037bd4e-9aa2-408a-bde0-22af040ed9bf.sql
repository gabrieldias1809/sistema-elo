-- Function to sync OS updates from centralized table to PTEC tables
CREATE OR REPLACE FUNCTION sync_os_update_to_ptec()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the corresponding PTEC table based on ptec_origem
  CASE NEW.ptec_origem
    WHEN 'com' THEN
      UPDATE ptec_com_os
      SET
        numero_os = NEW.numero_os,
        situacao = NEW.situacao,
        om_apoiada = NEW.om_apoiada,
        marca = NEW.marca,
        mem = NEW.mem,
        sistema = NEW.sistema,
        servico_solicitado = NEW.servico_solicitado,
        servico_realizado = NEW.servico_realizado,
        situacao_atual = NEW.situacao_atual,
        observacoes = NEW.observacoes,
        data_inicio = NEW.data_inicio,
        data_fim = NEW.data_fim,
        updated_at = NEW.updated_at
      WHERE numero_os = NEW.numero_os;
      
    WHEN 'auto' THEN
      UPDATE ptec_auto_os
      SET
        numero_os = NEW.numero_os,
        situacao = NEW.situacao,
        om_apoiada = NEW.om_apoiada,
        marca = NEW.marca,
        mem = NEW.mem,
        sistema = NEW.sistema,
        servico_solicitado = NEW.servico_solicitado,
        servico_realizado = NEW.servico_realizado,
        situacao_atual = NEW.situacao_atual,
        observacoes = NEW.observacoes,
        data_inicio = NEW.data_inicio,
        data_fim = NEW.data_fim,
        quantidade_classe_iii = NEW.quantidade_classe_iii,
        updated_at = NEW.updated_at
      WHERE numero_os = NEW.numero_os;
      
    WHEN 'blind' THEN
      UPDATE ptec_blind_os
      SET
        numero_os = NEW.numero_os,
        situacao = NEW.situacao,
        om_apoiada = NEW.om_apoiada,
        marca = NEW.marca,
        mem = NEW.mem,
        sistema = NEW.sistema,
        servico_solicitado = NEW.servico_solicitado,
        servico_realizado = NEW.servico_realizado,
        situacao_atual = NEW.situacao_atual,
        observacoes = NEW.observacoes,
        data_inicio = NEW.data_inicio,
        data_fim = NEW.data_fim,
        quantidade_classe_iii = NEW.quantidade_classe_iii,
        updated_at = NEW.updated_at
      WHERE numero_os = NEW.numero_os;
      
    WHEN 'op' THEN
      UPDATE ptec_op_os
      SET
        numero_os = NEW.numero_os,
        situacao = NEW.situacao,
        om_apoiada = NEW.om_apoiada,
        data_inicio = NEW.data_inicio,
        data_fim = NEW.data_fim,
        updated_at = NEW.updated_at
      WHERE numero_os = NEW.numero_os;
      
    WHEN 'armto' THEN
      UPDATE ptec_armto_os
      SET
        numero_os = NEW.numero_os,
        situacao = NEW.situacao,
        om_apoiada = NEW.om_apoiada,
        mem = NEW.mem,
        sistema = NEW.sistema,
        servico_solicitado = NEW.servico_solicitado,
        servico_realizado = NEW.servico_realizado,
        situacao_atual = NEW.situacao_atual,
        observacoes = NEW.observacoes,
        data_inicio = NEW.data_inicio,
        data_fim = NEW.data_fim,
        quantidade_classe_iii = NEW.quantidade_classe_iii,
        registro_material = NEW.mem,
        updated_at = NEW.updated_at
      WHERE numero_os = NEW.numero_os;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync OS deletions from centralized table to PTEC tables
CREATE OR REPLACE FUNCTION sync_os_delete_to_ptec()
RETURNS TRIGGER AS $$
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
  END CASE;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updates
CREATE TRIGGER sync_os_update_trigger
AFTER UPDATE ON cia_mnt_os_centralizadas
FOR EACH ROW
EXECUTE FUNCTION sync_os_update_to_ptec();

-- Create trigger for deletions
CREATE TRIGGER sync_os_delete_trigger
BEFORE DELETE ON cia_mnt_os_centralizadas
FOR EACH ROW
EXECUTE FUNCTION sync_os_delete_to_ptec();