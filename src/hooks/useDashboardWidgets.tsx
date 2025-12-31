import { useState, useEffect, useCallback } from 'react';

export interface DashboardWidget {
  id: string;
  type: 'kpis' | 'gauges' | 'sparklines' | 'heatmap' | 'revenue-margin' | 'timeseries' | 'realtime' | 'smart-alerts' | 'activity-alerts' | 'data-table';
  title: string;
  visible: boolean;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'kpis', type: 'kpis', title: 'KPIs Principais', visible: true },
  { id: 'gauges', type: 'gauges', title: 'Medidores', visible: true },
  { id: 'sparklines', type: 'sparklines', title: 'Tendências', visible: true },
  { id: 'heatmap', type: 'heatmap', title: 'Heatmap', visible: true },
  { id: 'revenue-margin', type: 'revenue-margin', title: 'Faturamento e Margem', visible: true },
  { id: 'timeseries', type: 'timeseries', title: 'Série Temporal', visible: true },
  { id: 'realtime', type: 'realtime', title: 'Métricas Realtime', visible: true },
  { id: 'smart-alerts', type: 'smart-alerts', title: 'Alertas Inteligentes', visible: true },
  { id: 'activity-alerts', type: 'activity-alerts', title: 'Atividade e Alertas', visible: true },
  { id: 'data-table', type: 'data-table', title: 'Tabela de Dados', visible: true },
];

const STORAGE_KEY = 'dashboard-widgets-order';

export const useDashboardWidgets = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new widgets
        const storedIds = new Set(parsed.map((w: DashboardWidget) => w.id));
        const newWidgets = DEFAULT_WIDGETS.filter(w => !storedIds.has(w.id));
        return [...parsed, ...newWidgets];
      }
    } catch (e) {
      console.error('Failed to parse stored widgets:', e);
    }
    return DEFAULT_WIDGETS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  }, [widgets]);

  const reorderWidgets = useCallback((startIndex: number, endIndex: number) => {
    setWidgets(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setWidgets(prev => 
      prev.map(w => w.id === widgetId ? { ...w, visible: !w.visible } : w)
    );
  }, []);

  const resetToDefault = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    widgets,
    reorderWidgets,
    toggleWidgetVisibility,
    resetToDefault
  };
};
