-- Create table for ACISO records
CREATE TABLE public.ptec_rh_aciso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  local TEXT NOT NULL,
  publico_alvo TEXT NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  material_utilizado TEXT,
  interacao_publico TEXT NOT NULL CHECK (interacao_publico IN ('Insatisfeito', 'Normal', 'Satisfeito', 'Muito Satisfeito')),
  observacoes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ptec_rh_aciso ENABLE ROW LEVEL SECURITY;

-- Create policies for ACISO table
CREATE POLICY "Admin and ptec_rh can view ACISO"
ON public.ptec_rh_aciso
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_rh'::app_role));

CREATE POLICY "Admin and ptec_rh can insert ACISO"
ON public.ptec_rh_aciso
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_rh'::app_role));

CREATE POLICY "Admin and ptec_rh can update ACISO"
ON public.ptec_rh_aciso
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_rh'::app_role));

CREATE POLICY "Admin and ptec_rh can delete ACISO"
ON public.ptec_rh_aciso
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_rh'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_ptec_rh_aciso_updated_at
BEFORE UPDATE ON public.ptec_rh_aciso
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();