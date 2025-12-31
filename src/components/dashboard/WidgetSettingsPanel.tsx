import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LayoutGrid, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { DashboardWidget } from '@/hooks/useDashboardWidgets';

interface WidgetSettingsPanelProps {
  widgets: DashboardWidget[];
  onToggleVisibility: (widgetId: string) => void;
  onReset: () => void;
}

export const WidgetSettingsPanel: React.FC<WidgetSettingsPanelProps> = ({
  widgets,
  onToggleVisibility,
  onReset
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="hover-lift">
          <LayoutGrid className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Widgets</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Configurar Widgets
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Arraste os widgets no dashboard para reordená-los. Use os toggles abaixo para mostrar/ocultar.
          </p>
          
          <div className="space-y-3">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {widget.visible ? (
                    <Eye className="w-4 h-4 text-primary" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Label htmlFor={widget.id} className="cursor-pointer">
                    {widget.title}
                  </Label>
                </div>
                <Switch
                  id={widget.id}
                  checked={widget.visible}
                  onCheckedChange={() => onToggleVisibility(widget.id)}
                />
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={onReset}
              className="w-full gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar Layout Padrão
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
