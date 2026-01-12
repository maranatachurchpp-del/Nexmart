import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary via-success to-primary">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Pronto para revolucionar seu supermercado?
          </h2>
          <p className="text-lg md:text-xl mb-12 opacity-90">
            Junte-se a mais de 1000 supermercados que já transformaram sua gestão com o Nexmart. 
            Comece seu teste gratuito hoje mesmo!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <Button size="lg" className="h-14 px-8 bg-white text-primary hover:bg-white/90 text-lg font-semibold hover-scale" asChild>
              <Link to="/auth">
                Experimente Grátis por 7 Dias
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-75">
            Sem cartão de crédito • Cancelamento gratuito • Suporte incluído
          </p>
        </div>
      </div>
    </section>
  );
};
