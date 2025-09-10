import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardMacro } from "@/components/DashboardMacro";
import { DashboardMicro } from "@/components/DashboardMicro";
import { BarChart3, Package, Building2, Eye } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Sistema Mercadológico</h1>
                  <p className="text-sm text-muted-foreground">Gestão e Dashboard Automatizado</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Supermercado Exemplo - R$ 3.2M/ano</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="macro" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="macro" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Visão Estratégica (Macro)
              </TabsTrigger>
              <TabsTrigger value="micro" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Visão Operacional (Micro)
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="macro" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground mb-2">Dashboard Estratégico</h2>
              <p className="text-muted-foreground">
                Visão consolidada por departamentos e categorias, com análise de margens e participação no faturamento.
              </p>
            </div>
            <DashboardMacro />
          </TabsContent>

          <TabsContent value="micro" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground mb-2">Dashboard Operacional</h2>
              <p className="text-muted-foreground">
                Análise detalhada por produto com alertas visuais e indicadores de performance.
              </p>
            </div>
            <DashboardMicro />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-16">
        <div className="container mx-auto px-6 py-4 text-center text-sm text-muted-foreground">
          Sistema de Gestão Mercadológica • Desenvolvido para supermercados até R$ 4M de faturamento anual
        </div>
      </footer>
    </div>
  );
};

export default Index;
