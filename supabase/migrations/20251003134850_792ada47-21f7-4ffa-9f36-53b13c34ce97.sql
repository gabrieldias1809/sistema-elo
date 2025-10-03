-- Drop existing table
DROP TABLE IF EXISTS public.ptec_sau_relatorios;

-- Create new PtecSau table with PMS structure
CREATE TABLE public.ptec_sau_pms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  om_responsavel TEXT NOT NULL,
  numero_pms TEXT NOT NULL,
  atividade TEXT,
  data DATE NOT NULL,
  hora TIME,
  local TEXT,
  fracao TEXT,
  descricao TEXT,
  conduta_esperada TEXT,
  observacoes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ptec_sau_pms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin and ptec_sau can view"
  ON public.ptec_sau_pms
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_sau'::app_role));

CREATE POLICY "Admin and ptec_sau can insert"
  ON public.ptec_sau_pms
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_sau'::app_role));

CREATE POLICY "Admin and ptec_sau can update"
  ON public.ptec_sau_pms
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_sau'::app_role));

CREATE POLICY "Admin and ptec_sau can delete"
  ON public.ptec_sau_pms
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_sau'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_ptec_sau_pms_updated_at
  BEFORE UPDATE ON public.ptec_sau_pms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();