-- Criar trigger para atualizar data e hora dos PMs ao atualizar
CREATE OR REPLACE FUNCTION public.update_pm_datetime()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar para o horário atual de Brasília
  NEW.data = CURRENT_DATE AT TIME ZONE 'America/Sao_Paulo';
  NEW.hora = (CURRENT_TIME AT TIME ZONE 'America/Sao_Paulo')::time;
  NEW.updated_at = NOW() AT TIME ZONE 'America/Sao_Paulo';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela de PMs
DROP TRIGGER IF EXISTS update_pm_datetime_trigger ON public.ptec_sau_pms;
CREATE TRIGGER update_pm_datetime_trigger
  BEFORE UPDATE ON public.ptec_sau_pms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pm_datetime();

-- Criar trigger para atualizar data dos prontuários ao atualizar
CREATE OR REPLACE FUNCTION public.update_prontuario_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar para a data atual de Brasília
  NEW.data = CURRENT_DATE AT TIME ZONE 'America/Sao_Paulo';
  NEW.updated_at = NOW() AT TIME ZONE 'America/Sao_Paulo';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela de prontuários
DROP TRIGGER IF EXISTS update_prontuario_date_trigger ON public.ptec_sau_prontuarios;
CREATE TRIGGER update_prontuario_date_trigger
  BEFORE UPDATE ON public.ptec_sau_prontuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_prontuario_date();