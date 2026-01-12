import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface CompanyTabProps {
  companyName: string;
  setCompanyName: (name: string) => void;
  annualRevenue: string;
  setAnnualRevenue: (revenue: string) => void;
  storeCount: string;
  setStoreCount: (count: string) => void;
  focusAreas: string[];
  toggleFocusArea: (area: string) => void;
  experienceLevel: string;
  setExperienceLevel: (level: string) => void;
  mainObjective: string;
  setMainObjective: (objective: string) => void;
  savingCompany: boolean;
  onUpdateCompany: () => void;
}

export const CompanyTab = ({
  companyName,
  setCompanyName,
  annualRevenue,
  setAnnualRevenue,
  storeCount,
  setStoreCount,
  focusAreas,
  toggleFocusArea,
  experienceLevel,
  setExperienceLevel,
  mainObjective,
  setMainObjective,
  savingCompany,
  onUpdateCompany
}: CompanyTabProps) => {
  const focusAreaOptions = ['Precificação', 'Ruptura', 'Margem', 'Competitividade'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
          <CardDescription>
            Informações sobre seu supermercado e operação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nome do Supermercado</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nome da sua empresa"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Faturamento Anual</Label>
              <Select value={annualRevenue} onValueChange={setAnnualRevenue}>
                <SelectTrigger id="revenue">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-10M">Até R$ 10 milhões</SelectItem>
                  <SelectItem value="10-50M">R$ 10 - 50 milhões</SelectItem>
                  <SelectItem value="50-100M">R$ 50 - 100 milhões</SelectItem>
                  <SelectItem value="100M+">Acima de R$ 100 milhões</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stores">Número de Lojas</Label>
              <Select value={storeCount} onValueChange={setStoreCount}>
                <SelectTrigger id="stores">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 loja</SelectItem>
                  <SelectItem value="2-5">2-5 lojas</SelectItem>
                  <SelectItem value="6-10">6-10 lojas</SelectItem>
                  <SelectItem value="10+">Mais de 10 lojas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Áreas de Foco</Label>
            <div className="space-y-2">
              {focusAreaOptions.map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={area}
                    checked={focusAreas.includes(area)}
                    onCheckedChange={() => toggleFocusArea(area)}
                  />
                  <Label htmlFor={area} className="font-normal cursor-pointer">
                    {area}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Nível de Experiência</Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger id="experience">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective">Objetivo Principal</Label>
            <Select value={mainObjective} onValueChange={setMainObjective}>
              <SelectTrigger id="objective">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase-margin">Aumentar margem</SelectItem>
                <SelectItem value="reduce-rupture">Reduzir ruptura</SelectItem>
                <SelectItem value="optimize-pricing">Otimizar precificação</SelectItem>
                <SelectItem value="competitive-analysis">Análise competitiva</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onUpdateCompany} disabled={savingCompany}>
            {savingCompany ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
