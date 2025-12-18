-- =====================================================
-- FASE 3: FUNCIONALIDADES AVANÇADAS
-- =====================================================

-- 1. SISTEMA DE PERMISSÕES AVANÇADAS
-- Tabela para permissões granulares baseadas em features
CREATE TABLE IF NOT EXISTS public.feature_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role public.app_role NOT NULL,
    feature TEXT NOT NULL,
    can_read BOOLEAN DEFAULT false,
    can_write BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_export BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(role, feature)
);

ALTER TABLE public.feature_permissions ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem gerenciar permissões
CREATE POLICY "Admins can manage feature_permissions"
ON public.feature_permissions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Usuários podem ver suas próprias permissões
CREATE POLICY "Users can view their permissions"
ON public.feature_permissions
FOR SELECT
USING (
    role IN (SELECT role FROM public.user_roles WHERE user_id = auth.uid())
);

-- Inserir permissões padrão
INSERT INTO public.feature_permissions (role, feature, can_read, can_write, can_delete, can_export) VALUES
-- Admin tem acesso total
('admin', 'dashboard', true, true, true, true),
('admin', 'products', true, true, true, true),
('admin', 'reports', true, true, true, true),
('admin', 'structure', true, true, true, true),
('admin', 'users', true, true, true, true),
('admin', 'settings', true, true, true, true),
-- User tem acesso limitado
('user', 'dashboard', true, true, false, true),
('user', 'products', true, true, false, true),
('user', 'reports', true, false, false, true),
('user', 'structure', true, false, false, false),
('user', 'settings', true, true, false, false),
-- Moderator tem acesso intermediário
('moderator', 'dashboard', true, true, false, true),
('moderator', 'products', true, true, true, true),
('moderator', 'reports', true, true, false, true),
('moderator', 'structure', true, true, false, true),
('moderator', 'settings', true, true, false, false)
ON CONFLICT (role, feature) DO NOTHING;

-- Função para verificar permissão de feature
CREATE OR REPLACE FUNCTION public.check_feature_permission(
    _user_id UUID,
    _feature TEXT,
    _permission TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.feature_permissions fp
        INNER JOIN public.user_roles ur ON ur.role = fp.role
        WHERE ur.user_id = _user_id
          AND fp.feature = _feature
          AND (
              (_permission = 'read' AND fp.can_read = true) OR
              (_permission = 'write' AND fp.can_write = true) OR
              (_permission = 'delete' AND fp.can_delete = true) OR
              (_permission = 'export' AND fp.can_export = true)
          )
    )
$$;

-- 2. SISTEMA DE NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- info, warning, error, success
    category TEXT DEFAULT 'system', -- system, product, alert, subscription
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas suas notificações
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Usuários podem atualizar (marcar como lida) suas notificações
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar suas notificações
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Sistema pode inserir notificações (via service role)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Admins podem ver todas as notificações
CREATE POLICY "Admins can view all notifications"
ON public.notifications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Habilitar realtime para notificações
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 3. SISTEMA DE AUDITORIA E LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL, -- create, update, delete, login, logout, export, import
    entity_type TEXT NOT NULL, -- product, user, subscription, settings, etc.
    entity_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios logs
CREATE POLICY "Users can view own audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Admins podem ver todos os logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Apenas o sistema pode inserir logs (via service role ou trigger)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- Função para criar log de auditoria
CREATE OR REPLACE FUNCTION public.create_audit_log(
    _user_id UUID,
    _action TEXT,
    _entity_type TEXT,
    _entity_id TEXT DEFAULT NULL,
    _old_values JSONB DEFAULT NULL,
    _new_values JSONB DEFAULT NULL,
    _metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _log_id UUID;
    _user_email TEXT;
BEGIN
    -- Buscar email do usuário
    SELECT email INTO _user_email FROM auth.users WHERE id = _user_id;
    
    INSERT INTO public.audit_logs (
        user_id, user_email, action, entity_type, entity_id, 
        old_values, new_values, metadata
    ) VALUES (
        _user_id, _user_email, _action, _entity_type, _entity_id,
        _old_values, _new_values, _metadata
    )
    RETURNING id INTO _log_id;
    
    RETURN _log_id;
END;
$$;

-- Trigger para auditoria automática de produtos
CREATE OR REPLACE FUNCTION public.audit_produtos_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.create_audit_log(
            NEW.user_id,
            'create',
            'product',
            NEW.id::TEXT,
            NULL,
            to_jsonb(NEW),
            '{"triggered_by": "database"}'::JSONB
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM public.create_audit_log(
            NEW.user_id,
            'update',
            'product',
            NEW.id::TEXT,
            to_jsonb(OLD),
            to_jsonb(NEW),
            '{"triggered_by": "database"}'::JSONB
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.create_audit_log(
            OLD.user_id,
            'delete',
            'product',
            OLD.id::TEXT,
            to_jsonb(OLD),
            NULL,
            '{"triggered_by": "database"}'::JSONB
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Criar trigger de auditoria para produtos
DROP TRIGGER IF EXISTS audit_produtos_trigger ON public.produtos;
CREATE TRIGGER audit_produtos_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.produtos
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_produtos_changes();

-- Função para criar notificação automática de alerta
CREATE OR REPLACE FUNCTION public.create_product_alert_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Alerta para margem baixa
    IF NEW.status = 'destructive' AND (OLD IS NULL OR OLD.status != 'destructive') THEN
        INSERT INTO public.notifications (user_id, title, message, type, category, action_url, metadata)
        VALUES (
            NEW.user_id,
            'Alerta: Produto com Status Crítico',
            'O produto ' || NEW.descricao || ' (' || NEW.codigo || ') está com status crítico e requer atenção.',
            'warning',
            'product',
            '/dashboard',
            jsonb_build_object('product_id', NEW.id, 'product_code', NEW.codigo)
        );
    END IF;
    
    -- Alerta para quebra alta
    IF COALESCE(NEW.quebra_atual, 0) > COALESCE(NEW.quebra_esperada, 0) + 2 THEN
        IF OLD IS NULL OR COALESCE(OLD.quebra_atual, 0) <= COALESCE(OLD.quebra_esperada, 0) + 2 THEN
            INSERT INTO public.notifications (user_id, title, message, type, category, action_url, metadata)
            VALUES (
                NEW.user_id,
                'Alerta: Quebra Acima do Esperado',
                'O produto ' || NEW.descricao || ' tem quebra de ' || ROUND(NEW.quebra_atual::numeric, 1) || '%, acima do esperado (' || ROUND(NEW.quebra_esperada::numeric, 1) || '%).',
                'warning',
                'alert',
                '/dashboard',
                jsonb_build_object('product_id', NEW.id, 'quebra_atual', NEW.quebra_atual, 'quebra_esperada', NEW.quebra_esperada)
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Criar trigger para notificações automáticas
DROP TRIGGER IF EXISTS product_alert_notification_trigger ON public.produtos;
CREATE TRIGGER product_alert_notification_trigger
    AFTER INSERT OR UPDATE ON public.produtos
    FOR EACH ROW
    EXECUTE FUNCTION public.create_product_alert_notification();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_permissions_role ON public.feature_permissions(role);