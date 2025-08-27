
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { generateDescriptionFromAI, getAllTags } from '@/app/actions';
import type { Task, User, Team } from '@/types';
import { Wand2, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { MultiSelect } from './ui/multi-select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';


interface CreateTaskSheetProps {
  children: React.ReactNode;
  onCreateTask: (newTaskData: Omit<Task, 'id' | 'nhom' | 'nguoiThucHien' | 'ngayTao'>) => Promise<void>;
  users: User[];
  teams: Team[];
}

const taskSchema = z.object({
  tieuDe: z.string().min(1, 'Tiêu đề là bắt buộc'),
  moTa: z.string().optional(),
  nguoiThucHienId: z.string().optional(),
  nhomId: z.string().optional(),
  trangThai: z.enum(['Cần làm', 'Đang tiến hành', 'Hoàn thành', 'Tồn đọng']),
  loaiCongViec: z.enum(['Tính năng', 'Lỗi', 'Công việc']),
  doUuTien: z.enum(['Cao', 'Trung bình', 'Thấp']),
  ngayBatDau: z.date().optional(),
  ngayHetHan: z.date().optional(),
  tags: z.array(z.string()).optional(),
});


export default function CreateTaskSheet({ children, onCreateTask, users, teams }: CreateTaskSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);
  const [isAiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    async function fetchTags() {
      const tags = await getAllTags();
      setAvailableTags(tags);
    }
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen]);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      tieuDe: '',
      moTa: '',
      trangThai: 'Cần làm',
      loaiCongViec: 'Công việc',
      doUuTien: 'Trung bình',
      tags: []
    },
  });
  
  const handleGenerateDescription = async () => {
    if (!aiPrompt) {
        toast({ variant: 'destructive', title: 'Cần có prompt', description: 'Vui lòng nhập một vài từ khóa để AI tạo mô tả.' });
        return;
    }
    setIsGenerating(true);
    const result = await generateDescriptionFromAI({ prompt: aiPrompt });
    if (result.success && result.data) {
        form.setValue('moTa', result.data.description);
        toast({ title: 'Đã tạo mô tả', description: 'Mô tả đã được điền vào form.'});
        setAiModalOpen(false);
    } else {
        toast({ variant: 'destructive', title: 'Tạo mô tả thất bại', description: result.error });
    }
    setIsGenerating(false);
  }

  const onSubmit = async (values: z.infer<typeof taskSchema>) => {
    await onCreateTask({
      ...values,
      moTa: values.moTa ?? "",
      nguoiThucHienId: values.nguoiThucHienId === 'unassigned' ? undefined : values.nguoiThucHienId,
      nhomId: values.nhomId === 'personal' ? undefined : values.nhomId,
      ngayBatDau: values.ngayBatDau,
      ngayHetHan: values.ngayHetHan,
      tags: values.tags || [],
    });
    form.reset();
    setIsOpen(false);
    toast({
        title: "Đã tạo công việc",
        description: `"${values.tieuDe}" đã được thêm vào bảng.`,
    });
  };

  return (
    <>
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Tạo một công việc mới</SheetTitle>
          <SheetDescription>
            Điền vào các chi tiết dưới đây để thêm một công việc mới vào bảng dự án.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="tieuDe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="ví dụ: Thiết kế trang đăng nhập mới" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="moTa"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Mô tả</FormLabel>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setAiModalOpen(true)}>
                        <Wand2 className="h-4 w-4 mr-2"/>
                        AI
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea placeholder="Thêm mô tả chi tiết cho công việc..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="trangThai"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Trạng thái</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Chọn một trạng thái" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Tồn đọng">Tồn đọng</SelectItem>
                            <SelectItem value="Cần làm">Cần làm</SelectItem>
                            <SelectItem value="Đang tiến hành">Đang tiến hành</SelectItem>
                            <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              <FormField
                control={form.control}
                name="nhomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đội</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Giao cho đội hoặc cá nhân" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal">Cá nhân (Không thuộc đội nào)</SelectItem>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.tenNhom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="loaiCongViec"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Loại công việc</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Tính năng">Tính năng</SelectItem>
                            <SelectItem value="Lỗi">Lỗi</SelectItem>
                            <SelectItem value="Công việc">Công việc</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="doUuTien"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Độ ưu tiên</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Cao">Cao</SelectItem>
                            <SelectItem value="Trung bình">Trung bình</SelectItem>
                            <SelectItem value="Thấp">Thấp</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="ngayBatDau"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Ngày bắt đầu</FormLabel>
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
                                <span>Chọn một ngày</span>
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
                name="ngayHetHan"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Ngày hết hạn</FormLabel>
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
                                <span>Chọn một ngày</span>
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
             <FormField
              control={form.control}
              name="nguoiThucHienId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người được giao</FormLabel>
                   <div className="flex gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Chọn người thực hiện" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="unassigned">Chưa giao</SelectItem>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id}>{user.hoTen}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thẻ</FormLabel>
                  <FormControl>
                    <MultiSelect
                        options={availableTags.map(tag => ({ value: tag, label: tag }))}
                        value={field.value ?? []}
                        onChange={field.onChange}
                        onCreate={(value) => {
                            if (!availableTags.includes(value)) {
                                setAvailableTags(prev => [...prev, value]);
                            }
                            field.onChange([...(field.value ?? []), value]);
                        }}
                        placeholder="Chọn hoặc tạo thẻ..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <Button type="submit" className="w-full">Tạo công việc</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
    <Dialog open={isAiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Tạo mô tả bằng AI</DialogTitle>
                <DialogDescription>Nhập một vài từ khóa hoặc một câu ngắn gọn, AI sẽ tạo ra một mô tả công việc chi tiết cho bạn.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Textarea 
                    placeholder="ví dụ: Tạo trang đích mới cho chiến dịch mùa hè..."
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setAiModalOpen(false)}>Hủy</Button>
                <Button onClick={handleGenerateDescription} disabled={isGenerating}>
                    {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Tạo
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
