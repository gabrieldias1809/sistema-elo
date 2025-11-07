-- Adicionar novos campos à tabela col_pedidos_sup
ALTER TABLE col_pedidos_sup
ADD COLUMN data_hora_necessidade timestamp with time zone,
ADD COLUMN coordenada text,
ADD COLUMN distancia numeric;

-- Adicionar campo chefe_viatura à tabela cia_sup_pedidos_transporte
ALTER TABLE cia_sup_pedidos_transporte
ADD COLUMN chefe_viatura text;

-- Criar comentários explicativos
COMMENT ON COLUMN col_pedidos_sup.data_hora_necessidade IS 'Data e hora até quando o material deve chegar ao destino';
COMMENT ON COLUMN col_pedidos_sup.coordenada IS 'Coordenada do destino (latitude/longitude ou coordenada militar)';
COMMENT ON COLUMN col_pedidos_sup.distancia IS 'Distância da origem ao destino em km';
COMMENT ON COLUMN cia_sup_pedidos_transporte.chefe_viatura IS 'Nome do chefe de viatura responsável pelo transporte';