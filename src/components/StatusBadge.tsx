import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'destructive';
  label: string;
  className?: string;
}

export const StatusBadge = ({ status, label, className }: StatusBadgeProps) => {
  const variants = {
    success: "bg-success text-success-foreground hover:bg-success/90",
    warning: "bg-warning text-warning-foreground hover:bg-warning/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
  };

  return (
    <Badge className={cn(variants[status], className)}>
      {label}
    </Badge>
  );
};