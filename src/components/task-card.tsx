import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import type { Task, TaskStatus } from '@/types';

interface TaskCardProps {
  task: Task;
  onSelectTask: (task: Task) => void;
}

const statusDisplay: Record<TaskStatus, { variant: BadgeProps['variant'], text: string }> = {
    backlog: { variant: "secondary", text: "Backlog" },
    todo: { variant: "outline", text: "To Do" },
    "in-progress": { variant: "default", text: "In Progress" },
    done: { variant: "destructive", text: "Done" },
}

export default function TaskCard({ task, onSelectTask }: TaskCardProps) {
  const display = statusDisplay[task.status];
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-background" onClick={() => onSelectTask(task)}>
      <CardHeader className="pb-4">
          <div className="flex justify-between items-center mb-2">
            <Badge variant={display.variant}>{display.text}</Badge>
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
  );
}
