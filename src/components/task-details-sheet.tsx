

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Task, User, Team } from '@/types';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { CalendarIcon, Loader2, Pencil, User as UserIcon, Users, Tag, CheckSquare, X } from 'lucide-react';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { MultiSelect } from './ui/multi-select';
import { getAllTags } from '@/lib/data';

interface TaskDetailsSheetProps {
  task: Task | null;
  users: User[];
  teams: Team[];
  onOpenChange: (isOpen: boolean) => void;
  onUpdateTask: (updatedTask: Omit<Task, 'team' | 'assignee'>) => Promise<void>;
}

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'backlog', 'done']),
  assigneeId: z.string().optional(),
  teamId: z.string().min(1, 'Team is required'),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

const getTagColor = (tagName: string) => {
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
        hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 40%, 85%)`; // Using HSL for better color control: low saturation, high lightness
};

const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
        <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold text-muted-foreground">{label}</span>
            <div className="text-base text-foreground break-words">{value}</div>
        </div>
    </div>
);

export default function TaskDetailsSheet({ task, users, teams, onOpenChange, onUpdateTask }: TaskDetailsSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {}
  });
  
  useEffect(() => {
    async function fetchTags() {
        const tags = await getAllTags();
        setAvailableTags(tags);
    }
    fetchTags();
  }, []);

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        assigneeId: task.assigneeId || undefined,
        teamId: task.teamId,
        startDate: task.startDate ? parseISO(task.startDate) : undefined,
        dueDate: task.dueDate ? parseISO(task.dueDate) : undefined,
        tags: task.tags || [],
      });
      setIsEditing(false); // Reset to view mode whenever a new task is selected
    }
  }, [task, form]);
  
  const assignee = useMemo(() => users.find(u => u.id === task?.assigneeId), [task, users]);
  const team = useMemo(() => teams.find(t => t.id === task?.teamId), [task, teams]);

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
        tags: data.tags || [],
        createdAt: task.createdAt,
      });
      setIsEditing(false);
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
         <SheetHeader className="pr-12">
           <SheetTitle className="truncate">{isEditing ? 'Editing Task' : task.title}</SheetTitle>
           {!isEditing && (
            <SheetDescription>
                In team <span className="font-semibold text-foreground">{team?.name}</span>. Created on {format(parseISO(task.createdAt), 'PPP')}
            </SheetDescription>
           )}
        </SheetHeader>
        
        {!isEditing && (
            <Button size="icon" variant="outline" className="absolute top-4 right-16" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit Task</span>
            </Button>
        )}

        <div className="flex-1 overflow-y-auto pr-2 -mr-4 pl-1">
            {!isEditing ? (
                <div className="space-y-6 py-4">
                    <p className="text-base text-foreground whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <DetailRow icon={CheckSquare} label="Status" value={<Badge variant="outline" className="capitalize">{task.status.replace('-', ' ')}</Badge>} />
                        <DetailRow icon={UserIcon} label="Assignee" value={assignee?.name || 'Unassigned'} />
                        <DetailRow icon={Users} label="Team" value={team?.name || 'N/A'} />
                        <DetailRow icon={Tag} label="Tags" value={task.tags && task.tags.length > 0 ? <div className="flex flex-wrap gap-1">{task.tags.map(t => <Badge key={t} variant="secondary" style={{ backgroundColor: getTagColor(t) }} className="text-xs text-black">{t}</Badge>)}</div> : 'No tags'} />
                        <DetailRow icon={CalendarIcon} label="Start Date" value={task.startDate ? format(parseISO(task.startDate), 'PPP') : 'Not set'} />
                        <DetailRow icon={CalendarIcon} label="Due Date" value={task.dueDate ? format(parseISO(task.dueDate), 'PPP') : 'Not set'} />
                    </div>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                         <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name="tags" render={({ field }) => (
                             <FormItem>
                                <FormLabel>Tags</FormLabel>
                                <FormControl>
                                   <MultiSelect
                                        options={availableTags.map(tag => ({ value: tag, label: tag }))}
                                        value={field.value ?? []}
                                        onChange={field.onChange}
                                        onCreate={(value) => {
                                            const newTag = { value, label: value };
                                            setAvailableTags(prev => [...prev, value]);
                                            field.onChange([...(field.value ?? []), newTag.value]);
                                        }}
                                        placeholder="Select or create tags..."
                                        
                                    />
                                </FormControl>
                                <FormMessage />
                             </FormItem>
                         )} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>
                                    <SelectItem value="backlog">Backlog</SelectItem><SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem><SelectItem value="done">Done</SelectItem>
                                </SelectContent></Select><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="teamId" render={({ field }) => (
                                <FormItem><FormLabel>Team</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>
                                    {teams.map(t => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                                </SelectContent></Select><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="assigneeId" render={({ field }) => (
                                <FormItem><FormLabel>Assignee</FormLabel><Select onValueChange={field.onChange} value={field.value || 'unassigned'}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {users.map(u => (<SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>))}
                                </SelectContent></Select><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="startDate" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="dueDate" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Due Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                            )} />
                        </div>
                         <SheetFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
