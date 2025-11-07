-- Criar tabela de viaturas
CREATE TABLE public.cia_trp_viaturas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  modelo TEXT NOT NULL,
  eb TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Disponível',
  obs TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de motoristas
CREATE TABLE public.cia_trp_motoristas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  habilitacao TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Disponível',
  obs TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de fichas de saída
CREATE TABLE public.cia_trp_fichas_saida (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_ficha TEXT NOT NULL,
  motorista_id UUID NOT NULL REFERENCES public.cia_trp_motoristas(id) ON DELETE RESTRICT,
  viatura_id UUID NOT NULL REFERENCES public.cia_trp_viaturas(id) ON DELETE RESTRICT,
  horario_saida TIMESTAMP WITH TIME ZONE,
  horario_chegada TIMESTAMP WITH TIME ZONE,
  destino TEXT NOT NULL,
  situacao TEXT NOT NULL DEFAULT 'Em andamento',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_cia_trp_viaturas_status ON public.cia_trp_viaturas(status);
CREATE INDEX idx_cia_trp_motoristas_status ON public.cia_trp_motoristas(status);
CREATE INDEX idx_cia_trp_fichas_saida_situacao ON public.cia_trp_fichas_saida(situacao);

-- Habilitar RLS
ALTER TABLE public.cia_trp_viaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cia_trp_motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cia_trp_fichas_saida ENABLE ROW LEVEL SECURITY;

-- Políticas para viaturas
CREATE POLICY "Admin, col and cia_trp can view viaturas"
ON public.cia_trp_viaturas
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'col'::app_role) OR has_role(auth.uid(), 'cia_trp'::app_role));

CREATE POLICY "Admin, col and cia_trp can insert viaturas"
ON public.cia_trp_viaturas
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'col'::app_role) OR has_role(auth.uid(), 'cia_trp'::app_role));

CREATE POLICY "Admin, col and cia_trp can update viaturas"
ON public.cia_trp_viaturas
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'col'::app_role) OR has_role(auth.uid(), 'cia_trp'::app_role));

CREATE POLICY "Admin, col and cia_trp can delete viaturas"
ON public.cia_trp_viaturas
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'col'::app_role) OR has_role(auth.uid(), 'cia_trp'::app_role));

-- Políticas para motoristas
CREATE POLICY "Admin, col and cia_trp can view motoristas"
ON public.cia_trp_motoristas
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'col'::app_role) OR has_role(auth.uid(), 'cia_trp'::app_role));

CREATE POLICY "Admin, col and cia_trp can insert motoristas"
ON public.cia_trp_motoristas
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'col'::app_role) OR has_role(auth.uid(), 'cia_trp'::app_role));

CREATE POLICY "Admin, col and cia_trp can update motoristas"
ON public.cia_trp_motoristas
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'col'::app_role) OR has_role(auth.uid(), 'cia_trp'::app_role));

CREATE POLICY "Admin, col and cia_trp can delete motoristas"
ON public.cia_trp_motoristas
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'col'::app_role) OR has_role(auth.uid(), 'cia_trp'::app_role));

-- Políticas para fichas de saída
CREATE POLICY "Admin, col and cia_trp can view fichas"
ON public.cia_trp_fichas_saida
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'col'::app_role) OR has_role(auth.uid(), 'cia_trp'::app_role));

CREATE POLICY "Admin, col and cia_trp can insert fichas"
ON public.cia_trp_fichas_saida
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'col'::app_role) OR has_role(auth.uid(), 'cia_trp'::app_role));

CREATE POLICY "Admin, col and cia_trp can update fichas"
ON public.cia_trp_fichas_saida
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'col'::app_role) OR has_role(auth.uid(), 'cia_trp'::app_role));

CREATE POLICY "Admin, col and cia_trp can delete fichas"
ON public.cia_trp_fichas_saida
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'col'::app_role) OR has_role(auth.uid(), 'cia_trp'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_cia_trp_viaturas_updated_at
BEFORE UPDATE ON public.cia_trp_viaturas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cia_trp_motoristas_updated_at
BEFORE UPDATE ON public.cia_trp_motoristas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cia_trp_fichas_saida_updated_at
BEFORE UPDATE ON public.cia_trp_fichas_saida
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.cia_trp_viaturas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cia_trp_motoristas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cia_trp_fichas_saida;