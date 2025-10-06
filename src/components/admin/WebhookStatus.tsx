import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Webhook, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export function WebhookStatus() {
  const [copied, setCopied] = useState(false);
  
  const webhookUrl = 'https://hmqlxknwiszxqvzlisum.supabase.co/functions/v1/stripe-webhook';
  
  const webhookEvents = [
    'checkout.session.completed',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed'
  ];

  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      toast.success('URL copiada!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar URL');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              <CardTitle>Webhook do Stripe</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Configurado
            </Badge>
          </div>
          <CardDescription>
            Configure o webhook no Stripe para sincronização automática de pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Webhook URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Endpoint URL</label>
            <div className="flex gap-2">
              <code className="flex-1 p-3 bg-muted rounded-md text-sm font-mono break-all">
                {webhookUrl}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyWebhookUrl}
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Events to Listen */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Eventos Monitorados</label>
            <div className="flex flex-wrap gap-2">
              {webhookEvents.map((event) => (
                <Badge key={event} variant="secondary" className="font-mono text-xs">
                  {event}
                </Badge>
              ))}
            </div>
          </div>

          {/* Configuration Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p className="font-medium">Como configurar no Stripe Dashboard:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
                <li>Acesse o <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Dashboard → Webhooks</a></li>
                <li>Clique em "Add endpoint"</li>
                <li>Cole a URL do endpoint acima</li>
                <li>Selecione os 5 eventos listados</li>
                <li>Copie o "Webhook signing secret" e adicione aos secrets do Supabase</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open('https://dashboard.stripe.com/webhooks', '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir Stripe Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://supabase.com/dashboard/project/hmqlxknwiszxqvzlisum/settings/functions', '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Secrets do Supabase
            </Button>
          </div>

          {/* Security Note */}
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Importante:</strong> O webhook signing secret (STRIPE_WEBHOOK_SECRET) deve estar configurado nos secrets do Supabase para verificar a autenticidade dos eventos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Webhook Events Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Eventos</CardTitle>
          <CardDescription>
            Eventos sincronizados automaticamente com o Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Checkout Completo</span>
              </div>
              <span className="text-xs text-muted-foreground">Cria assinatura + registra pagamento</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Assinatura Atualizada</span>
              </div>
              <span className="text-xs text-muted-foreground">Sincroniza mudanças de plano</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Assinatura Cancelada</span>
              </div>
              <span className="text-xs text-muted-foreground">Marca status como cancelado</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Pagamento Sucesso</span>
              </div>
              <span className="text-xs text-muted-foreground">Registra no histórico</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Pagamento Falhou</span>
              </div>
              <span className="text-xs text-muted-foreground">Atualiza status para past_due</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}