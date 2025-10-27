-- Add oficina_op and oficina_armto roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'oficina_op';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'oficina_armto';