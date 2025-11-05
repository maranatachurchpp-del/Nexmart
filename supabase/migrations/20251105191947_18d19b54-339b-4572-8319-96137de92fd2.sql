-- ============================================
-- FASE 1: INFRAESTRUTURA DE DADOS - PRODUTOS
-- ============================================

-- 1.1 Criar ENUMs para classificação e status
CREATE TYPE public.classificacao_kvi AS ENUM ('Alta', 'Média', 'Baixa');
CREATE TYPE public.status_produto AS ENUM ('success', 'warning', 'destructive');

-- 1.2 Criar tabela de produtos
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identificação do produto
  codigo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  
  -- Hierarquia mercadológica
  departamento TEXT NOT NULL,
  categoria TEXT NOT NULL,
  subcategoria TEXT NOT NULL,
  
  -- Métricas de quebra
  quebra_esperada NUMERIC(10, 2) DEFAULT 0,
  quebra_atual NUMERIC(10, 2) DEFAULT 0,
  
  -- Margens
  margem_a_min NUMERIC(10, 2) DEFAULT 0,
  margem_a_max NUMERIC(10, 2) DEFAULT 0,
  
  -- Marcas
  marcas_min INTEGER DEFAULT 0,
  marcas_max INTEGER DEFAULT 0,
  marcas_atuais INTEGER DEFAULT 0,
  
  -- Giro e participação
  giro_ideal_mes INTEGER DEFAULT 0,
  participacao_faturamento NUMERIC(10, 2) DEFAULT 0,
  
  -- Preços
  preco_medio_min NUMERIC(10, 2) DEFAULT 0,
  preco_medio_max NUMERIC(10, 2) DEFAULT 0,
  
  -- Classificação e status
  classificacao_kvi classificacao_kvi DEFAULT 'Média',
  status status_produto DEFAULT 'success',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: código único por usuário
  UNIQUE(user_id, codigo)
);

-- 1.3 Criar índices para performance
CREATE INDEX idx_produtos_user_id ON public.produtos(user_id);
CREATE INDEX idx_produtos_departamento ON public.produtos(departamento);
CREATE INDEX idx_produtos_categoria ON public.produtos(categoria);
CREATE INDEX idx_produtos_status ON public.produtos(status);
CREATE INDEX idx_produtos_codigo ON public.produtos(codigo);

-- 1.4 Habilitar RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- 1.5 Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_produtos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_produtos_updated_at();

-- 1.6 RLS Policies

-- Usuários podem ver seus próprios produtos
CREATE POLICY "Users can view own products"
  ON public.produtos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios produtos
CREATE POLICY "Users can insert own products"
  ON public.produtos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios produtos
CREATE POLICY "Users can update own products"
  ON public.produtos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar seus próprios produtos
CREATE POLICY "Users can delete own products"
  ON public.produtos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins podem ver todos os produtos
CREATE POLICY "Admins can view all products"
  ON public.produtos
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem atualizar todos os produtos
CREATE POLICY "Admins can update all products"
  ON public.produtos
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem deletar todos os produtos
CREATE POLICY "Admins can delete all products"
  ON public.produtos
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 1.7 Função para popular produtos de amostra para novos usuários
CREATE OR REPLACE FUNCTION public.create_sample_produtos(target_user_id UUID)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;