import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimation";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Aumentei minha margem em 22% nos primeiros 3 meses. O Nexmart me mostrou onde eu estava perdendo dinheiro sem perceber.",
      name: "Maria Silva",
      company: "Supermercado Família, SP",
      initials: "MS"
    },
    {
      quote: "Nunca tive tanta clareza sobre meu estoque. Os relatórios são perfeitos para apresentar aos fornecedores.",
      name: "João Santos",
      company: "Mercado Central, RJ",
      initials: "JS"
    },
    {
      quote: "Economizo 5 horas por semana em análises. Agora posso focar no que realmente importa: atender meus clientes.",
      name: "Ana Lima",
      company: "Supermercado Bom Preço, MG",
      initials: "AL"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              O que nossos clientes dizem
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Resultados reais de supermercados que transformaram sua gestão com o Nexmart.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal
          containerClassName="grid md:grid-cols-3 gap-8"
          staggerDelay={0.15}
        >
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="hover:shadow-xl transition-all duration-300 hover-scale">
              <CardHeader>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-muted-foreground mb-4" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </StaggeredReveal>
      </div>
    </section>
  );
};
