-- Adicionar novos roles ao enum app_role
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ptec_auto';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ptec_blind';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ptec_op';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ptec_armto';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'p_distr';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'oficina_com';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'oficina_auto';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'oficina_blind';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'oficina_op';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'oficina_armto';