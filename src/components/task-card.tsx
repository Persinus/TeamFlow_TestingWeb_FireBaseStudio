
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, AlertCircle, GripVertical } from 'lucide-react';
import type { Task } from '@/types';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format, isBefore, differenceInDays, parseISO } from 'date-fns';


interface TaskCardProps {
  task: Task;
  onSelectTask?: (task: Task) => void;
  isDragging?: boolean;
  isCompact?: boolean;
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

export default function TaskCard({ task, onSelectTask, isDragging, isCompact = false }: TaskCardProps) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: task.id,
    data: { task },
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getDeadlineInfo = () => {
      if (!task.ngayHetHan) return { text: null, className: '', cardBorderClass: '' };
      
      // The dueDate can be either a string (from serialization) or a Date object.
      const dueDate = typeof task.ngayHetHan === 'string' ? parseISO(task.ngayHetHan) : task.ngayHetHan;

      const now = new Date();
      const isOverdue = isBefore(dueDate, now);
      const daysDifference = differenceInDays(dueDate, now);

      if (isOverdue) {
          return { text: `Quá hạn ${Math.abs(daysDifference)} ngày`, className: 'text-destructive', cardBorderClass: 'border-l-4 border-destructive' };
      }
      if (daysDifference <= 3) {
          return { text: `Đến hạn trong ${daysDifference + 1} ngày`, className: 'text-accent-foreground', cardBorderClass: 'border-l-4 border-accent' };
      }
      return { text: `Hạn chót ${format(dueDate, 'd/M')}`, className: 'text-muted-foreground', cardBorderClass: '' };
  };

  const deadlineInfo = getDeadlineInfo();

  if (isCompact) {
     return (
       <motion.div
        ref={setNodeRef}
        style={style}
        layoutId={task.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        className={cn("relative group", isDragging && "z-50")}
       >
        <Card 
            className={cn(
                "hover:shadow-md transition-all duration-200 bg-card",
                isDragging && "ring-2 ring-primary shadow-lg opacity-80"
            )}
        >
             <div {...attributes} {...listeners} className="absolute top-1/2 -translate-y-1/2 left-0.5 p-1 text-muted-foreground/30 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5" />
             </div>
             <div className="cursor-pointer py-2 pl-6 pr-2" onClick={() => onSelectTask?.(task)}>
                 <div className="flex items-center justify-between gap-2">
                     <span className="text-sm font-medium truncate flex-1">{task.tieuDe}</span>
                      {task.nguoiThucHien ? (
                        <Avatar className="h-6 w-6 flex-shrink-0">
                            <AvatarImage src={task.nguoiThucHien.anhDaiDien} alt={task.nguoiThucHien.hoTen} />
                            <AvatarFallback>{task.nguoiThucHien.hoTen.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    ) : (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-[10px] flex-shrink-0">?</div>
                    )}
                 </div>
             </div>
        </Card>
       </motion.div>
     );
  }

  return (
    <motion.div 
        ref={setNodeRef} 
        style={style} 
        layoutId={task.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        className={cn("relative group", isDragging && "z-50")}
        whileHover={{ scale: 1.03 }}
        
    >
        <Card 
            className={cn(
                "hover:shadow-lg transition-all duration-200 bg-card",
                isDragging && "ring-2 ring-primary shadow-2xl opacity-80",
                deadlineInfo.cardBorderClass,
            )}
        >
        <div {...attributes} {...listeners} className="absolute top-2 right-1 p-1 text-muted-foreground/50 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-5 w-5" />
            <span className="sr-only">Kéo để di chuyển</span>
        </div>

        <div className="cursor-pointer" onClick={() => onSelectTask?.(task)}>
            <CardHeader className="pb-2 pr-8">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 overflow-hidden">
                    <CardTitle className="text-base font-semibold tracking-tight truncate">{task.tieuDe}</CardTitle>
                    </div>
                    {task.nguoiThucHien ? (
                        <Avatar className="h-8 w-8 ml-2 flex-shrink-0">
                            <AvatarImage src={task.nguoiThucHien.anhDaiDien} alt={task.nguoiThucHien.hoTen} />
                            <AvatarFallback>{task.nguoiThucHien.hoTen.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    ) : (
                        <div className="h-8 w-8 ml-2 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs flex-shrink-0">?</div>
                    )}
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground h-[40px]">{task.moTa}</p>
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
            <CardFooter className="flex justify-between text-sm text-muted-foreground pt-2 min-h-[36px] items-center">
                <div className="flex items-center gap-2">
                </div>
                {deadlineInfo.text ? (
                    <div className={cn("flex items-center gap-1.5", deadlineInfo.className)}>
                        {deadlineInfo.cardBorderClass.includes('destructive') ? <AlertCircle className="h-4 w-4" /> : <CalendarIcon className="h-4 w-4" />}
                        <span>{deadlineInfo.text}</span>
                    </div>
                ) : <div>&nbsp;</div>}
            </CardFooter>
        </div>
        </Card>
    </motion.div>
  );
}
