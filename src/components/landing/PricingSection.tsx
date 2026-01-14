import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Zap, Shield, Brain, HeadphonesIcon, FileSpreadsheet, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

interface FeatureRow {
  name: string;
  icon: React.ReactNode;
  essential: boolean | string;
  pro: boolean | string;
  highlight?: boolean;
}

export const PricingSection = () => {
  const features: FeatureRow[] = [
    { 
      name: "Dashboard com KPIs estratégicos", 
      icon: <BarChart3 className="h-4 w-4" />,
      essential: true, 
      pro: true 
    },
    { 
      name: "Gestão da Estrutura Mercadológica", 
      icon: <FileSpreadsheet className="h-4 w-4" />,
      essential: true, 
      pro: true 
    },
    { 
      name: "Importação de dados via planilha", 
      icon: <FileSpreadsheet className="h-4 w-4" />,
      essential: true, 
      pro: true 
    },
    { 
      name: "Relatórios em PDF e Excel", 
      icon: <FileSpreadsheet className="h-4 w-4" />,
      essential: true, 
      pro: true 
    },
    { 
      name: "Alertas Inteligentes com IA", 
      icon: <Brain className="h-4 w-4" />,
      essential: false, 
      pro: true,
      highlight: true 
    },
    { 
      name: "Importação Avançada (mapeamento automático)", 
      icon: <Zap className="h-4 w-4" />,
      essential: false, 
      pro: true,
      highlight: true 
    },
    { 
      name: "Benchmarks de Mercado", 
      icon: <BarChart3 className="h-4 w-4" />,
      essential: false, 
      pro: "Em breve" 
    },
    { 
      name: "Suporte", 
      icon: <HeadphonesIcon className="h-4 w-4" />,
      essential: "E-mail", 
      pro: "WhatsApp Prioritário" 
    },
  ];

  const renderValue = (value: boolean | string, isHighlight?: boolean) => {
    if (typeof value === 'string') {
      return <span className={`text-sm font-medium ${isHighlight ? 'text-primary' : 'text-foreground'}`}>{value}</span>;
    }
    if (value) {
      return <CheckCircle className="h-5 w-5 text-success mx-auto" />;
    }
    return <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />;
  };

  return (
    <section id="precos" className="py-20 bg-card/20">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Planos Transparentes
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Escolha o plano ideal para o seu supermercado
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Compare lado a lado e descubra qual plano atende melhor às suas necessidades.
            </p>
          </div>
        </ScrollReveal>

        {/* Comparison Table */}
        <ScrollReveal delay={0.2}>
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden border-2 border-border/50">
              {/* Header */}
              <div className="grid grid-cols-3 border-b border-border">
                <div className="p-6 bg-muted/30">
                  <span className="font-semibold text-muted-foreground">Recursos</span>
                </div>
                <div className="p-6 text-center border-x border-border bg-card">
                  <Badge variant="secondary" className="mb-3">Ideal para organizar</Badge>
                  <h3 className="text-xl font-bold text-foreground mb-2">Essencial</h3>
                  <div className="mb-1">
                    <span className="text-3xl font-bold text-foreground">R$ 79,90</span>
                    <span className="text-muted-foreground text-sm">/loja/mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground">ou R$ 799/ano (2 meses grátis)</p>
                </div>
                <div className="p-6 text-center bg-gradient-to-b from-primary/10 to-success/10 relative">
                  <div className="absolute -top-0 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-success text-white px-4 py-1 rounded-t-none">
                      Mais Popular
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="mb-3 mt-4">Ideal para acelerar</Badge>
                  <h3 className="text-xl font-bold text-foreground mb-2">Pro</h3>
                  <div className="mb-1">
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">R$ 149,90</span>
                    <span className="text-muted-foreground text-sm">/loja/mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground">ou R$ 1.499/ano (2 meses grátis)</p>
                </div>
              </div>

              {/* Features Rows */}
              <div className="divide-y divide-border">
                {features.map((feature, index) => (
                  <div 
                    key={feature.name} 
                    className={`grid grid-cols-3 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'} ${feature.highlight ? 'bg-primary/5' : ''}`}
                  >
                    <div className="p-4 flex items-center gap-3">
                      <span className="text-muted-foreground">{feature.icon}</span>
                      <span className={`text-sm ${feature.highlight ? 'font-semibold text-primary' : 'text-foreground'}`}>
                        {feature.name}
                      </span>
                    </div>
                    <div className="p-4 text-center border-x border-border flex items-center justify-center">
                      {renderValue(feature.essential)}
                    </div>
                    <div className="p-4 text-center flex items-center justify-center bg-gradient-to-r from-transparent via-primary/5 to-transparent">
                      {renderValue(feature.pro, feature.highlight)}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Row */}
              <div className="grid grid-cols-3 border-t border-border bg-muted/30">
                <div className="p-6"></div>
                <div className="p-6 text-center border-x border-border">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth">Comece Grátis</Link>
                  </Button>
                </div>
                <div className="p-6 text-center bg-gradient-to-b from-primary/5 to-success/5">
                  <Button className="w-full bg-gradient-to-r from-primary to-success hover:opacity-90 shadow-lg" asChild>
                    <Link to="/auth">
                      <Zap className="w-4 h-4 mr-2" />
                      Comece Grátis
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Trust Badges */}
        <ScrollReveal delay={0.4}>
          <div className="text-center mt-12 space-y-4">
            <p className="text-muted-foreground">
              🎯 Todos os planos incluem <strong className="text-foreground">7 dias grátis</strong> e podem ser cancelados a qualquer momento
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                Sem cartão de crédito
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Cancelamento fácil
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-success" />
                Ativação imediata
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
