
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
import { CalendarIcon, Moon, Sun, Smile, Loader2, Image as ImageIcon } from 'lucide-react';
import type { Task, Team, User } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { SidebarInset } from '@/components/ui/sidebar';
import { getTeams, getUsers, addTask, updateUser as apiUpdateUser } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MOCK_USERS } from '@/lib/mock-data';
import TourGuide from '@/components/tour-guide';

// Get a list of unique avatar URLs from the mock data
const availableAvatars = MOCK_USERS.map(u => u.anhDaiDien).filter((v, i, a) => a.indexOf(v) === i);


export default function SettingsPage() {
    const { user, loading, updateUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [theme, setTheme] = useState('light');
    const [language, setLanguage] = useState('en');
    const [isSwitchingLang, setIsSwitchingLang] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState('Đang tập trung vào nhiệm vụ chính!');
    const [dob, setDob] = useState<Date | undefined>(undefined);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isAvatarModalOpen, setAvatarModalOpen] = useState(false);
    const [isTourOpen, setIsTourOpen] = useState(false);

    
    const fetchData = useCallback(async () => {
        const [teamsData, usersData] = await Promise.all([getTeams(), getUsers()]);
        setTeams(teamsData);
        setUsers(usersData);
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (!loading && user) {
            setName(user.hoTen);
            setEmail(user.email);
            setPhone(user.soDienThoai || '');
            setDob(user.ngaySinh ? parseISO(user.ngaySinh) : undefined);
            fetchData();
        }
    }, [user, loading, router, fetchData]);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');

        const storedLang = localStorage.getItem('language') || 'en';
        setLanguage(storedLang);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };
    
    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        setIsSwitchingLang(true);
        localStorage.setItem('language', newLang);

        // Simulate applying the language change
        setTimeout(() => {
            setIsSwitchingLang(false);
            toast({
                title: "Đã cập nhật ngôn ngữ",
                description: `Ngôn ngữ đã được đổi sang ${newLang === 'en' ? 'English' : 'Tiếng Việt'}. Giao diện sẽ cập nhật sau khi tải lại.`,
            });
        }, 700);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setIsUpdating(true);
        try {
            await apiUpdateUser(user.id, { hoTen: name, soDienThoai: phone, ngaySinh: dob?.toISOString() });
            // Update auth context
            updateUser({ ...user, hoTen: name, soDienThoai: phone, ngaySinh: dob?.toISOString() });
            toast({ title: 'Hồ sơ đã được cập nhật', description: 'Thông tin của bạn đã được lưu.' });
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
        } catch (error) {
            toast({ variant: 'destructive', title: 'Cập nhật thất bại', description: 'Không thể cập nhật ảnh đại diện của bạn.' });
        } finally {
            setAvatarModalOpen(false);
        }
    }


    const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'nhom' | 'nguoiThucHien' | 'ngayTao'>) => {
        await addTask(newTaskData);
    };

    if (loading || !user) {
        return <div className="flex h-screen items-center justify-center">Đang tải...</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
            <Sidebar teams={teams} onTeamChange={fetchData} onShowTour={() => setIsTourOpen(true)} />
            <div className="flex flex-1 flex-col">
                <Header onCreateTask={handleCreateTask as any} />
                <SidebarInset>
                    <motion.main 
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5 }}
                        className="flex-1 p-4 sm:p-6 md:p-8"
                    >
                        <div className="max-w-4xl mx-auto space-y-8">
                            <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
                            
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
                                        <div className="space-y-2">
                                            <Label htmlFor="status" className="flex items-center gap-2">
                                                <Smile className="h-4 w-4" />
                                                Trạng thái
                                            </Label>
                                            <Textarea id="status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Bạn đang nghĩ gì?" />
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
                                                        <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !dob && "text-muted-foreground"
                                                        )}
                                                        >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {dob ? format(dob, "PPP") : <span>Chọn một ngày</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                        mode="single"
                                                        selected={dob}
                                                        onSelect={setDob}
                                                        initialFocus
                                                        />
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
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Giao diện</CardTitle>
                                    <CardDescription>Tùy chỉnh giao diện và cảm nhận của ứng dụng.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Giao diện</Label>
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center gap-2">
                                            {theme === 'light' ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
                                            <span>{theme === 'light' ? 'Chế độ sáng' : 'Chế độ tối'}</span>
                                        </div>
                                        <Button variant="outline" size="icon" onClick={toggleTheme}>
                                                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                                                <span className="sr-only">Chuyển đổi giao diện</span>
                                            </Button>
                                        </div>
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
                        </div>
                    </motion.main>
                </SidebarInset>
            </div>
            
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
            <TourGuide open={isTourOpen} onOpenChange={setIsTourOpen} />
        </div>
    );
}

    
