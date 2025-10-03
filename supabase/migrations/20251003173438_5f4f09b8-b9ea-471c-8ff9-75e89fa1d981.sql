-- Create table for military medical records (prontuários)
CREATE TABLE public.ptec_sau_prontuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  idade INTEGER NOT NULL,
  nivel_gravidade TEXT NOT NULL CHECK (nivel_gravidade IN ('leve', 'moderado', 'grave')),
  situacao_atual TEXT NOT NULL CHECK (situacao_atual IN ('cirurgia', 'óbito', 'evacuação', 'CTI', 'enfermaria', 'retorno ao combate')),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ptec_sau_prontuarios ENABLE ROW LEVEL SECURITY;

-- Create policies for ptec_sau_prontuarios
CREATE POLICY "Admin and ptec_sau can view"
ON public.ptec_sau_prontuarios
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_sau'::app_role));

CREATE POLICY "Admin and ptec_sau can insert"
ON public.ptec_sau_prontuarios
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_sau'::app_role));

CREATE POLICY "Admin and ptec_sau can update"
ON public.ptec_sau_prontuarios
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_sau'::app_role));

CREATE POLICY "Admin and ptec_sau can delete"
ON public.ptec_sau_prontuarios
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ptec_sau'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ptec_sau_prontuarios_updated_at
BEFORE UPDATE ON public.ptec_sau_prontuarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();