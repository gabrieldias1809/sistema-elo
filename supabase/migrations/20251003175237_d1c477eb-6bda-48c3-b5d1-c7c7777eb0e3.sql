-- Rename column gdh to hora in ptec_rh_ocorrencias
ALTER TABLE public.ptec_rh_ocorrencias 
RENAME COLUMN gdh TO hora;

-- Drop column dia_semana from ptec_rh_ocorrencias
ALTER TABLE public.ptec_rh_ocorrencias 
DROP COLUMN dia_semana;

-- Change data column to timestamp to match ptec_com pattern
ALTER TABLE public.ptec_rh_ocorrencias 
ALTER COLUMN data TYPE timestamp with time zone USING data::timestamp with time zone;