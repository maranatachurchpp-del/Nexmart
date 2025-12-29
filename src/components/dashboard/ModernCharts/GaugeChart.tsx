import React from "react";
import { cn } from "@/lib/utils";

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  label: string;
  unit?: string;
  thresholds?: {
    warning: number;
    danger: number;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  label,
  unit = "%",
  thresholds = { warning: 70, danger: 90 },
  size = "md",
  className,
}: GaugeChartProps) {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const rotation = (percentage / 100) * 180 - 90;

  const sizeClasses = {
    sm: { container: "w-32 h-20", value: "text-lg", label: "text-xs" },
    md: { container: "w-48 h-28", value: "text-2xl", label: "text-sm" },
    lg: { container: "w-64 h-36", value: "text-3xl", label: "text-base" },
  };

  const getColor = () => {
    if (percentage >= thresholds.danger) return "hsl(var(--destructive))";
    if (percentage >= thresholds.warning) return "hsl(var(--warning))";
    return "hsl(var(--success))";
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn("relative overflow-hidden", sizeClasses[size].container)}>
        {/* Gauge background */}
        <div
          className="absolute inset-0 rounded-t-full border-8 border-muted"
          style={{
            clipPath: "polygon(0 100%, 100% 100%, 100% 0, 0 0)",
          }}
        />

        {/* Colored arc segments */}
        <svg
          viewBox="0 0 200 100"
          className="absolute inset-0 w-full h-full"
          style={{ overflow: "visible" }}
        >
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            strokeWidth="16"
            stroke="hsl(var(--muted))"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            strokeWidth="16"
            stroke={getColor()}
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51} 251`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000 ease-out"
          style={{
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            width: "4px",
            height: size === "lg" ? "70%" : size === "md" ? "65%" : "60%",
          }}
        >
          <div className="w-full h-full bg-foreground rounded-full shadow-lg" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rounded-full" />
        </div>
      </div>

      {/* Value display */}
      <div className="mt-2 text-center">
        <span className={cn("font-bold text-foreground", sizeClasses[size].value)}>
          {value.toFixed(1)}
          <span className="text-muted-foreground font-normal ml-1">{unit}</span>
        </span>
        <p className={cn("text-muted-foreground", sizeClasses[size].label)}>{label}</p>
      </div>
    </div>
  );
}
