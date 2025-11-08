-- Atualizar a função de trigger para usar o fuso horário de Brasília
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW() AT TIME ZONE 'America/Sao_Paulo';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Garantir que os triggers existam para as tabelas ptec_sau_pms e ptec_sau_prontuarios
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