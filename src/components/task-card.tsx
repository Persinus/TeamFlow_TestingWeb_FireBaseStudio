import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import type { Task, TaskStatus } from '@/types';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onSelectTask?: (task: Task) => void;
  isDragging?: boolean;
}

const statusDisplay: Record<TaskStatus, { variant: BadgeProps['variant'], text: string }> = {
    backlog: { variant: "secondary", text: "Backlog" },
    todo: { variant: "outline", text: "To Do" },
    "in-progress": { variant: "default", text: "In Progress" },
    done: { variant: "destructive", text: "Done" },
}

export default function TaskCard({ task, onSelectTask, isDragging }: TaskCardProps) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: task.id,
    data: { task },
    disabled: !onSelectTask, // Disable dragging for overlay/preview cards
  });
  
  const display = statusDisplay[task.status];
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <Card 
            className={cn(
                "hover:shadow-lg transition-shadow duration-300 bg-card cursor-pointer",
                isDragging && "ring-2 ring-primary shadow-2xl opacity-80"
            )}
            onClick={() => onSelectTask?.(task)}
        >
        <CardHeader className="pb-4">
            <div className="flex justify-between items-start mb-2">
                <Badge variant={display.variant} className="capitalize">{task.status.replace('-', ' ')}</Badge>
                {task.assignee ? (
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                        <AvatarFallback>{task.assignee.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">?</div>
                )}
            </div>
            <CardTitle className="text-base font-semibold tracking-tight">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
            <p className="line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>{task.comments.length} Comment{task.comments.length !== 1 ? 's' : ''}</span>
            </div>
        </CardFooter>
        </Card>
    </div>
  );
}
