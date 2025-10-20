-- Criar tabelas para os novos Ptecs
CREATE TABLE IF NOT EXISTS public.ptec_auto_os (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_os text NOT NULL,
  om_apoiada text NOT NULL,
  sistema text,
  mem text,
  marca text,
  situacao text NOT NULL,
  servico_solicitado text,
  servico_realizado text,
  situacao_atual text,
  data_inicio timestamp with time zone,
  data_fim timestamp with time zone,
  quantidade_classe_iii numeric,
  observacoes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ptec_blind_os (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_os text NOT NULL,
  om_apoiada text NOT NULL,
  sistema text,
  mem text,
  marca text,
  situacao text NOT NULL,
  servico_solicitado text,
  servico_realizado text,
  situacao_atual text,
  data_inicio timestamp with time zone,
  data_fim timestamp with time zone,
  quantidade_classe_iii numeric,
  observacoes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ptec_op_os (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_os text NOT NULL,
  om_apoiada text NOT NULL,
  sistema text,
  mem text,
  marca text,
  situacao text NOT NULL,
  servico_solicitado text,
  servico_realizado text,
  situacao_atual text,
  data_inicio timestamp with time zone,
  data_fim timestamp with time zone,
  quantidade_classe_iii numeric,
  observacoes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ptec_armto_os (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_os text NOT NULL,
  om_apoiada text NOT NULL,
  sistema text,
  mem text,
  marca text,
  situacao text NOT NULL,
  servico_solicitado text,
  servico_realizado text,
  situacao_atual text,
  data_inicio timestamp with time zone,
  data_fim timestamp with time zone,
  quantidade_classe_iii numeric,
  observacoes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de pedidos de material
CREATE TABLE IF NOT EXISTS public.ptec_pedidos_material (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id uuid NOT NULL,
  ptec_origem text NOT NULL,
  oficina_destino text NOT NULL,
  material text NOT NULL,
  quantidade numeric NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'Solicitado',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.ptec_auto_os ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ptec_blind_os ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ptec_op_os ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ptec_armto_os ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ptec_pedidos_material ENABLE ROW LEVEL SECURITY;

-- Triggers para updated_at
CREATE TRIGGER update_ptec_auto_os_updated_at
BEFORE UPDATE ON public.ptec_auto_os
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ptec_blind_os_updated_at
BEFORE UPDATE ON public.ptec_blind_os
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ptec_op_os_updated_at
BEFORE UPDATE ON public.ptec_op_os
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ptec_armto_os_updated_at
BEFORE UPDATE ON public.ptec_armto_os
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ptec_pedidos_material_updated_at
BEFORE UPDATE ON public.ptec_pedidos_material
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();