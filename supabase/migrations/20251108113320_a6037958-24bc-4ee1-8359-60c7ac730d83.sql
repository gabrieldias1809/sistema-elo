-- Criar tabela para registros de salvamento do P Col Slv
CREATE TABLE public.p_col_slv_registros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_registro TEXT NOT NULL,
  situacao_problema TEXT NOT NULL,
  material_empregado TEXT,
  viatura TEXT NOT NULL,
  origem TEXT NOT NULL,
  militares_necessarios TEXT,
  data_hora_inicio TIMESTAMP WITH TIME ZONE,
  data_hora_fim TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.p_col_slv_registros ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admin, col e cia_mnt podem visualizar"
ON public.p_col_slv_registros
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role)
);

CREATE POLICY "Admin, col e cia_mnt podem inserir"
ON public.p_col_slv_registros
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role)
);

CREATE POLICY "Admin, col e cia_mnt podem atualizar"
ON public.p_col_slv_registros
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role)
);

CREATE POLICY "Admin, col e cia_mnt podem deletar"
ON public.p_col_slv_registros
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role)
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_p_col_slv_registros_updated_at
BEFORE UPDATE ON public.p_col_slv_registros
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();