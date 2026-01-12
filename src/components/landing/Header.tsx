import { Button } from "@/components/ui/button";
import { TrendingUp, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-success rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              Nexmart
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className="text-muted-foreground hover:text-primary transition-colors font-medium">Home</a>
            <a href="#solucao" className="text-muted-foreground hover:text-primary transition-colors font-medium">Solução</a>
            <a href="#beneficios" className="text-muted-foreground hover:text-primary transition-colors font-medium">Benefícios</a>
            <a href="#precos" className="text-muted-foreground hover:text-primary transition-colors font-medium">Preços</a>
            <Button variant="outline" size="sm" asChild className="hover-scale">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-success hover:opacity-90 shadow-lg" asChild>
              <Link to="/auth">Experimente Grátis</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <a href="#inicio" className="text-muted-foreground hover:text-primary transition-colors font-medium">Home</a>
              <a href="#solucao" className="text-muted-foreground hover:text-primary transition-colors font-medium">Solução</a>
              <a href="#beneficios" className="text-muted-foreground hover:text-primary transition-colors font-medium">Benefícios</a>
              <a href="#precos" className="text-muted-foreground hover:text-primary transition-colors font-medium">Preços</a>
              <div className="flex flex-col space-y-2">
                <Button variant="outline" size="sm" className="w-fit" asChild>
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button size="sm" className="w-fit bg-gradient-to-r from-primary to-success hover:opacity-90" asChild>
                  <Link to="/auth">Experimente Grátis</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
