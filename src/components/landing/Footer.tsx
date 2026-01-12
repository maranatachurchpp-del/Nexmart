import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-success rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                Nexmart
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              A plataforma de gestão mercadológica que leva supermercados para o próximo nível. 
              Transforme dados em lucro com inteligência e simplicidade.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors">
                <span className="text-sm font-bold">f</span>
              </div>
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors">
                <span className="text-sm font-bold">in</span>
              </div>
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors">
                <span className="text-sm font-bold">ig</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Produto</h4>
            <ul className="space-y-3">
              <li><a href="#solucao" className="text-muted-foreground hover:text-primary transition-colors">Funcionalidades</a></li>
              <li><a href="#precos" className="text-muted-foreground hover:text-primary transition-colors">Preços</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Integrações</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Atualizações</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Termos de Uso</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">LGPD</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2025 Nexmart. Todos os direitos reservados.
          </p>
          <p className="text-muted-foreground text-sm mt-2 md:mt-0">
            Desenvolvido com ❤️ para supermercados brasileiros
          </p>
        </div>
      </div>
    </footer>
  );
};
