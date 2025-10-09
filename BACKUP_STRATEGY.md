# 🔐 Estratégia de Backup - Nexmart

## Visão Geral

Este documento descreve a estratégia completa de backup e recuperação de desastres para o sistema Nexmart.

---

## 🗄️ Dados do Supabase

### Backup Automático

O Supabase realiza backups automáticos do banco de dados:

- **Frequência**: Diária
- **Retenção**: 
  - Plano Free: 7 dias
  - Plano Pro: 30 dias
  - Plano Enterprise: Customizável
- **Tipo**: Full backup do PostgreSQL
- **Localização**: Armazenamento distribuído do Supabase

### Backup Manual

Para backups adicionais sob demanda:

```bash
# Via CLI do Supabase
npx supabase db dump -f backup-$(date +%Y%m%d).sql

# Via pg_dump
pg_dump -h db.hmqlxknwiszxqvzlisum.supabase.co \
  -U postgres \
  -d postgres \
  -f backup-$(date +%Y%m%d).sql
```

### Point-in-Time Recovery (PITR)

- **Disponível em**: Plano Pro e Enterprise
- **Janela**: Até 7 dias (Pro) ou customizável (Enterprise)
- **Uso**: Recuperar banco para qualquer ponto específico

---

## 📁 Arquivos e Assets

### Estratégia

1. **Storage Buckets**
   - Backups automáticos pelo Supabase
   - Replicação em múltiplas zonas
   - Versionamento opcional

2. **Assets Estáticos**
   - Versionados no Git
   - Deploy automático mantém histórico
   - Rollback disponível via Git

---

## 🔄 Tipos de Backup

### 1. Backup Completo (Full)
- **O que inclui**: 
  - Banco de dados completo
  - Storage buckets
  - Configurações do sistema
- **Quando**: Semanalmente
- **Retenção**: 4 semanas

### 2. Backup Incremental
- **O que inclui**: Apenas dados modificados
- **Quando**: Diariamente
- **Retenção**: 7 dias

### 3. Backup de Configuração
- **O que inclui**:
  - Edge Functions
  - RLS Policies
  - Database Schema
  - Secrets (referências)
- **Quando**: Após cada alteração
- **Retenção**: Permanente (Git)

---

## 🎯 Procedimentos de Recuperação

### Recuperação de Dados

#### Cenário 1: Perda de Dados Recente (< 24h)
```bash
# 1. Acesse o Painel Supabase
# 2. Vá em Database → Backups
# 3. Selecione o backup mais recente
# 4. Clique em "Restore"
```

#### Cenário 2: Recuperação Pontual (PITR)
```bash
# 1. Acesse Database → Backups
# 2. Selecione "Point in Time Recovery"
# 3. Escolha data/hora específica
# 4. Confirme restauração
```

#### Cenário 3: Recuperação Completa
```bash
# 1. Criar novo projeto Supabase
# 2. Restaurar dump do backup
psql -h new-project.supabase.co \
  -U postgres \
  -d postgres \
  -f backup-YYYYMMDD.sql

# 3. Atualizar configurações do projeto
# 4. Testar funcionalidades críticas
```

### Recuperação de Aplicação

#### Rollback de Deploy
```bash
# Via Git
git revert HEAD
git push origin main

# Via Interface Lovable
# 1. Acesse histórico de versões
# 2. Selecione versão estável anterior
# 3. Clique em "Revert to this version"
```

---

## 📋 Checklist de Backup

### Diário
- [ ] Verificar execução do backup automático
- [ ] Revisar logs de Edge Functions
- [ ] Confirmar sincronização de dados

### Semanal
- [ ] Executar backup completo manual
- [ ] Testar restauração em ambiente de teste
- [ ] Revisar espaço de armazenamento
- [ ] Documentar alterações importantes

### Mensal
- [ ] Auditoria completa de backups
- [ ] Teste de recuperação de desastres
- [ ] Revisão da estratégia de backup
- [ ] Atualização da documentação

---

## 🚨 Plano de Recuperação de Desastres

### RTO (Recovery Time Objective)
- **Crítico**: < 1 hora
- **Alta Prioridade**: < 4 horas
- **Normal**: < 24 horas

### RPO (Recovery Point Objective)
- **Dados Transacionais**: < 1 hora
- **Dados Analíticos**: < 24 horas
- **Configurações**: < 1 semana

### Procedimento de Emergência

1. **Identificação**
   - Detectar e confirmar o problema
   - Avaliar severidade e impacto
   - Notificar stakeholders

2. **Contenção**
   - Isolar sistemas afetados
   - Prevenir propagação do problema
   - Ativar modo de manutenção se necessário

3. **Recuperação**
   - Selecionar backup apropriado
   - Executar procedimento de restauração
   - Validar integridade dos dados

4. **Verificação**
   - Testar funcionalidades críticas
   - Validar dados com usuários
   - Confirmar sistema estável

5. **Post-Mortem**
   - Documentar incidente
   - Analisar causa raiz
   - Implementar melhorias

---

## 🔧 Ferramentas e Scripts

### Script de Backup Manual

```bash
#!/bin/bash
# backup.sh - Script de backup completo

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
PROJECT_ID="hmqlxknwiszxqvzlisum"

mkdir -p $BACKUP_DIR

# Backup do banco de dados
echo "Iniciando backup do banco..."
npx supabase db dump -f "$BACKUP_DIR/db_$DATE.sql"

# Compactar
echo "Compactando backup..."
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" "$BACKUP_DIR/db_$DATE.sql"

# Limpar arquivo SQL
rm "$BACKUP_DIR/db_$DATE.sql"

# Manter apenas últimos 7 backups
ls -t $BACKUP_DIR/backup_*.tar.gz | tail -n +8 | xargs rm -f

echo "Backup concluído: backup_$DATE.tar.gz"
```

### Script de Verificação

```bash
#!/bin/bash
# verify-backup.sh - Verificar integridade dos backups

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Uso: ./verify-backup.sh <arquivo_backup>"
    exit 1
fi

# Verificar compressão
echo "Verificando integridade do arquivo..."
if tar -tzf "$BACKUP_FILE" > /dev/null 2>&1; then
    echo "✓ Arquivo válido"
else
    echo "✗ Arquivo corrompido"
    exit 1
fi

# Verificar conteúdo SQL
echo "Verificando conteúdo SQL..."
tar -xzf "$BACKUP_FILE" -O | head -n 5

echo "Verificação concluída!"
```

---

## 📊 Monitoramento

### Métricas Importantes

- **Tamanho dos Backups**: Monitorar crescimento
- **Tempo de Backup**: Alertar se > 30 minutos
- **Taxa de Sucesso**: Deve ser 100%
- **Espaço Disponível**: Alertar se < 20%

### Alertas Configurados

- Falha em backup automático
- Espaço de armazenamento baixo
- Tempo de backup excedido
- Erro em verificação de integridade

---

## 🔐 Segurança

### Proteção de Backups

- **Criptografia**: Todos backups criptografados em repouso
- **Acesso**: Restrito a admins
- **Transmissão**: Sempre via HTTPS/TLS
- **Secrets**: Nunca incluídos em backups

### Compliance

- LGPD: Dados pessoais protegidos
- Retenção: Conforme políticas de privacidade
- Auditoria: Logs de acesso mantidos
- Exclusão: Procedimento de remoção segura

---

## 📞 Contatos de Emergência

### Time de Operações
- **Email**: ops@nexmart.com
- **Telefone**: (11) 99999-9999
- **Slack**: #emergencias

### Suporte Supabase
- **Dashboard**: https://supabase.com/dashboard
- **Docs**: https://supabase.com/docs
- **Support**: https://supabase.com/support

---

## 📝 Registro de Backups

Manter log de:
- Data e hora do backup
- Tipo (completo/incremental)
- Tamanho do arquivo
- Status (sucesso/falha)
- Responsável
- Observações

---

## 🔄 Revisão e Atualização

Este documento deve ser revisado:
- **Trimestral**: Revisão de procedimentos
- **Anual**: Atualização completa
- **Ad-hoc**: Após incidentes ou mudanças

**Última revisão**: Janeiro 2025
**Próxima revisão**: Abril 2025
**Responsável**: Equipe de Operações

---

**Lembre-se**: Um backup não testado não é um backup! 🎯
