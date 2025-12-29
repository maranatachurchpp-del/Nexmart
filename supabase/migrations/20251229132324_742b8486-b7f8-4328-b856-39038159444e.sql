-- Adicionar campos de ruptura separados de quebra
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS ruptura_esperada numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS ruptura_atual numeric DEFAULT 0;

-- Atualizar produtos sample com valores de ruptura
UPDATE public.produtos 
SET ruptura_esperada = CASE 
    WHEN codigo = 'PROD001' THEN 1.5
    WHEN codigo = 'PROD002' THEN 2.0
    WHEN codigo = 'PROD003' THEN 1.2
    WHEN codigo = 'PROD004' THEN 3.0
    WHEN codigo = 'PROD005' THEN 2.5
    ELSE 1.5
END,
ruptura_atual = CASE 
    WHEN codigo = 'PROD001' THEN 2.1
    WHEN codigo = 'PROD002' THEN 1.8
    WHEN codigo = 'PROD003' THEN 1.0
    WHEN codigo = 'PROD004' THEN 4.2
    WHEN codigo = 'PROD005' THEN 2.3
    ELSE 2.0
END
WHERE ruptura_esperada = 0 OR ruptura_esperada IS NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_ruptura ON public.produtos(ruptura_atual, ruptura_esperada);
CREATE INDEX IF NOT EXISTS idx_produtos_quebra ON public.produtos(quebra_atual, quebra_esperada);