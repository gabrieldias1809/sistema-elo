-- Adicionar campo tipo_pedido para diferenciar pedidos de suprimento e complementares
ALTER TABLE ptec_pedidos_material 
ADD COLUMN tipo_pedido text NOT NULL DEFAULT 'suprimento' CHECK (tipo_pedido IN ('suprimento', 'complementar'));

-- Modificar ptec_op_os para ter apenas os campos necessários
ALTER TABLE ptec_op_os
ADD COLUMN tipo_pms text,
ADD COLUMN descricao_problema text,
ADD COLUMN ptec_origem text NOT NULL DEFAULT 'op';

-- Remover campos não necessários de ptec_op_os
ALTER TABLE ptec_op_os
DROP COLUMN IF EXISTS sistema,
DROP COLUMN IF EXISTS mem,
DROP COLUMN IF EXISTS marca,
DROP COLUMN IF EXISTS servico_solicitado,
DROP COLUMN IF EXISTS servico_realizado,
DROP COLUMN IF EXISTS situacao_atual,
DROP COLUMN IF EXISTS observacoes,
DROP COLUMN IF EXISTS quantidade_classe_iii;

-- Remover campo marca de ptec_armto_os
ALTER TABLE ptec_armto_os
DROP COLUMN IF EXISTS marca;