
"use client";

import React, { useState, FormEvent } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Tag, User, Users, Calendar as CalendarIcon } from 'lucide-react';
import type { Task, TaskStatus } from '@/types';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';

interface TaskDetailsSheetProps {
  task: Task | null;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onAddComment: (taskId: string, commentContent: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const statusOptions: { value: TaskStatus, label: string }[] = [
    { value: "backlog", label: "Backlog" },
    { value: "todo", label: "To Do" },
    { value: "in-progress", label: "In Progress" },
    { value: "done", label: "Done" },
];


export default function TaskDetailsSheet({ task, onOpenChange, onUpdateTask, onAddComment, onStatusChange }: TaskDetailsSheetProps) {
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  if (!task) return null;

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onAddComment(task.id, comment.trim());
      setComment('');
      toast({
        title: "Comment Added",
        description: "Your comment has been posted.",
      });
    }
  };
  
  const handleStatusChange = (newStatus: TaskStatus) => {
    onStatusChange(task.id, newStatus);
    const statusLabel = statusOptions.find(s => s.value === newStatus)?.label || newStatus;
    toast({
      title: 'Status Updated',
      description: `Task moved to "${statusLabel}".`
    });
  }

  return (
    <Sheet open={!!task} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-[95vw] flex flex-col">
        <SheetHeader className="pr-12">
          <SheetTitle className="text-2xl">{task.title}</SheetTitle>
          <SheetDescription>{task.description}</SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-4 py-4 text-sm">
            <span className="font-semibold text-muted-foreground flex items-center gap-2"><Tag className="h-4 w-4" /> Status</span>
            <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40 h-8">
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    {statusOptions.map(({value, label}) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <span className="font-semibold text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> Assignee</span>
            <div className="flex items-center gap-2">
                {task.assignee ? (
                    <>
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar} />
                            <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{task.assignee.name}</span>
                    </>
                ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                )}
            </div>

            <span className="font-semibold text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Team</span>
            <Badge variant="outline">{task.team.name}</Badge>

            <span className="font-semibold text-muted-foreground flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Start Date</span>
            <div>{task.startDate ? format(parseISO(task.startDate), 'PPP') : <span className="text-muted-foreground">Not set</span>}</div>

            <span className="font-semibold text-muted-foreground flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Due Date</span>
            <div>{task.dueDate ? format(parseISO(task.dueDate), 'PPP') : <span className="text-muted-foreground">Not set</span>}</div>

        </div>
        <Separator />
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-4 -mr-4">
            <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="h-5 w-5"/> Comments ({task.comments.length})</h3>
            <div className="space-y-4">
                {task.comments && task.comments.map(c => (
                    <div key={c.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={c.author.avatar} />
                            <AvatarFallback>{c.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                                <span className="font-semibold">{c.author.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {format(parseISO(c.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                </span>
                            </div>
                            <p className="text-sm bg-muted p-3 rounded-lg mt-1">{c.content}</p>
                        </div>
                    </div>
                ))}
                 {(!task.comments || task.comments.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>}
            </div>
        </div>
        <div className="mt-auto pt-4 border-t">
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <Input 
                    value={comment} 
                    onChange={e => setComment(e.target.value)} 
                    placeholder="Add a comment..."
                    autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={!comment.trim()} aria-label="Send Comment">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
