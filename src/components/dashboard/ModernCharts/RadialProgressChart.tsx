import React from "react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface RadialProgressChartProps {
  value: number;
  target: number;
  label: string;
  sublabel?: string;
  color?: "primary" | "success" | "warning" | "destructive";
  size?: "sm" | "md" | "lg";
  showTarget?: boolean;
  className?: string;
}

export function RadialProgressChart({
  value,
  target,
  label,
  sublabel,
  color = "primary",
  size = "md",
  showTarget = true,
  className,
}: RadialProgressChartProps) {
  const percentage = Math.min((value / target) * 100, 100);
  const isOverTarget = value > target;

  const sizes = {
    sm: { svg: 100, stroke: 8, text: "text-xl", label: "text-xs" },
    md: { svg: 140, stroke: 12, text: "text-3xl", label: "text-sm" },
    lg: { svg: 180, stroke: 14, text: "text-4xl", label: "text-base" },
  };

  const { svg, stroke, text, label: labelSize } = sizes[size];
  const radius = (svg - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    primary: {
      stroke: "stroke-primary",
      bg: "stroke-primary/20",
      glow: "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]",
    },
    success: {
      stroke: "stroke-success",
      bg: "stroke-success/20",
      glow: "drop-shadow-[0_0_8px_hsl(var(--success)/0.5)]",
    },
    warning: {
      stroke: "stroke-warning",
      bg: "stroke-warning/20",
      glow: "drop-shadow-[0_0_8px_hsl(var(--warning)/0.5)]",
    },
    destructive: {
      stroke: "stroke-destructive",
      bg: "stroke-destructive/20",
      glow: "drop-shadow-[0_0_8px_hsl(var(--destructive)/0.5)]",
    },
  };

  const actualColor = isOverTarget && color === "success" ? "destructive" : color;
  const colors = colorMap[actualColor];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative">
        <svg
          width={svg}
          height={svg}
          className={cn("transform -rotate-90", colors.glow)}
        >
          {/* Background circle */}
          <circle
            cx={svg / 2}
            cy={svg / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className={colors.bg}
          />
          {/* Progress circle */}
          <circle
            cx={svg / 2}
            cy={svg / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn(colors.stroke, "transition-all duration-1000 ease-out")}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber
            value={value}
            decimals={1}
            suffix="%"
            className={cn(text, "text-foreground")}
          />
          {showTarget && (
            <span className="text-xs text-muted-foreground">
              Meta: {target}%
            </span>
          )}
        </div>
      </div>

      {/* Labels */}
      <div className="text-center">
        <p className={cn("font-medium text-foreground", labelSize)}>{label}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
