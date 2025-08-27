
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Task, TaskStatus, User, Team } from '@/types';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { CalendarIcon, Loader2 } from 'lucide-react';

interface TaskDetailsSheetProps {
  task: Task | null;
  users: User[];
  teams: Team[];
  onOpenChange: (isOpen: boolean) => void;
  onUpdateTask: (updatedTask: Omit<Task, 'team' | 'assignee' | 'comments'>) => Promise<void>;
}

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'backlog', 'done']),
  assigneeId: z.string().optional(),
  teamId: z.string().min(1, 'Team is required'),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function TaskDetailsSheet({ task, users, teams, onOpenChange, onUpdateTask }: TaskDetailsSheetProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
        title: '',
        description: '',
        status: 'todo',
        assigneeId: '',
        teamId: '',
    }
  });
  
  useEffect(() => {
    if (task) {
        form.reset({
            title: task.title,
            description: task.description,
            status: task.status,
            assigneeId: task.assigneeId || undefined,
            teamId: task.teamId,
            startDate: task.startDate ? parseISO(task.startDate) : undefined,
            dueDate: task.dueDate ? parseISO(task.dueDate) : undefined,
        });
    }
  }, [task, form]);

  if (!task) return null;

  const onSubmit = async (data: TaskFormData) => {
    setIsUpdating(true);
    try {
      await onUpdateTask({
        id: task.id,
        ...data,
        assigneeId: data.assigneeId === 'unassigned' ? undefined : data.assigneeId,
        startDate: data.startDate?.toISOString(),
        dueDate: data.dueDate?.toISOString(),
        createdAt: task.createdAt, // keep original creation date
      });
    } catch(error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'There was a problem updating the task.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Sheet open={!!task} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-[95vw] flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit Task Details</SheetTitle>
          <SheetDescription>Make changes to the task below and click save.</SheetDescription>
        </SheetHeader>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-y-auto">
                <div className="space-y-4 px-1 py-4">
                     <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Design new login page" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Add a detailed description for the task..." {...field} className="min-h-[100px]" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="backlog">Backlog</SelectItem>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="teamId"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Team</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Assign to a team" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {teams.map(team => (
                                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="assigneeId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Assignee</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || 'unassigned'}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select an assignee" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {users.map(user => (
                                                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Due Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <SheetFooter className="mt-auto pt-4 border-t bg-background sticky bottom-0">
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </SheetFooter>
            </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
