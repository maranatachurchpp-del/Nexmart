import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GlassCard } from "@/components/ui/glass-card";

interface HeatmapRow {
  row: string;
  columns: { column: string; value: number }[];
}

interface HeatmapChartProps {
  data: HeatmapRow[];
  title?: string;
  colorScale?: "success" | "warning" | "destructive" | "primary";
  className?: string;
  onCellClick?: (row: string, column: string, value: number) => void;
}

export function HeatmapChart({
  data,
  title,
  colorScale = "primary",
  className,
  onCellClick,
}: HeatmapChartProps) {
  // Get all column names from first row
  const columns = data[0]?.columns.map(c => c.column) || [];
  
  // Get all values to calculate range
  const allValues = data.flatMap(row => row.columns.map(col => col.value));
  const maxValue = Math.max(...allValues, 1);
  const minValue = Math.min(...allValues, 0);

  const getColor = (value: number) => {
    const normalized = maxValue === minValue ? 0.5 : (value - minValue) / (maxValue - minValue);

    const colorScales = {
      primary: {
        low: "hsl(var(--primary) / 0.1)",
        mid: "hsl(var(--primary) / 0.5)",
        high: "hsl(var(--primary) / 1)",
      },
      success: {
        low: "hsl(var(--success) / 0.1)",
        mid: "hsl(var(--success) / 0.5)",
        high: "hsl(var(--success) / 1)",
      },
      warning: {
        low: "hsl(var(--warning) / 0.1)",
        mid: "hsl(var(--warning) / 0.5)",
        high: "hsl(var(--warning) / 1)",
      },
      destructive: {
        low: "hsl(var(--destructive) / 0.1)",
        mid: "hsl(var(--destructive) / 0.5)",
        high: "hsl(var(--destructive) / 1)",
      },
    };

    const scale = colorScales[colorScale];

    if (normalized < 0.33) return scale.low;
    if (normalized < 0.66) return scale.mid;
    return scale.high;
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <GlassCard className={cn("p-4 w-full", className)}>
      {title && (
        <h3 className="text-sm font-medium text-foreground mb-4">
          {title}
        </h3>
      )}

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Column headers */}
          <div className="flex ml-24 mb-2">
            {columns.map((col) => (
              <div
                key={col}
                className="flex-1 text-xs text-muted-foreground text-center min-w-[50px] truncate px-1 font-medium"
                title={col}
              >
                {col}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {data.map((row) => (
            <div key={row.row} className="flex items-center mb-1">
              {/* Row label */}
              <div
                className="w-24 text-xs text-muted-foreground truncate pr-2 text-right font-medium"
                title={row.row}
              >
                {row.row}
              </div>

              {/* Cells */}
              <div className="flex flex-1 gap-1">
                {row.columns.map((cell) => (
                  <TooltipProvider key={`${row.row}-${cell.column}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            "flex-1 min-w-[50px] h-10 rounded-md transition-all duration-200",
                            "hover:scale-105 hover:ring-2 hover:ring-primary/50",
                            "focus:outline-none focus:ring-2 focus:ring-primary"
                          )}
                          style={{ backgroundColor: getColor(cell.value) }}
                          onClick={() => onCellClick?.(row.row, cell.column, cell.value)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-medium">{row.row}</p>
                          <p className="text-muted-foreground">{cell.column}</p>
                          <p className="font-bold mt-1">{cell.value.toFixed(1)}%</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-xs text-muted-foreground">Baixo</span>
        <div className="flex gap-0.5">
          <div
            className="w-6 h-3 rounded"
            style={{ backgroundColor: getColor(minValue) }}
          />
          <div
            className="w-6 h-3 rounded"
            style={{
              backgroundColor: getColor((maxValue + minValue) / 2),
            }}
          />
          <div
            className="w-6 h-3 rounded"
            style={{ backgroundColor: getColor(maxValue) }}
          />
        </div>
        <span className="text-xs text-muted-foreground">Alto</span>
      </div>
    </GlassCard>
  );
}
