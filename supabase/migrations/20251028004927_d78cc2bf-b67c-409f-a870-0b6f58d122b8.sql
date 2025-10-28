-- Tabela de pedidos de suprimento do COL
CREATE TABLE public.col_pedidos_sup (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_pedido SERIAL NOT NULL,
  materiais JSONB NOT NULL,
  destino TEXT NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  situacao TEXT NOT NULL DEFAULT 'Solicitado',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de pedidos de transporte da Cia Sup
CREATE TABLE public.cia_sup_pedidos_transporte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_pedido SERIAL NOT NULL,
  pedido_material_id UUID REFERENCES public.col_pedidos_sup(id) ON DELETE CASCADE NOT NULL,
  destino TEXT NOT NULL,
  observacoes TEXT,
  situacao TEXT NOT NULL DEFAULT 'Pendente',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.col_pedidos_sup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cia_sup_pedidos_transporte ENABLE ROW LEVEL SECURITY;

-- RLS Policies para col_pedidos_sup
CREATE POLICY "Admin, col and cia_sup can view"
ON public.col_pedidos_sup
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role) OR 
  has_role(auth.uid(), 'cia_sup'::app_role) OR
  created_by = auth.uid()
);

CREATE POLICY "Admin and col can insert"
ON public.col_pedidos_sup
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'col'::app_role)
);

CREATE POLICY "Admin, cia_sup and creator can update"
ON public.col_pedidos_sup
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'cia_sup'::app_role) OR
  created_by = auth.uid()
);

CREATE POLICY "Admin and creator can delete"
ON public.col_pedidos_sup
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  created_by = auth.uid()
);

-- RLS Policies para cia_sup_pedidos_transporte
CREATE POLICY "Admin, cia_sup and cia_trp can view"
ON public.cia_sup_pedidos_transporte
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'cia_sup'::app_role) OR 
  has_role(auth.uid(), 'cia_trp'::app_role)
);

CREATE POLICY "Admin and cia_sup can insert"
ON public.cia_sup_pedidos_transporte
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'cia_sup'::app_role)
);

CREATE POLICY "Admin, cia_sup and cia_trp can update"
ON public.cia_sup_pedidos_transporte
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'cia_sup'::app_role) OR 
  has_role(auth.uid(), 'cia_trp'::app_role)
);

CREATE POLICY "Admin and cia_sup can delete"
ON public.cia_sup_pedidos_transporte
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'cia_sup'::app_role)
);

-- Triggers para updated_at
CREATE TRIGGER update_col_pedidos_sup_updated_at
BEFORE UPDATE ON public.col_pedidos_sup
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cia_sup_pedidos_transporte_updated_at
BEFORE UPDATE ON public.cia_sup_pedidos_transporte
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.col_pedidos_sup;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cia_sup_pedidos_transporte;