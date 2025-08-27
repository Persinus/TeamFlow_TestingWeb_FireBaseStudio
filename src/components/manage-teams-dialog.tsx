
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { createTeam, updateTeam, deleteTeam } from '@/lib/data';
import { Loader2, PlusCircle, Trash2, X, Save } from 'lucide-react';
import type { Team } from '@/types';
import { ScrollArea } from './ui/scroll-area';

interface ManageTeamsDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: Team[];
  onTeamsUpdate: () => void;
}

const teamSchema = z.object({
  id: z.string(),
  name: z.string().min(3, { message: "Team name must be at least 3 characters." }),
  description: z.string().optional(),
});

const formSchema = z.object({
  teams: z.array(teamSchema),
});

export default function ManageTeamsDialog({ children, open, onOpenChange, teams, onTeamsUpdate }: ManageTeamsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teams: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "teams",
  });

  useEffect(() => {
    form.reset({ teams: teams.map(t => ({...t, description: t.description || ''})) });
  }, [teams, form, open]);
  
  const handleAddNewTeam = () => {
    if (!user) return;
    append({ id: `new-${Date.now()}`, name: '', description: '' });
  }

  const handleDeleteTeam = async (index: number, teamId: string) => {
    if (teamId.startsWith('new-')) {
        remove(index);
        return;
    }
    try {
        await deleteTeam(teamId);
        remove(index);
        onTeamsUpdate();
        toast({ title: "Team Deleted", description: "The team has been successfully deleted." });
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to delete team." });
    }
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsSaving(true);
    
    try {
        const createPromises = data.teams
            .filter(team => team.id.startsWith('new-'))
            .map(team => createTeam({ name: team.name, description: team.description }, user.id));

        const updatePromises = data.teams
            .filter(team => !team.id.startsWith('new-'))
            .map(team => updateTeam(team.id, { name: team.name, description: team.description }));

        await Promise.all([...createPromises, ...updatePromises]);
        
        onTeamsUpdate();
        onOpenChange(false);
        toast({ title: "Teams Updated", description: "All changes have been saved successfully." });
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to save team changes." });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Teams</DialogTitle>
          <DialogDescription>
            Add, edit, or delete your teams here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <ScrollArea className="h-72 pr-6">
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-start gap-2 p-2 border rounded-lg relative">
                                <div className="flex-grow space-y-2">
                                     <FormField
                                        control={form.control}
                                        name={`teams.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Team Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`teams.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Team Description (Optional)" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="flex-shrink-0" onClick={() => handleDeleteTeam(index, field.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <Button type="button" variant="outline" className="w-full" onClick={handleAddNewTeam}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Team
                </Button>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
