import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
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
            <CardTitle className="text-3xl">Termos de Uso</CardTitle>
            <p className="text-muted-foreground">Última atualização: Janeiro 2026</p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground">
                Ao acessar e usar a plataforma Nexmart, você concorda em cumprir estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground">
                O Nexmart é uma plataforma SaaS de gestão mercadológica para supermercados, oferecendo 
                ferramentas para análise de margens, controle de rupturas, gestão de mix de produtos e 
                relatórios estratégicos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Cadastro e Conta</h2>
              <p className="text-muted-foreground">
                Para utilizar nossos serviços, você deve criar uma conta fornecendo informações precisas 
                e atualizadas. Você é responsável por manter a confidencialidade de sua senha e por todas 
                as atividades que ocorrem em sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Uso Aceitável</h2>
              <p className="text-muted-foreground">
                Você concorda em usar a plataforma apenas para fins legais e de acordo com estes Termos. 
                É proibido usar o serviço para qualquer atividade ilegal, fraudulenta ou prejudicial.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Propriedade Intelectual</h2>
              <p className="text-muted-foreground">
                Todo o conteúdo, design, código e funcionalidades da plataforma são propriedade exclusiva 
                do Nexmart. Você não pode copiar, modificar ou distribuir qualquer parte do serviço sem 
                autorização prévia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Pagamentos e Assinaturas</h2>
              <p className="text-muted-foreground">
                Os planos pagos são cobrados de acordo com o ciclo de faturamento escolhido. 
                Cancelamentos podem ser feitos a qualquer momento, com acesso mantido até o fim do período pago.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground">
                O Nexmart não se responsabiliza por decisões comerciais tomadas com base nas análises 
                fornecidas pela plataforma. O serviço é fornecido "como está", sem garantias expressas ou implícitas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contato</h2>
              <p className="text-muted-foreground">
                Para dúvidas sobre estes Termos, entre em contato através do email: contato@nexmart.com.br
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}