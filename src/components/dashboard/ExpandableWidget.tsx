import { useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableWidgetProps {
  title: string;
  children: ReactNode;
  expandedContent?: ReactNode;
  className?: string;
}

export const ExpandableWidget = ({ 
  title, 
  children, 
  expandedContent,
  className 
}: ExpandableWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className={cn("group relative", className)}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
          onClick={() => setIsExpanded(true)}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        {children}
      </div>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {expandedContent || children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
