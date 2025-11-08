-- Remover os triggers que alteravam data/hora dos registros
DROP TRIGGER IF EXISTS update_pm_datetime_trigger ON public.ptec_sau_pms;
DROP FUNCTION IF EXISTS public.update_pm_datetime();

DROP TRIGGER IF EXISTS update_prontuario_date_trigger ON public.ptec_sau_prontuarios;
DROP FUNCTION IF EXISTS public.update_prontuario_date();

-- Garantir que o campo updated_at usa o fuso horário de Brasília
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW() AT TIME ZONE 'America/Sao_Paulo';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar os triggers para updated_at com fuso horário de Brasília
DROP TRIGGER IF EXISTS update_ptec_sau_pms_updated_at ON public.ptec_sau_pms;
CREATE TRIGGER update_ptec_sau_pms_updated_at
  BEFORE UPDATE ON public.ptec_sau_pms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ptec_sau_prontuarios_updated_at ON public.ptec_sau_prontuarios;
CREATE TRIGGER update_ptec_sau_prontuarios_updated_at
  BEFORE UPDATE ON public.ptec_sau_prontuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();