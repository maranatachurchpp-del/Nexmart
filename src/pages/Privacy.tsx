import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Política de Privacidade</CardTitle>
            <p className="text-muted-foreground">Última atualização: Janeiro 2026</p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Informações Coletadas</h2>
              <p className="text-muted-foreground">
                Coletamos informações que você nos fornece diretamente, como nome, email, dados da empresa 
                e informações de pagamento. Também coletamos dados de uso da plataforma para melhorar 
                nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Uso das Informações</h2>
              <p className="text-muted-foreground">
                Utilizamos suas informações para: fornecer e manter o serviço, processar pagamentos, 
                enviar comunicações importantes, personalizar sua experiência e melhorar a plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground">
                Não vendemos suas informações pessoais. Compartilhamos dados apenas com prestadores de 
                serviço essenciais (como processadores de pagamento) e quando exigido por lei.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Segurança dos Dados</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações 
                contra acesso não autorizado, alteração ou destruição. Utilizamos criptografia e 
                armazenamento seguro em servidores protegidos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground">
                Conforme a Lei Geral de Proteção de Dados, você tem direito a: acessar seus dados, 
                corrigir informações incorretas, solicitar exclusão, portabilidade e revogar consentimento 
                a qualquer momento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cookies e Tecnologias</h2>
              <p className="text-muted-foreground">
                Utilizamos cookies e tecnologias semelhantes para melhorar a funcionalidade da plataforma, 
                analisar o uso e personalizar conteúdo. Você pode controlar as preferências de cookies 
                através do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Retenção de Dados</h2>
              <p className="text-muted-foreground">
                Mantemos suas informações enquanto sua conta estiver ativa ou conforme necessário para 
                fornecer serviços. Após encerramento da conta, dados podem ser retidos por período 
                limitado para fins legais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contato do DPO</h2>
              <p className="text-muted-foreground">
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato 
                com nosso Encarregado de Proteção de Dados: privacidade@nexmart.com.br
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}