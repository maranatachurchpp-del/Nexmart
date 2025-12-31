import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableWidgetProps {
  id: string;
  index: number;
  children: React.ReactNode;
  className?: string;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  id,
  index,
  children,
  className
}) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            'relative group transition-all duration-200',
            snapshot.isDragging && 'z-50 scale-[1.02] shadow-2xl',
            className
          )}
        >
          {/* Drag Handle */}
          <div
            {...provided.dragHandleProps}
            className={cn(
              'absolute -left-2 top-1/2 -translate-y-1/2 z-10',
              'flex items-center justify-center w-6 h-12 rounded-l-md',
              'bg-muted/80 border border-border border-r-0',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              'cursor-grab active:cursor-grabbing',
              'hover:bg-accent'
            )}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          
          {/* Widget Content */}
          <div className={cn(
            'transition-all duration-200',
            snapshot.isDragging && 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg'
          )}>
            {children}
          </div>
        </div>
      )}
    </Draggable>
  );
};
