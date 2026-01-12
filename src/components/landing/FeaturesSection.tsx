import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Database, FileText, Upload } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Database,
      title: "Estrutura Padronizada",
      description: "Receba uma base mercadológica completa e otimizada, pronta para implementar no seu supermercado.",
      gradient: "from-primary/20 to-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: BarChart3,
      title: "Dashboard Inteligente",
      description: "Visualize KPIs em tempo real e tome decisões estratégicas baseadas em dados precisos.",
      gradient: "from-success/20 to-success/10",
      iconColor: "text-success"
    },
    {
      icon: FileText,
      title: "Relatórios Estratégicos",
      description: "Gere análises profissionais em segundos com exportação automática em PDF e Excel.",
      gradient: "from-warning/20 to-warning/10",
      iconColor: "text-warning"
    },
    {
      icon: Upload,
      title: "Importação Simplificada",
      description: "Conecte seus dados do ERP ou planilhas de forma rápida e fácil, sem complicações.",
      gradient: "from-purple-500/20 to-purple-500/10",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <section id="solucao" className="py-20 bg-card/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Transforme Dados em Lucro
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            O Nexmart resolve os principais desafios do dia a dia do seu supermercado com uma plataforma 
            inteligente que organiza, analisa e otimiza sua operação mercadológica.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center hover:shadow-xl transition-all duration-300 group hover-scale border-border/50">
              <CardHeader>
                <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                </div>
                <CardTitle className="text-xl mb-3">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
