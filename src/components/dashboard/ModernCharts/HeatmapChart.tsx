import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapData {
  x: string;
  y: string;
  value: number;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  xLabels: string[];
  yLabels: string[];
  title?: string;
  colorScale?: "success" | "warning" | "destructive" | "primary";
  className?: string;
  onCellClick?: (data: HeatmapData) => void;
}

export function HeatmapChart({
  data,
  xLabels,
  yLabels,
  title,
  colorScale = "primary",
  className,
  onCellClick,
}: HeatmapChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));

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

  const getValue = (x: string, y: string) => {
    const cell = data.find((d) => d.x === x && d.y === y);
    return cell?.value ?? 0;
  };

  return (
    <div className={cn("w-full", className)}>
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {title}
        </h3>
      )}

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* X-axis labels */}
          <div className="flex ml-20 mb-1">
            {xLabels.map((label) => (
              <div
                key={label}
                className="flex-1 text-xs text-muted-foreground text-center min-w-[40px] truncate px-0.5"
                title={label}
              >
                {label.substring(0, 3)}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {yLabels.map((yLabel) => (
            <div key={yLabel} className="flex items-center mb-1">
              {/* Y-axis label */}
              <div
                className="w-20 text-xs text-muted-foreground truncate pr-2 text-right"
                title={yLabel}
              >
                {yLabel}
              </div>

              {/* Cells */}
              <div className="flex flex-1 gap-0.5">
                {xLabels.map((xLabel) => {
                  const value = getValue(xLabel, yLabel);
                  const cellData = { x: xLabel, y: yLabel, value };

                  return (
                    <TooltipProvider key={`${xLabel}-${yLabel}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              "flex-1 min-w-[40px] h-8 rounded transition-all duration-200",
                              "hover:scale-105 hover:ring-2 hover:ring-primary/50",
                              "focus:outline-none focus:ring-2 focus:ring-primary"
                            )}
                            style={{ backgroundColor: getColor(value) }}
                            onClick={() => onCellClick?.(cellData)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <p className="font-medium">{yLabel}</p>
                            <p className="text-muted-foreground">{xLabel}</p>
                            <p className="font-bold mt-1">{value.toFixed(1)}%</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
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
    </div>
  );
}
