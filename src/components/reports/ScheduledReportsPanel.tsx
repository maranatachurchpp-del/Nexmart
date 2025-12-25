import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Mail, 
  Plus, 
  Trash2, 
  Edit,
  Play,
  Pause,
  RefreshCw,
  History
} from 'lucide-react';
import { useScheduledReports, ScheduledReport } from '@/hooks/useScheduledReports';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const frequencyLabels: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal'
};

const reportTypeLabels: Record<string, string> = {
  pdf: 'PDF',
  excel: 'Excel',
  both: 'Ambos'
};

const dayOfWeekLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface ReportFormData {
  name: string;
  report_type: 'pdf' | 'excel' | 'both';
  frequency: 'daily' | 'weekly' | 'monthly';
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string;
  recipients: string[];
  is_active: boolean;
}

const initialFormData: ReportFormData = {
  name: '',
  report_type: 'pdf',
  frequency: 'weekly',
  day_of_week: 1,
  day_of_month: 1,
  time_of_day: '08:00',
  recipients: [],
  is_active: true
};

export const ScheduledReportsPanel = () => {
  const { 
    reports, 
    history, 
    loading, 
    saving,
    createReport, 
    updateReport, 
    deleteReport,
    toggleActive,
    refreshReports,
    refreshHistory
  } = useScheduledReports();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
  const [formData, setFormData] = useState<ReportFormData>(initialFormData);
  const [recipientInput, setRecipientInput] = useState('');

  const handleOpenCreate = () => {
    setEditingReport(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (report: ScheduledReport) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      report_type: report.report_type,
      frequency: report.frequency,
      day_of_week: report.day_of_week,
      day_of_month: report.day_of_month,
      time_of_day: report.time_of_day,
      recipients: report.recipients,
      is_active: report.is_active
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || formData.recipients.length === 0) return;

    if (editingReport) {
      await updateReport(editingReport.id, {
        ...formData,
        filters: {}
      });
    } else {
      await createReport({
        ...formData,
        filters: {}
      });
    }
    setDialogOpen(false);
  };

  const handleAddRecipient = () => {
    if (recipientInput && recipientInput.includes('@')) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, recipientInput]
      }));
      setRecipientInput('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Relatórios Agendados</CardTitle>
                <CardDescription>
                  Configure envio automático de relatórios por email
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshReports}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { refreshHistory(); setHistoryDialogOpen(true); }}
              >
                <History className="h-4 w-4 mr-2" />
                Histórico
              </Button>
              <Button size="sm" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground font-medium">Nenhum relatório agendado</p>
              <p className="text-sm text-muted-foreground">
                Crie um agendamento para receber relatórios automaticamente
              </p>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Agendamento
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Próxima Execução</TableHead>
                  <TableHead>Destinatários</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <FileText className="h-3 w-3 mr-1" />
                        {reportTypeLabels[report.report_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {frequencyLabels[report.frequency]}
                      {report.frequency === 'weekly' && report.day_of_week !== null && (
                        <span className="text-muted-foreground text-sm ml-1">
                          ({dayOfWeekLabels[report.day_of_week]})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {report.next_run_at ? (
                        <span className="text-sm">
                          {format(new Date(report.next_run_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{report.recipients.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.is_active ? 'default' : 'secondary'}>
                        {report.is_active ? 'Ativo' : 'Pausado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleActive(report.id)}
                          disabled={saving}
                        >
                          {report.is_active ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenEdit(report)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteReport(report.id)}
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingReport ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
            <DialogDescription>
              Configure o envio automático de relatórios
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Agendamento</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Relatório Semanal de Vendas"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Relatório</Label>
                <Select 
                  value={formData.report_type} 
                  onValueChange={(value: 'pdf' | 'excel' | 'both') => 
                    setFormData(prev => ({ ...prev, report_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select 
                  value={formData.frequency} 
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                    setFormData(prev => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Dia da Semana</Label>
                <Select 
                  value={String(formData.day_of_week ?? 1)} 
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, day_of_week: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOfWeekLabels.map((day, index) => (
                      <SelectItem key={index} value={String(index)}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.frequency === 'monthly' && (
              <div className="space-y-2">
                <Label>Dia do Mês</Label>
                <Select 
                  value={String(formData.day_of_month ?? 1)} 
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, day_of_month: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>Dia {day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time_of_day}
                  onChange={(e) => setFormData(prev => ({ ...prev, time_of_day: e.target.value }))}
                  className="w-32"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Destinatários</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  placeholder="email@exemplo.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRecipient()}
                />
                <Button type="button" variant="outline" onClick={handleAddRecipient}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.recipients.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <button 
                        type="button"
                        onClick={() => handleRemoveRecipient(email)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Ativo</Label>
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving || !formData.name || formData.recipients.length === 0}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Histórico de Execuções</DialogTitle>
            <DialogDescription>
              Veja o histórico de envio dos relatórios agendados
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma execução registrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm">
                        {format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.report_type.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.status === 'completed' ? 'default' : 
                            item.status === 'failed' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {item.status === 'completed' ? 'Concluído' :
                           item.status === 'failed' ? 'Falhou' :
                           item.status === 'processing' ? 'Processando' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.error_message || 
                         (item.recipients_notified ? `${item.recipients_notified.length} notificados` : '-')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
