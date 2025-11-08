-- Criar tabela centralizada de OS da Cia Mnt
CREATE TABLE IF NOT EXISTS public.cia_mnt_os_centralizadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_os TEXT NOT NULL UNIQUE,
  ptec_origem TEXT NOT NULL,
  situacao TEXT NOT NULL,
  om_apoiada TEXT NOT NULL,
  marca TEXT,
  mem TEXT,
  sistema TEXT,
  tipo_manutencao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  servico_solicitado TEXT,
  servico_realizado TEXT,
  situacao_atual TEXT,
  observacoes TEXT,
  quantidade_classe_iii NUMERIC,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.cia_mnt_os_centralizadas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Admin, col e PTECs podem ver
CREATE POLICY "Admin, col and PTECs can view consolidated OS"
ON public.cia_mnt_os_centralizadas
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'col'::app_role) OR
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

-- PTECs podem inserir suas próprias OS
CREATE POLICY "PTECs can insert their OS"
ON public.cia_mnt_os_centralizadas
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'col'::app_role) OR
  (has_role(auth.uid(), 'ptec_com'::app_role) AND ptec_origem = 'com') OR
  (has_role(auth.uid(), 'ptec_auto'::app_role) AND ptec_origem = 'auto') OR
  (has_role(auth.uid(), 'ptec_blind'::app_role) AND ptec_origem = 'blind') OR
  (has_role(auth.uid(), 'ptec_op'::app_role) AND ptec_origem = 'op') OR
  (has_role(auth.uid(), 'ptec_armto'::app_role) AND ptec_origem = 'armto')
);

-- Admin, col, PTECs e oficinas podem atualizar
CREATE POLICY "Admin, col, PTECs and oficinas can update OS"
ON public.cia_mnt_os_centralizadas
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'col'::app_role) OR
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

-- Admin e col podem deletar
CREATE POLICY "Admin and col can delete OS"
ON public.cia_mnt_os_centralizadas
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'col'::app_role)
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_cia_mnt_os_centralizadas_updated_at
BEFORE UPDATE ON public.cia_mnt_os_centralizadas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para obter próximo número de OS centralizado
CREATE OR REPLACE FUNCTION public.get_next_os_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_num INTEGER := 0;
  next_num TEXT;
BEGIN
  -- Buscar o maior número na tabela centralizada
  SELECT COALESCE(MAX(CAST(numero_os AS INTEGER)), 0)
  INTO max_num
  FROM public.cia_mnt_os_centralizadas
  WHERE numero_os ~ '^[0-9]+$';
  
  -- Se ainda for 0, verificar nas tabelas individuais dos PTECs
  IF max_num = 0 THEN
    SELECT GREATEST(
      COALESCE((SELECT MAX(CAST(numero_os AS INTEGER)) FROM public.ptec_com_os WHERE numero_os ~ '^[0-9]+$'), 0),
      COALESCE((SELECT MAX(CAST(numero_os AS INTEGER)) FROM public.ptec_auto_os WHERE numero_os ~ '^[0-9]+$'), 0),
      COALESCE((SELECT MAX(CAST(numero_os AS INTEGER)) FROM public.ptec_blind_os WHERE numero_os ~ '^[0-9]+$'), 0),
      COALESCE((SELECT MAX(CAST(numero_os AS INTEGER)) FROM public.ptec_op_os WHERE numero_os ~ '^[0-9]+$'), 0),
      COALESCE((SELECT MAX(CAST(numero_os AS INTEGER)) FROM public.ptec_armto_os WHERE numero_os ~ '^[0-9]+$'), 0)
    ) INTO max_num;
  END IF;
  
  -- Incrementar e formatar com 3 dígitos
  next_num := LPAD((max_num + 1)::TEXT, 3, '0');
  
  RETURN next_num;
END;
$$;

-- Habilitar realtime para a tabela
ALTER PUBLICATION supabase_realtime ADD TABLE public.cia_mnt_os_centralizadas;