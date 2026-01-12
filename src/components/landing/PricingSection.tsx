import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const PricingSection = () => {
  const essentialFeatures = [
    "Dashboard com KPIs estratégicos",
    "Gestão da Estrutura Mercadológica",
    "Importação de dados via planilha",
    "Relatórios em PDF e Excel",
    "Suporte via e-mail"
  ];

  const proFeatures = [
    { text: "Tudo do Essencial +", bold: false, highlight: false },
    { text: "Alertas Inteligentes (IA)", bold: true, highlight: true },
    { text: "Importação Avançada", bold: true, highlight: true },
    { text: "Benchmarks de Mercado (em breve)", bold: false, highlight: false },
    { text: "Suporte Prioritário via WhatsApp", bold: false, highlight: false }
  ];

  return (
    <section id="precos" className="py-20 bg-card/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Escolha o plano ideal para o seu supermercado
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Planos flexíveis que se adaptam ao porte e necessidades do seu negócio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano Essencial */}
          <Card className="relative hover:shadow-xl transition-all duration-300 hover-scale">
            <CardHeader className="text-center">
              <Badge variant="secondary" className="w-fit mx-auto mb-4">Ideal para organizar</Badge>
              <CardTitle className="text-2xl">Plano Essencial</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">R$ 79,90</span>
                <span className="text-muted-foreground">/loja/mês</span>
              </div>
              <CardDescription>ou R$ 799,00/ano (2 meses grátis)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {essentialFeatures.map((feature) => (
                <div key={feature} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
              <Button className="w-full mt-6" variant="outline" asChild>
                <Link to="/auth">Comece Grátis</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Plano Pro - Destacado */}
          <Card className="relative border-2 border-primary shadow-xl hover:shadow-2xl transition-all duration-300 hover-scale">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-primary to-success text-white px-6 py-2">Mais Completo</Badge>
            </div>
            <CardHeader className="text-center pt-8">
              <Badge variant="secondary" className="w-fit mx-auto mb-4">Ideal para acelerar</Badge>
              <CardTitle className="text-2xl">Plano Pro</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">R$ 149,90</span>
                <span className="text-muted-foreground">/loja/mês</span>
              </div>
              <CardDescription>ou R$ 1.499,00/ano (2 meses grátis)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {proFeatures.map((feature) => (
                <div key={feature.text} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span className={`text-sm ${feature.bold ? 'font-bold' : ''} ${feature.highlight ? 'text-primary' : ''}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
              <Button className="w-full mt-6 bg-gradient-to-r from-primary to-success hover:opacity-90" asChild>
                <Link to="/auth">Comece Grátis</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            🎯 Todos os planos incluem 7 dias grátis e podem ser cancelados a qualquer momento
          </p>
        </div>
      </div>
    </section>
  );
};
