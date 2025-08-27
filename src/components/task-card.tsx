

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Calendar as CalendarIcon, AlertCircle, Tag } from 'lucide-react';
import type { Task } from '@/types';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format, isBefore, differenceInDays, parseISO } from 'date-fns';


interface TaskCardProps {
  task: Task;
  onSelectTask?: (task: Task) => void;
  isDragging?: boolean;
}

// Function to get a consistent, visually distinct color for each tag
const getTagColor = (tagName: string) => {
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
        hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 40%, 85%)`; // Using HSL for better color control: low saturation, high lightness
};

export default function TaskCard({ task, onSelectTask, isDragging }: TaskCardProps) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: task.id,
    data: { task },
    disabled: !onSelectTask, // Disable dragging for overlay/preview cards
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getDeadlineInfo = () => {
      if (!task.dueDate) return { text: null, className: '', cardBorderClass: '' };

      const dueDate = parseISO(task.dueDate);
      const now = new Date();
      const isOverdue = isBefore(dueDate, now);
      const daysDifference = differenceInDays(dueDate, now);

      if (isOverdue) {
          return { text: `Overdue by ${Math.abs(daysDifference)} day(s)`, className: 'text-destructive', cardBorderClass: 'border-l-4 border-destructive' };
      }
      if (daysDifference <= 3) {
          return { text: `Due in ${daysDifference + 1} day(s)`, className: 'text-accent-foreground', cardBorderClass: 'border-l-4 border-accent' };
      }
      return { text: `Due ${format(dueDate, 'MMM d')}`, className: 'text-muted-foreground', cardBorderClass: '' };
  };

  const deadlineInfo = getDeadlineInfo();

  return (
    <motion.div 
        ref={setNodeRef} 
        style={style} 
        layoutId={task.id}
        className={cn(isDragging && "z-50")}
        whileHover={{ scale: 1.03 }}
        onClick={() => onSelectTask?.(task)}
    >
        <Card 
            {...listeners} 
            {...attributes}
            className={cn(
                "hover:shadow-lg transition-all duration-200 bg-card cursor-pointer",
                isDragging && "ring-2 ring-primary shadow-2xl opacity-80",
                deadlineInfo.cardBorderClass
            )}
        >
        <CardHeader className="pb-2">
             <div className="flex justify-between items-start mb-2">
                <div className="flex-1 overflow-hidden">
                  <CardTitle className="text-base font-semibold tracking-tight truncate">{task.title}</CardTitle>
                </div>
                {task.assignee ? (
                    <Avatar className="h-8 w-8 ml-2 flex-shrink-0">
                        <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                        <AvatarFallback>{task.assignee.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                ) : (
                    <div className="h-8 w-8 ml-2 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs flex-shrink-0">?</div>
                )}
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground h-[40px]">{task.description}</p>
        </CardHeader>
        <CardContent className="py-2">
            {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {task.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" style={{ backgroundColor: getTagColor(tag) }} className="text-xs">
                           {tag}
                        </Badge>
                    ))}
                </div>
            )}
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>{task.comments.length}</span>
            </div>
            {deadlineInfo.text && (
                <div className={cn("flex items-center gap-1.5", deadlineInfo.className)}>
                    {deadlineInfo.cardBorderClass.includes('destructive') ? <AlertCircle className="h-4 w-4" /> : <CalendarIcon className="h-4 w-4" />}
                    <span>{deadlineInfo.text}</span>
                </div>
            )}
        </CardFooter>
        </Card>
    </motion.div>
  );
}
