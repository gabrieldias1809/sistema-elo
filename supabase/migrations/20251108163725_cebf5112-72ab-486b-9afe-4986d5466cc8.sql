-- Remover os triggers automáticos de updated_at das tabelas de PM e prontuários
-- para que possamos controlar manualmente via código
DROP TRIGGER IF EXISTS update_ptec_sau_pms_updated_at ON public.ptec_sau_pms;
DROP TRIGGER IF EXISTS update_ptec_sau_prontuarios_updated_at ON public.ptec_sau_prontuarios;