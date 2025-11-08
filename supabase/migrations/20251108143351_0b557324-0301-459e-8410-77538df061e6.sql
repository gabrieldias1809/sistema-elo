-- Create Pel P Mnt OS table (unified Auto and Blind)
CREATE TABLE public.pel_p_mnt_os (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_os TEXT NOT NULL,
  situacao TEXT NOT NULL,
  om_apoiada TEXT NOT NULL,
  marca TEXT,
  mem TEXT,
  sistema TEXT,
  tipo_viatura TEXT NOT NULL,
  registro_material TEXT,
  servico_solicitado TEXT,
  servico_realizado TEXT,
  situacao_atual TEXT,
  observacoes TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  quantidade_classe_iii NUMERIC,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pel_p_mnt_os ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin, col, cia_mnt and pel_p_mnt can insert"
ON public.pel_p_mnt_os
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_mnt'::app_role) OR
  has_role(auth.uid(), 'oficina_auto'::app_role) OR
  has_role(auth.uid(), 'oficina_blind'::app_role)
);

CREATE POLICY "Admin, col, pel_p_mnt can view"
ON public.pel_p_mnt_os
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'oficina_auto'::app_role) OR
  has_role(auth.uid(), 'oficina_blind'::app_role)
);

CREATE POLICY "Admin, col, pel_p_mnt can update"
ON public.pel_p_mnt_os
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'oficina_auto'::app_role) OR
  has_role(auth.uid(), 'oficina_blind'::app_role)
);

CREATE POLICY "Admin and col can delete"
ON public.pel_p_mnt_os
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role)
);

-- Create trigger for updated_at
CREATE TRIGGER update_pel_p_mnt_os_updated_at
BEFORE UPDATE ON public.pel_p_mnt_os
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();