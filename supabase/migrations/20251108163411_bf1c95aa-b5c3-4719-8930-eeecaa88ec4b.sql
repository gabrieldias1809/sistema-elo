-- Corrigir a função de trigger para usar corretamente o fuso horário de Brasília
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Usar timezone() para converter corretamente para o horário de Brasília
  NEW.updated_at = timezone('America/Sao_Paulo', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;