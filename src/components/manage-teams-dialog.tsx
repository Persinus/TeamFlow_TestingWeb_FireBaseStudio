
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
import { createTeam, updateTeam, deleteTeam } from '@/app/actions';
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
  tenNhom: z.string().min(3, { message: "Tên đội phải có ít nhất 3 ký tự." }),
  moTa: z.string().optional(),
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
    form.reset({ teams: teams.map(t => ({...t, tenNhom: t.tenNhom || '', moTa: t.moTa || ''})) });
  }, [teams, form, open]);
  
  const handleAddNewTeam = () => {
    if (!user) return;
    append({ id: `new-${Date.now()}`, tenNhom: '', moTa: '' });
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
        toast({ title: "Đã xóa đội", description: "Đội đã được xóa thành công." });
    } catch (error) {
        toast({ variant: 'destructive', title: "Lỗi", description: "Không thể xóa đội." });
    }
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsSaving(true);
    
    try {
        const createPromises = data.teams
            .filter(team => team.id.startsWith('new-'))
            .map(team => createTeam({ tenNhom: team.tenNhom, moTa: team.moTa }, user.id));

        const updatePromises = data.teams
            .filter(team => !team.id.startsWith('new-'))
            .map(team => updateTeam(team.id, { tenNhom: team.tenNhom, moTa: team.moTa }));

        await Promise.all([...createPromises, ...updatePromises]);
        
        onTeamsUpdate();
        onOpenChange(false);
        toast({ title: "Đã cập nhật đội", description: "Tất cả các thay đổi đã được lưu thành công." });
    } catch (error) {
        toast({ variant: 'destructive', title: "Lỗi", description: "Không thể lưu các thay đổi của đội." });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quản lý đội</DialogTitle>
          <DialogDescription>
            Thêm, chỉnh sửa hoặc xóa các đội của bạn ở đây. Nhấn lưu khi bạn hoàn tất.
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
                                        name={`teams.${index}.tenNhom`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Tên đội" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`teams.${index}.moTa`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Mô tả đội (Tùy chọn)" {...field} />
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
                    <PlusCircle className="mr-2 h-4 w-4" /> Thêm đội mới
                </Button>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Lưu thay đổi
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
