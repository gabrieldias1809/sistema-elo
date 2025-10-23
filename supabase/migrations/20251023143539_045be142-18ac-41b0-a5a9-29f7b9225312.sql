-- Add oficina roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'oficina_com';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'oficina_auto';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'oficina_blind';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'oficina_op';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'oficina_armto';