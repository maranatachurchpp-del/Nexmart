-- Corrigir última função com search_path

CREATE OR REPLACE FUNCTION public.create_sample_produtos(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.produtos (
    user_id, codigo, descricao, departamento, categoria, subcategoria,
    quebra_esperada, quebra_atual, margem_a_min, margem_a_max,
    marcas_min, marcas_max, marcas_atuais, giro_ideal_mes,
    participacao_faturamento, preco_medio_min, preco_medio_max,
    classificacao_kvi, status
  ) VALUES
    (target_user_id, 'PROD001', 'Arroz Tipo 1 5kg', 'Alimentos', 'Grãos e Cereais', 'Arroz', 2.5, 3.2, 15.0, 20.0, 5, 8, 6, 50, 12.5, 15.00, 25.00, 'Alta', 'warning'),
    (target_user_id, 'PROD002', 'Feijão Preto 1kg', 'Alimentos', 'Grãos e Cereais', 'Feijão', 1.8, 1.5, 18.0, 25.0, 4, 7, 5, 45, 8.3, 5.00, 10.00, 'Alta', 'success'),
    (target_user_id, 'PROD003', 'Açúcar Cristal 5kg', 'Alimentos', 'Açúcar e Adoçantes', 'Açúcar', 3.0, 2.8, 12.0, 18.0, 3, 6, 4, 60, 10.2, 10.00, 18.00, 'Média', 'success'),
    (target_user_id, 'PROD004', 'Café Torrado 500g', 'Bebidas', 'Café', 'Café Tradicional', 2.2, 4.5, 25.0, 35.0, 6, 10, 8, 40, 15.7, 12.00, 30.00, 'Alta', 'destructive'),
    (target_user_id, 'PROD005', 'Leite Integral 1L', 'Laticínios', 'Leite', 'Leite Integral', 4.0, 3.8, 8.0, 15.0, 5, 8, 6, 80, 18.4, 3.50, 6.00, 'Média', 'success');
END;
$$;