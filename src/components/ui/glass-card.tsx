import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle";
  glow?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-card/80 backdrop-blur-xl border border-border/50 shadow-medium",
      elevated: "bg-card/90 backdrop-blur-2xl border border-border/30 shadow-strong",
      subtle: "bg-card/60 backdrop-blur-lg border border-border/20 shadow-soft",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl transition-all duration-300",
          variants[variant],
          glow && "hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]",
          "hover:border-primary/30 hover:translate-y-[-2px]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
