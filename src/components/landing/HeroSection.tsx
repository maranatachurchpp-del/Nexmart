import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Zap, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const HeroSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          email: email.trim().toLowerCase(),
          source: 'landing_hero',
          metadata: { page: 'index', timestamp: new Date().toISOString() }
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Email já cadastrado",
            description: "Este email já está em nossa lista. Faça login para acessar.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Sucesso!",
          description: "Você receberá um email com instruções para começar.",
        });
        setEmail("");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="inicio" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-success/10"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-success/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative container mx-auto px-4 text-center">
        <div className="mb-8 animate-fade-in">
          <Badge variant="secondary" className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-primary/20 to-success/20 border border-primary/30">
            <Sparkles className="w-4 h-4 mr-2" />
            Revolucione sua gestão mercadológica
          </Badge>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-8 leading-tight tracking-tight animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Nexmart: O Próximo Nível da<br />
          <span className="bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent">
            Gestão Mercadológica
          </span>
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s' }}>
          Organize sua estrutura, otimize suas margens e impulsione o lucro do seu supermercado<br />
          com <strong className="text-foreground">inteligência e simplicidade</strong>.
        </p>

        {/* CTA Principal */}
        <div className="max-w-lg mx-auto mb-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 mb-8">
            <Input 
              type="email" 
              placeholder="seu-email@supermercado.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="h-14 text-lg bg-card/80 backdrop-blur-sm border-2 border-border focus:border-primary transition-all" 
              required 
              disabled={isSubmitting} 
            />
            <Button type="submit" size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-primary to-success hover:opacity-90 shadow-xl hover-scale" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Experimente Grátis por 7 Dias
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Teste gratuito de 7 dias
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              Sem compromisso
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-success" />
              Configuração rápida
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent mb-2">1000+</div>
            <div className="text-sm text-muted-foreground">Supermercados</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent mb-2">25%</div>
            <div className="text-sm text-muted-foreground">Aumento médio na margem</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent mb-2">4.9★</div>
            <div className="text-sm text-muted-foreground">Avaliação dos clientes</div>
          </div>
        </div>
      </div>
    </section>
  );
};
