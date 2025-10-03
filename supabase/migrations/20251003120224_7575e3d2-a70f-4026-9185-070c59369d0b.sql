-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'ptec_com', 'ptec_mb', 'ptec_sau', 'ptec_rh', 'ptec_trp');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_guerra TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Trigger for profile updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Table: Ptec Com (Ordem de Serviço)
CREATE TABLE public.ptec_com_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_os TEXT NOT NULL,
  situacao TEXT NOT NULL,
  om_apoiada TEXT NOT NULL,
  marca TEXT,
  mem TEXT,
  sistema TEXT,
  servico_solicitado TEXT,
  servico_realizado TEXT,
  situacao_atual TEXT,
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  observacoes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ptec_com_os ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and ptec_com can view"
  ON public.ptec_com_os FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_com')
  );

CREATE POLICY "Admin and ptec_com can insert"
  ON public.ptec_com_os FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_com')
  );

CREATE POLICY "Admin and ptec_com can update"
  ON public.ptec_com_os FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_com')
  );

CREATE POLICY "Admin and ptec_com can delete"
  ON public.ptec_com_os FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_com')
  );

CREATE TRIGGER update_ptec_com_os_updated_at
  BEFORE UPDATE ON public.ptec_com_os
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Table: Ptec MB (Ordem de Serviço + Combustível)
CREATE TABLE public.ptec_mb_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_os TEXT NOT NULL,
  situacao TEXT NOT NULL,
  om_apoiada TEXT NOT NULL,
  marca TEXT,
  mem TEXT,
  sistema TEXT,
  servico_solicitado TEXT,
  servico_realizado TEXT,
  situacao_atual TEXT,
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  quantidade_classe_iii NUMERIC,
  observacoes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ptec_mb_os ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and ptec_mb can view"
  ON public.ptec_mb_os FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_mb')
  );

CREATE POLICY "Admin and ptec_mb can insert"
  ON public.ptec_mb_os FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_mb')
  );

CREATE POLICY "Admin and ptec_mb can update"
  ON public.ptec_mb_os FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_mb')
  );

CREATE POLICY "Admin and ptec_mb can delete"
  ON public.ptec_mb_os FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_mb')
  );

CREATE TRIGGER update_ptec_mb_os_updated_at
  BEFORE UPDATE ON public.ptec_mb_os
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Table: Ptec Sau (Relatórios de Saúde)
CREATE TABLE public.ptec_sau_relatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  nivel_leve INTEGER DEFAULT 0,
  nivel_moderado INTEGER DEFAULT 0,
  nivel_grave INTEGER DEFAULT 0,
  nivel_obs INTEGER DEFAULT 0,
  cirurgias INTEGER DEFAULT 0,
  obitos INTEGER DEFAULT 0,
  evacuacoes INTEGER DEFAULT 0,
  internados_uti INTEGER DEFAULT 0,
  internados_enfermaria INTEGER DEFAULT 0,
  retorno_combate INTEGER DEFAULT 0,
  observacoes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ptec_sau_relatorios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and ptec_sau can view"
  ON public.ptec_sau_relatorios FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_sau')
  );

CREATE POLICY "Admin and ptec_sau can insert"
  ON public.ptec_sau_relatorios FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_sau')
  );

CREATE POLICY "Admin and ptec_sau can update"
  ON public.ptec_sau_relatorios FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_sau')
  );

CREATE POLICY "Admin and ptec_sau can delete"
  ON public.ptec_sau_relatorios FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_sau')
  );

CREATE TRIGGER update_ptec_sau_relatorios_updated_at
  BEFORE UPDATE ON public.ptec_sau_relatorios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Table: Ptec RH (Ocorrências Mortuárias)
CREATE TABLE public.ptec_rh_ocorrencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  dia_semana TEXT,
  quantidade_corpos INTEGER DEFAULT 0,
  local TEXT,
  gdh TEXT,
  causa_provavel TEXT,
  graduacao TEXT,
  nome_guerra TEXT,
  observacoes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ptec_rh_ocorrencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and ptec_rh can view"
  ON public.ptec_rh_ocorrencias FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_rh')
  );

CREATE POLICY "Admin and ptec_rh can insert"
  ON public.ptec_rh_ocorrencias FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_rh')
  );

CREATE POLICY "Admin and ptec_rh can update"
  ON public.ptec_rh_ocorrencias FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_rh')
  );

CREATE POLICY "Admin and ptec_rh can delete"
  ON public.ptec_rh_ocorrencias FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_rh')
  );

CREATE TRIGGER update_ptec_rh_ocorrencias_updated_at
  BEFORE UPDATE ON public.ptec_rh_ocorrencias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Table: Ptec Trp (Transporte/Suprimento)
CREATE TABLE public.ptec_trp_transportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa_vtr TEXT NOT NULL,
  data_hora_saida TIMESTAMPTZ,
  odometro_saida NUMERIC,
  odometro_retorno NUMERIC,
  data_hora_entrada TIMESTAMPTZ,
  destino TEXT,
  utilizacao TEXT,
  chefe_vtr TEXT,
  motorista TEXT,
  classe_material TEXT,
  quantidade_transportada NUMERIC,
  observacoes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ptec_trp_transportes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and ptec_trp can view"
  ON public.ptec_trp_transportes FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_trp')
  );

CREATE POLICY "Admin and ptec_trp can insert"
  ON public.ptec_trp_transportes FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_trp')
  );

CREATE POLICY "Admin and ptec_trp can update"
  ON public.ptec_trp_transportes FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_trp')
  );

CREATE POLICY "Admin and ptec_trp can delete"
  ON public.ptec_trp_transportes FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ptec_trp')
  );

CREATE TRIGGER update_ptec_trp_transportes_updated_at
  BEFORE UPDATE ON public.ptec_trp_transportes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();