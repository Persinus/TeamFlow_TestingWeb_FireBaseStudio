

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Task, User, Team, TrangThaiCongViec, VaiTroThanhVien } from '@/types';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { CalendarIcon, Loader2, Pencil, User as UserIcon, Users, Tag, CheckSquare, X, Trash2, Shield, Flag, Package, Wand2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { MultiSelect } from './ui/multi-select';
import { getAllTags, generateDescriptionFromAI, deleteTask as apiDeleteTask } from '@/app/actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Dialog } from './ui/dialog';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { useAuth } from '@/hooks/use-auth';


interface TaskDetailsSheetProps {
  task: Task | null;
  users: User[];
  teams: Team[];
  onOpenChange: (isOpen: boolean) => void;
  onUpdateTask: (updatedTask: Omit<Task, 'nhom' | 'nguoiThucHien'>) => Promise<void>;
  onTaskDeleted: () => void;
}

const taskSchema = z.object({
  tieuDe: z.string().min(1, 'Tiêu đề là bắt buộc'),
  moTa: z.string().optional(),
  trangThai: z.enum(['Cần làm', 'Đang tiến hành', 'Hoàn thành', 'Tồn đọng']),
  nguoiThucHienId: z.string().optional(),
  nhomId: z.string().optional(),
  ngayBatDau: z.date().optional(),
  ngayHetHan: z.date().optional(),
  loaiCongViec: z.enum(['Tính năng', 'Lỗi', 'Công việc']),
  doUuTien: z.enum(['Cao', 'Trung bình', 'Thấp']),
});

type TaskFormData = z.infer<typeof taskSchema>;

const getTagColor = (tagName: string) => {
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
        hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 40%, 85%)`;
};

const DetailRow = ({ icon: Icon, label, value, children }: { icon: React.ElementType, label: string, value?: React.ReactNode, children?: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
        <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold text-muted-foreground">{label}</span>
            {value && <div className="text-base text-foreground break-words">{value}</div>}
            {children}
        </div>
    </div>
);

// Helper function to safely parse dates
const safeParseDate = (date: string | Date | undefined): Date | undefined => {
    if (!date) return undefined;
    if (date instanceof Date) return date;
    try {
        return parseISO(date);
    } catch (e) {
        return undefined;
    }
};

export default function TaskDetailsSheet({ task, users, teams, onOpenChange, onUpdateTask, onTaskDeleted }: TaskDetailsSheetProps) {
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const [isTagDialogOpen, setTagDialogOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [pendingTags, setPendingTags] = useState<string[]>([]);

  const [isAiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const team = useMemo(() => teams.find(t => t.id === task?.nhomId), [task, teams]);

  const canEdit = useMemo(() => {
    if (!task || !currentUser) return false;
    
    // Personal task: only creator can edit
    if (!task.nhomId) {
        return task.nguoiTaoId === currentUser.id;
    }
    
    // Team task: only team leader can edit
    if (team) {
        const currentUserMembership = team.thanhVien?.find(m => m.thanhVienId === currentUser.id);
        return currentUserMembership?.vaiTro === 'Trưởng nhóm';
    }
    
    return false;
  }, [task, currentUser, team]);

  const canDelete = useMemo(() => {
    if (!task || !currentUser) return false;
    
    if (!task.nhomId) {
        return task.nguoiTaoId === currentUser.id;
    }
    
    if (team) {
        const currentUserMembership = team.thanhVien?.find(m => m.thanhVienId === currentUser.id);
        return currentUserMembership?.vaiTro === 'Trưởng nhóm';
    }
    
    return false;
  }, [task, currentUser, team]);

  useEffect(() => {
    async function fetchTags() {
        const tags = await getAllTags();
        setAvailableTags(tags);
    }
    fetchTags();
  }, []);

  useEffect(() => {
    if (task && form) {
      form.reset({
        tieuDe: task.tieuDe,
        moTa: task.moTa || '',
        trangThai: task.trangThai,
        nguoiThucHienId: task.nguoiThucHienId || undefined,
        nhomId: task.nhomId || undefined,
        ngayBatDau: safeParseDate(task.ngayBatDau),
        ngayHetHan: safeParseDate(task.ngayHetHan),
        loaiCongViec: task.loaiCongViec,
        doUuTien: task.doUuTien,
      });
      setPendingTags(task.tags || []);
    }
  }, [task, isEditing, form]);
  
  const assignee = useMemo(() => users.find(u => u.id === task?.nguoiThucHienId), [task, users]);

  if (!task) return null;

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

  const onSubmit = async (data: TaskFormData) => {
    setIsUpdating(true);
    try {
      const finalTaskData = {
        id: task.id,
        ...data,
        tags: pendingTags,
        nguoiThucHienId: data.nguoiThucHienId === 'unassigned' ? undefined : data.nguoiThucHienId,
        nhomId: data.nhomId === 'personal' ? undefined : data.nhomId,
        ngayTao: task.ngayTao,
      };
      
      await onUpdateTask(finalTaskData);
      
      setIsEditing(false);
      toast({
        title: 'Đã cập nhật công việc',
        description: `"${data.tieuDe}" đã được lưu thành công.`,
      });
    } catch(error) {
      console.error("Update failed:", error);
      toast({
        variant: 'destructive',
        title: 'Cập nhật thất bại',
        description: 'Đã có lỗi xảy ra khi cập nhật công việc.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;
    setIsDeleting(true);
    try {
        await apiDeleteTask(task.id, currentUser.id);
        toast({
            title: 'Đã xóa công việc',
            description: `"${task.tieuDe}" đã được xóa vĩnh viễn.`,
            variant: "destructive"
        });
        onOpenChange(false);
        onTaskDeleted();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Xóa thất bại',
            description: error.message || 'Đã có lỗi xảy ra khi xóa công việc.',
        });
    } finally {
        setIsDeleting(false);
    }
  }

  const handleCreateTag = (value: string) => {
    const newTag = value.trim();
    if (newTag && !availableTags.includes(newTag)) {
        setAvailableTags(prev => [...prev, newTag]);
    }
  }

  const formatDate = (date: string | Date | undefined) => {
    const parsedDate = safeParseDate(date);
    return parsedDate ? format(parsedDate, 'PPP') : 'Chưa đặt';
  };
  
  const statusMap: Record<TrangThaiCongViec, string> = {
    'Tồn đọng': 'Tồn đọng',
    'Cần làm': 'Cần làm',
    'Đang tiến hành': 'Đang tiến hành',
    'Hoàn thành': 'Hoàn thành'
  }

  return (
    <>
    <Sheet open={!!task} onOpenChange={(isOpen) => { if(!isOpen) setIsEditing(false); onOpenChange(isOpen);}}>
      <SheetContent className="sm:max-w-2xl w-[95vw] flex flex-col">
         <SheetHeader className="pr-12">
           <SheetTitle className="truncate">{isEditing ? 'Chỉnh sửa công việc' : task.tieuDe}</SheetTitle>
           {!isEditing && (
            <SheetDescription>
                {team ? `Trong đội ${team.tenNhom}` : 'Công việc cá nhân'}. Tạo ngày {formatDate(task.ngayTao)}
            </SheetDescription>
           )}
        </SheetHeader>
        
        {!isEditing && canEdit && (
            <Button size="icon" variant="outline" className="absolute top-4 right-16" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Chỉnh sửa công việc</span>
            </Button>
        )}

        <div className="flex-1 overflow-y-auto pr-2 -mr-4 pl-1">
            {!isEditing ? (
                <div className="space-y-6 py-4">
                    <p className="text-base text-foreground whitespace-pre-wrap">{task.moTa || 'Không có mô tả.'}</p>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <DetailRow icon={CheckSquare} label="Trạng thái" value={<Badge variant="outline" className="capitalize">{statusMap[task.trangThai]}</Badge>} />
                        <DetailRow icon={UserIcon} label="Người thực hiện" value={assignee?.hoTen || 'Chưa giao'} />
                        <DetailRow icon={Users} label="Đội" value={team?.tenNhom || 'Cá nhân'} />
                        <DetailRow icon={Package} label="Loại công việc" value={<Badge variant="secondary">{task.loaiCongViec}</Badge>} />
                        <DetailRow icon={Flag} label="Độ ưu tiên" value={<Badge variant={task.doUuTien === 'Cao' ? 'destructive' : task.doUuTien === 'Trung bình' ? 'secondary' : 'outline'}>{task.doUuTien}</Badge>} />
                        <DetailRow icon={Tag} label="Thẻ" value={task.tags && task.tags.length > 0 ? <div className="flex flex-wrap gap-1">{task.tags.map(t => <Badge key={t} variant="secondary" style={{ backgroundColor: getTagColor(t) }} className="text-xs text-black">{t}</Badge>)}</div> : 'Không có thẻ'} />
                        <DetailRow icon={CalendarIcon} label="Ngày bắt đầu" value={formatDate(task.ngayBatDau)} />
                        <DetailRow icon={CalendarIcon} label="Ngày hết hạn" value={formatDate(task.ngayHetHan)} />
                    </div>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                         <FormField control={form.control} name="tieuDe" render={({ field }) => (
                            <FormItem><FormLabel>Tiêu đề</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name="moTa" render={({ field }) => (
                            <FormItem>
                                 <div className="flex justify-between items-center">
                                    <FormLabel>Mô tả</FormLabel>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setAiModalOpen(true)}>
                                        <Wand2 className="h-4 w-4 mr-2"/>
                                        Tạo với AI
                                    </Button>
                                  </div>
                                <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl><FormMessage />
                            </FormItem>
                         )} />
                         
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField control={form.control} name="trangThai" render={({ field }) => (
                                <FormItem><FormLabel>Trạng thái</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>
                                    <SelectItem value="Tồn đọng">Tồn đọng</SelectItem><SelectItem value="Cần làm">Cần làm</SelectItem>
                                    <SelectItem value="Đang tiến hành">Đang tiến hành</SelectItem><SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                                </SelectContent></Select><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="nhomId" render={({ field }) => (
                                <FormItem><FormLabel>Đội</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value || "personal"}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>
                                    <SelectItem value="personal">Cá nhân (Không thuộc đội nào)</SelectItem>
                                    {teams.map(t => (<SelectItem key={t.id} value={t.id}>{t.tenNhom}</SelectItem>))}
                                </SelectContent></Select><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="nguoiThucHienId" render={({ field }) => (
                                <FormItem><FormLabel>Người được giao</FormLabel><Select onValueChange={field.onChange} value={field.value || 'unassigned'}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                    <SelectItem value="unassigned">Chưa giao</SelectItem>
                                    {users.map(u => (<SelectItem key={u.id} value={u.id}>{u.hoTen}</SelectItem>))}
                                </SelectContent></Select><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="loaiCongViec" render={({ field }) => (
                                <FormItem><FormLabel>Loại công việc</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>
                                    <SelectItem value="Tính năng">Tính năng</SelectItem><SelectItem value="Lỗi">Lỗi</SelectItem><SelectItem value="Công việc">Công việc</SelectItem>
                                </SelectContent></Select><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="doUuTien" render={({ field }) => (
                                <FormItem><FormLabel>Độ ưu tiên</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>
                                    <SelectItem value="Cao">Cao</SelectItem><SelectItem value="Trung bình">Trung bình</SelectItem><SelectItem value="Thấp">Thấp</SelectItem>
                                </SelectContent></Select><FormMessage /></FormItem>
                            )} />

                            <FormItem>
                                <FormLabel>Thẻ</FormLabel>
                                <Dialog open={isTagDialogOpen} onOpenChange={setTagDialogOpen}>
                                    <Button type="button" variant="outline" className="w-full justify-start" onClick={() => setTagDialogOpen(true)}>Chỉnh sửa thẻ</Button>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Chỉnh sửa thẻ cho công việc</DialogTitle>
                                            <DialogDescription>Chọn, bỏ chọn hoặc tạo thẻ mới.</DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <MultiSelect
                                                options={availableTags.map(tag => ({ value: tag, label: tag }))}
                                                value={pendingTags}
                                                onChange={setPendingTags}
                                                onCreate={handleCreateTag}
                                                placeholder="Chọn hoặc tạo thẻ..."
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={() => setTagDialogOpen(false)}>Xong</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <div className="mt-2 flex flex-wrap gap-1">
                                     {pendingTags.length > 0 ? (
                                        pendingTags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Không có thẻ.</span>
                                    )}
                                </div>
                            </FormItem>
                        </div>
                        
                        <Separator />
                         
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="ngayBatDau" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Ngày bắt đầu</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Chọn một ngày</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="ngayHetHan" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Ngày hết hạn</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Chọn một ngày</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                            )} />
                        </div>
                         <SheetFooter className="pt-4 flex justify-between sm:justify-between">
                            {canDelete && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button type="button" variant="destructive" className="mr-auto" disabled={isDeleting}>
                                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                            {isDeleting ? 'Đang xóa...' : 'Xóa'}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Bạn có hoàn toàn chắc chắn?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh viễn công việc
                                        và xóa dữ liệu của nó khỏi máy chủ của chúng tôi.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Vâng, xóa công việc
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

                            <div className="flex gap-2 ml-auto">
                                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Hủy</Button>
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </SheetFooter>
                    </form>
                </Form>
            )}
        </div>
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
