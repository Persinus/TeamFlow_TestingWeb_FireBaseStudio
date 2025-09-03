

"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, Moon, Sun, Smile, Loader2, Image as ImageIcon, Contrast, Droplets, Leaf, Trash2, FileText, PlusCircle } from 'lucide-react';
import type { Task, Team, User, TaskTemplate, LoaiCongViec, DoUuTien } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { SidebarInset } from '@/components/ui/sidebar';
import { getTeams, getUsers, addTask, updateUser as apiUpdateUser, getTaskTemplates, createTaskTemplate, deleteTaskTemplate } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { MOCK_USERS } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiSelect } from '@/components/ui/multi-select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const availableAvatars = MOCK_USERS.map(u => u.anhDaiDien).filter((v, i, a) => a.indexOf(v) === i);

function ProfileSettings({ user, onUpdate }: { user: User, onUpdate: () => void }) {
    const { updateUser } = useAuth();
    const { toast } = useToast();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState<Date | undefined>(undefined);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isAvatarModalOpen, setAvatarModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.hoTen);
            setEmail(user.email);
            setPhone(user.soDienThoai || '');
            setDob(user.ngaySinh ? parseISO(user.ngaySinh) : undefined);
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setIsUpdating(true);
        try {
            await apiUpdateUser(user.id, { hoTen: name, soDienThoai: phone, ngaySinh: dob?.toISOString() });
            updateUser({ ...user, hoTen: name, soDienThoai: phone, ngaySinh: dob?.toISOString() });
            toast({ title: 'Hồ sơ đã được cập nhật', description: 'Thông tin của bạn đã được lưu.' });
            onUpdate();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Cập nhật thất bại', description: 'Không thể lưu hồ sơ của bạn.' });
        } finally {
            setIsUpdating(false);
        }
    }
    
    const handleAvatarChange = async (avatarUrl: string) => {
        if (!user) return;
        try {
            await apiUpdateUser(user.id, { anhDaiDien: avatarUrl });
            updateUser({ ...user, anhDaiDien: avatarUrl });
            toast({ title: 'Ảnh đại diện đã được cập nhật!' });
            onUpdate();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Cập nhật thất bại', description: 'Không thể cập nhật ảnh đại diện của bạn.' });
        } finally {
            setAvatarModalOpen(false);
        }
    }

    return (
        <Card>
            <form onSubmit={handleProfileUpdate}>
                <CardHeader>
                    <CardTitle>Hồ sơ</CardTitle>
                    <CardDescription>Đây là cách người khác sẽ thấy bạn trên trang web.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.anhDaiDien} alt={user.hoTen} />
                            <AvatarFallback>{user.hoTen.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Button type="button" variant="outline" onClick={() => setAvatarModalOpen(true)}>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Đổi ảnh
                        </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Họ và tên</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dob">Ngày sinh</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dob && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dob ? format(dob, "PPP") : <span>Chọn một ngày</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={dob} onSelect={setDob} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <Button type="submit" disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cập nhật hồ sơ
                    </Button>
                </CardContent>
            </form>

            <Dialog open={isAvatarModalOpen} onOpenChange={setAvatarModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chọn ảnh đại diện của bạn</DialogTitle>
                        <DialogDescription>Chọn một ảnh đại diện từ danh sách bên dưới.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-4 py-4">
                        {availableAvatars.map((avatarUrl, index) => (
                             <button key={index} onClick={() => handleAvatarChange(avatarUrl)} className="rounded-full ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={avatarUrl} alt={`Avatar ${index + 1}`} />
                                    <AvatarFallback>A</AvatarFallback>
                                </Avatar>
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )
}

function TemplateSettings({ user }: { user: User }) {
    const { toast } = useToast();
    const [templates, setTemplates] = useState<TaskTemplate[]>([]);
    const [isTemplatesLoading, setTemplatesLoading] = useState(true);
    const [isFormOpen, setFormOpen] = useState(false);
    
    // Form state for creating/editing a template
    const [templateName, setTemplateName] = useState('');
    const [templateTitle, setTemplateTitle] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');
    const [templateType, setTemplateType] = useState<LoaiCongViec>('Công việc');
    const [templatePriority, setTemplatePriority] = useState<DoUuTien>('Trung bình');
    const [templateTags, setTemplateTags] = useState<string[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const fetchTemplates = useCallback(async () => {
        if (!user) return;
        setTemplatesLoading(true);
        try {
            const data = await getTaskTemplates(user.id);
            setTemplates(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải các mẫu công việc.' });
        } finally {
            setTemplatesLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleOpenForm = () => {
        // Reset form state
        setTemplateName('');
        setTemplateTitle('');
        setTemplateDescription('');
        setTemplateType('Công việc');
        setTemplatePriority('Trung bình');
        setTemplateTags([]);
        setFormOpen(true);
    };

    const handleSaveTemplate = async () => {
        if (!user || !templateName || !templateTitle) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Tên mẫu và tiêu đề là bắt buộc.' });
            return;
        }
        setIsSaving(true);
        try {
            await createTaskTemplate({
                tenMau: templateName,
                tieuDe: templateTitle,
                moTa: templateDescription,
                loaiCongViec: templateType,
                doUuTien: templatePriority,
                tags: templateTags,
                nguoiTaoId: user.id,
            }, user.id);
            toast({ title: 'Đã lưu mẫu', description: `Mẫu "${templateName}" đã được tạo.` });
            setFormOpen(false);
            fetchTemplates();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể lưu mẫu công việc.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        if (!user) return;
        try {
            await deleteTaskTemplate(templateId, user.id);
            toast({ title: 'Đã xóa mẫu', variant: 'destructive' });
            fetchTemplates();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể xóa mẫu công việc.' });
        }
    };


    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Mẫu Công việc</CardTitle>
                    <CardDescription>Tạo và quản lý các mẫu để tạo công việc nhanh hơn.</CardDescription>
                </div>
                <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
                    <Button onClick={handleOpenForm}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Tạo mẫu
                    </Button>
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle>Tạo Mẫu Công việc Mới</DialogTitle>
                            <DialogDescription>Điền thông tin cho mẫu của bạn. Những thông tin này sẽ được điền sẵn khi bạn sử dụng mẫu.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="template-name">Tên mẫu</Label>
                                <Input id="template-name" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="VD: Báo cáo Lỗi Frontend" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="template-title">Tiêu đề công việc</Label>
                                <Input id="template-title" value={templateTitle} onChange={e => setTemplateTitle(e.target.value)} placeholder="VD: [Lỗi] - " />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="template-desc">Mô tả</Label>
                                <Textarea id="template-desc" value={templateDescription} onChange={e => setTemplateDescription(e.target.value)} placeholder="Mô tả chi tiết mẫu..." />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Loại công việc</Label>
                                    <Select value={templateType} onValueChange={(v: LoaiCongViec) => setTemplateType(v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Tính năng">Tính năng</SelectItem>
                                            <SelectItem value="Lỗi">Lỗi</SelectItem>
                                            <SelectItem value="Công việc">Công việc</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Độ ưu tiên</Label>
                                     <Select value={templatePriority} onValueChange={(v: DoUuTien) => setTemplatePriority(v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Cao">Cao</SelectItem>
                                            <SelectItem value="Trung bình">Trung bình</SelectItem>
                                            <SelectItem value="Thấp">Thấp</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label>Thẻ (Tags)</Label>
                                <MultiSelect
                                    options={allTags.map(t => ({ value: t, label: t }))}
                                    value={templateTags}
                                    onChange={setTemplateTags}
                                    onCreate={(val) => setAllTags(prev => [...prev, val])}
                                    placeholder="Chọn hoặc tạo thẻ..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Hủy</Button>
                            </DialogClose>
                            <Button type="button" onClick={handleSaveTemplate} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Lưu mẫu
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </CardHeader>
            <CardContent>
                {isTemplatesLoading ? (
                    <p>Đang tải mẫu...</p>
                ) : templates.length > 0 ? (
                    <ul className="space-y-2">
                        {templates.map(template => (
                            <li key={template.id} className="flex items-center justify-between p-2 border rounded-md">
                                <span className="font-medium">{template.tenMau}</span>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
                                            <AlertDialogDescription>Hành động này sẽ xóa vĩnh viễn mẫu "{template.tenMau}".</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteTemplate(template.id)} className="bg-destructive hover:bg-destructive/90">Xóa</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">Bạn chưa có mẫu nào. Hãy tạo một mẫu mới!</p>
                )}
            </CardContent>
        </Card>
    );
}

function AppearanceSettings() {
    const { toast } = useToast();
    const [theme, setTheme] = useState('light');
    const [language, setLanguage] = useState('en');
    const [isSwitchingLang, setIsSwitchingLang] = useState(false);

     useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
        // Apply theme on initial load
        const root = window.document.documentElement;
        root.classList.remove('theme-light', 'theme-dark', 'theme-ocean', 'theme-forest', 'theme-high-contrast');
        if (storedTheme === 'dark') {
            root.classList.add('dark');
        }
        root.classList.add(`theme-${storedTheme}`);

        const storedLang = localStorage.getItem('language') || 'en';
        setLanguage(storedLang);
    }, []);

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        const root = window.document.documentElement;
        // Remove all possible theme classes
        root.classList.remove('dark', 'theme-light', 'theme-dark', 'theme-ocean', 'theme-forest', 'theme-high-contrast');
        
        // Add the correct classes
        if (newTheme === 'dark') {
            root.classList.add('dark', 'theme-dark');
        } else {
            root.classList.add(`theme-${newTheme}`);
        }
    };
    
    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        setIsSwitchingLang(true);
        localStorage.setItem('language', newLang);

        setTimeout(() => {
            setIsSwitchingLang(false);
            toast({
                title: "Đã cập nhật ngôn ngữ",
                description: `Ngôn ngữ đã được đổi sang ${newLang === 'en' ? 'English' : 'Tiếng Việt'}. Giao diện sẽ cập nhật sau khi tải lại.`,
            });
        }, 700);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Giao diện</CardTitle>
                <CardDescription>Tùy chỉnh giao diện và cảm nhận của ứng dụng.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label>Giao diện</Label>
                    <Select value={theme} onValueChange={handleThemeChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn một giao diện" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light"><div className="flex items-center gap-2"><Sun className="h-4 w-4"/>Sáng</div></SelectItem>
                            <SelectItem value="dark"><div className="flex items-center gap-2"><Moon className="h-4 w-4"/>Tối</div></SelectItem>
                            <SelectItem value="ocean"><div className="flex items-center gap-2"><Droplets className="h-4 w-4"/>Đại dương</div></SelectItem>
                            <SelectItem value="forest"><div className="flex items-center gap-2"><Leaf className="h-4 w-4"/>Rừng rậm</div></SelectItem>
                            <SelectItem value="high-contrast"><div className="flex items-center gap-2"><Contrast className="h-4 w-4"/>Tương phản cao</div></SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="language">Ngôn ngữ</Label>
                    <div className="flex items-center gap-2">
                        <Select value={language} onValueChange={handleLanguageChange} disabled={isSwitchingLang}>
                            <SelectTrigger id="language">
                                <SelectValue placeholder="Chọn ngôn ngữ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="vi">Tiếng Việt</SelectItem>
                            </SelectContent>
                        </Select>
                        {isSwitchingLang && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


export default function SettingsPage() {
    const { user, loading, updateUser } = useAuth();
    const router = useRouter();

    const [teams, setTeams] = useState<Team[]>([]);
    
    const fetchData = useCallback(async () => {
        const teamsData = await getTeams();
        setTeams(teamsData);
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (!loading && user) {
            fetchData();
        }
    }, [user, loading, router, fetchData]);


    const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'nhom' | 'nguoiThucHien' | 'ngayTao'>) => {
        await addTask(newTaskData, user!.id);
    };

    if (loading || !user) {
        return <div className="flex h-screen items-center justify-center">Đang tải...</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
            <Sidebar teams={teams} onTeamChange={fetchData} />
            <div className="flex flex-1 flex-col">
                <Header onCreateTask={async () => {}} />
                <SidebarInset>
                    <motion.main 
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5 }}
                        className="flex-1 p-4 sm:p-6 md:p-8"
                    >
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
                                <p className="text-muted-foreground">Quản lý hồ sơ, giao diện và các tùy chọn khác của bạn.</p>
                            </div>
                            
                            <Tabs defaultValue="profile">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
                                    <TabsTrigger value="templates">Mẫu Công việc</TabsTrigger>
                                    <TabsTrigger value="appearance">Giao diện</TabsTrigger>
                                </TabsList>
                                <TabsContent value="profile" className="mt-6">
                                    <ProfileSettings user={user} onUpdate={fetchData} />
                                </TabsContent>
                                <TabsContent value="templates" className="mt-6">
                                    <TemplateSettings user={user} />
                                </TabsContent>
                                <TabsContent value="appearance" className="mt-6">
                                    <AppearanceSettings />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </motion.main>
                </SidebarInset>
            </div>
        </div>
    );
}
