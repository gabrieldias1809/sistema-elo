-- Add tipo_pm column to ptec_sau_pms table
ALTER TABLE public.ptec_sau_pms 
ADD COLUMN IF NOT EXISTS tipo_pm text NOT NULL DEFAULT 'PMS'
CHECK (tipo_pm IN ('PMS', 'PMR'));