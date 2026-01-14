import { DollarSign, Shield, Brain, Clock, Users, TrendingUp } from "lucide-react";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimation";

export const BenefitsSection = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: "Aumento de Lucratividade",
      description: "Otimize margens e mix de produtos com análises precisas e recomendações inteligentes.",
      gradient: "from-success/20 to-success/10",
      iconColor: "text-success"
    },
    {
      icon: Shield,
      title: "Redução de Perdas",
      description: "Identifique rupturas e quebras rapidamente com alertas automáticos e dashboards visuais.",
      gradient: "from-primary/20 to-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Brain,
      title: "Decisões Baseadas em Dados",
      description: "Saia do \"achismo\" com informações precisas e análises fundamentadas em inteligência artificial.",
      gradient: "from-warning/20 to-warning/10",
      iconColor: "text-warning"
    },
    {
      icon: Clock,
      title: "Economia de Tempo",
      description: "Automatize análises e relatórios que antes levavam horas para serem feitos manualmente.",
      gradient: "from-purple-500/20 to-purple-500/10",
      iconColor: "text-purple-500"
    },
    {
      icon: Users,
      title: "Fácil de Usar",
      description: "Interface intuitiva e amigável, sem necessidade de treinamento complexo ou conhecimento técnico.",
      gradient: "from-blue-500/20 to-blue-500/10",
      iconColor: "text-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Escalável",
      description: "Cresça com o Nexmart, adaptando-se às necessidades do seu negócio conforme ele evolui.",
      gradient: "from-green-500/20 to-green-500/10",
      iconColor: "text-green-500"
    }
  ];

  return (
    <section id="beneficios" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Por que o Nexmart é ideal para o seu negócio?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Descubra os benefícios exclusivos que fazem do Nexmart a escolha certa para supermercados que querem crescer.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal
          containerClassName="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          staggerDelay={0.1}
        >
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex items-start space-x-4 p-6 rounded-xl bg-card/40 hover:bg-card/60 transition-all duration-300 hover-scale">
              <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center`}>
                <benefit.icon className={`h-6 w-6 ${benefit.iconColor}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </StaggeredReveal>
      </div>
    </section>
  );
};
