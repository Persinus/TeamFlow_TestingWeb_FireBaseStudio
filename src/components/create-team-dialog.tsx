
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from './ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { createTeam } from '@/app/actions';
import { Loader2 } from 'lucide-react';

interface CreateTeamDialogProps {
  children: React.ReactNode;
  onTeamCreated: () => void;
}

const teamSchema = z.object({
  name: z.string().min(3, { message: "Tên đội phải có ít nhất 3 ký tự." }),
  description: z.string().optional(),
});

export default function CreateTeamDialog({ children, onTeamCreated }: CreateTeamDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof teamSchema>) => {
    if (!user) {
        toast({ variant: 'destructive', title: "Lỗi xác thực", description: "Bạn phải đăng nhập để tạo đội." });
        return;
    }
    
    setIsCreating(true);
    try {
        await createTeam({ tenNhom: values.name, moTa: values.description }, user.id);
        toast({ title: "Đã tạo đội", description: `Đội "${values.name}" đã được tạo thành công.` });
        onTeamCreated(); // Callback to refresh the team list
        setOpen(false);
        form.reset();
    } catch (error) {
        toast({ variant: 'destructive', title: "Lỗi", description: "Không thể tạo đội." });
    } finally {
        setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo đội mới</DialogTitle>
          <DialogDescription>
            Đặt tên cho đội mới của bạn và một mô tả ngắn. Bạn sẽ là đội trưởng.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tên đội</FormLabel>
                        <FormControl>
                            <Input placeholder="ví dụ: Huyền thoại Thiết kế" {...field} />
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
                        <FormLabel>Mô tả (Tùy chọn)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Nhiệm vụ của đội này là gì?" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Hủy</Button>
                    <Button type="submit" disabled={isCreating}>
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Tạo đội
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
