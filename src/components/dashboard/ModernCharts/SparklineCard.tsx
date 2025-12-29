import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { GlassCard } from "@/components/ui/glass-card";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

interface SparklineCardProps {
  title: string;
  value: number;
  previousValue?: number;
  data: number[];
  unit?: string;
  prefix?: string;
  color?: "primary" | "success" | "warning" | "destructive";
  formatAsCurrency?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function SparklineCard({
  title,
  value,
  previousValue,
  data,
  unit = "",
  prefix = "",
  color = "primary",
  formatAsCurrency = false,
  icon,
  className,
}: SparklineCardProps) {
  const trend = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : 0;
  const trendDirection = trend > 0 ? "up" : trend < 0 ? "down" : "neutral";

  const colorMap = {
    primary: {
      fill: "hsl(var(--primary))",
      gradient: "url(#primaryGradient)",
    },
    success: {
      fill: "hsl(var(--success))",
      gradient: "url(#successGradient)",
    },
    warning: {
      fill: "hsl(var(--warning))",
      gradient: "url(#warningGradient)",
    },
    destructive: {
      fill: "hsl(var(--destructive))",
      gradient: "url(#destructiveGradient)",
    },
  };

  const chartData = data.map((v, i) => ({ value: v, index: i }));

  return (
    <GlassCard className={cn("p-4 overflow-hidden", className)} glow>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={cn(
              "p-2 rounded-lg",
              color === "primary" && "bg-primary/10 text-primary",
              color === "success" && "bg-success/10 text-success",
              color === "warning" && "bg-warning/10 text-warning",
              color === "destructive" && "bg-destructive/10 text-destructive"
            )}>
              {icon}
            </div>
          )}
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        
        {previousValue !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trendDirection === "up" && "bg-success/10 text-success",
            trendDirection === "down" && "bg-destructive/10 text-destructive",
            trendDirection === "neutral" && "bg-muted text-muted-foreground"
          )}>
            {trendDirection === "up" && <TrendingUp className="h-3 w-3" />}
            {trendDirection === "down" && <TrendingDown className="h-3 w-3" />}
            {trendDirection === "neutral" && <Minus className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <AnimatedNumber
            value={value}
            decimals={formatAsCurrency ? 2 : 1}
            prefix={prefix}
            suffix={unit}
            formatAsCurrency={formatAsCurrency}
            className="text-2xl font-bold text-foreground"
          />
        </div>

        <div className="w-24 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="warningGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="destructiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={colorMap[color].fill}
                strokeWidth={2}
                fill={colorMap[color].gradient}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}
