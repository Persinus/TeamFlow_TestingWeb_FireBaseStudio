
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { SidebarInset } from '@/components/ui/sidebar';
import { getTeams, getUsers, addTask, updateUser as apiUpdateUser } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MOCK_USERS } from '@/lib/mock-data';

// Get a list of unique avatar URLs from the mock data
const availableAvatars = MOCK_USERS.map(u => u.avatar).filter((v, i, a) => a.indexOf(v) === i);


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
    const [status, setStatus] = useState('Focusing on the main quest!');
    const [dob, setDob] = useState<Date | undefined>(undefined);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isAvatarModalOpen, setAvatarModalOpen] = useState(false);

    
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
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || '');
            setDob(user.dob ? new Date(user.dob) : undefined);
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
                title: "Language Updated",
                description: `Language changed to ${newLang === 'en' ? 'English' : 'Tiếng Việt'}. UI will update on next refresh.`,
            });
        }, 700);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setIsUpdating(true);
        try {
            await apiUpdateUser(user.id, { name, phone, dob: dob?.toISOString() });
            // Update auth context
            updateUser({ ...user, name, phone, dob: dob?.toISOString() });
            toast({ title: 'Profile Updated', description: 'Your information has been saved.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save your profile.' });
        } finally {
            setIsUpdating(false);
        }
    }
    
    const handleAvatarChange = async (avatarUrl: string) => {
        if (!user) return;
        try {
            await apiUpdateUser(user.id, { avatar: avatarUrl });
            updateUser({ ...user, avatar: avatarUrl });
            toast({ title: 'Avatar Updated!' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update your avatar.' });
        } finally {
            setAvatarModalOpen(false);
        }
    }


    // Dummy handlers for filters and task creation for Header component
    const [filters, setFilters] = useState({ assignee: 'all', team: 'all', search: '' });
    const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'team' | 'assignee' | 'createdAt'>) => {
        await addTask(newTaskData);
        // In a real app, you might want to refetch tasks here or update state optimistically
    };

    if (loading || !user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
            <Sidebar teams={teams} onTeamChange={fetchData} />
            <div className="flex flex-1 flex-col">
                <Header users={users} teams={teams} filters={filters} setFilters={setFilters} onCreateTask={handleCreateTask as any} />
                <SidebarInset>
                    <motion.main 
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5 }}
                        className="flex-1 p-4 sm:p-6 md:p-8"
                    >
                        <div className="max-w-4xl mx-auto space-y-8">
                            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                            
                            <Card>
                                <form onSubmit={handleProfileUpdate}>
                                    <CardHeader>
                                        <CardTitle>Profile</CardTitle>
                                        <CardDescription>This is how others will see you on the site.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={user.avatar} alt={user.name} />
                                                <AvatarFallback>{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <Button type="button" variant="outline" onClick={() => setAvatarModalOpen(true)}>
                                                <ImageIcon className="mr-2 h-4 w-4" />
                                                Change Photo
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status" className="flex items-center gap-2">
                                                <Smile className="h-4 w-4" />
                                                Status
                                            </Label>
                                            <Textarea id="status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="What's on your mind?" />
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="dob">Date of Birth</Label>
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
                                                        {dob ? format(dob, "PPP") : <span>Pick a date</span>}
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
                                            Update Profile
                                        </Button>
                                    </CardContent>
                                </form>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Appearance</CardTitle>
                                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Theme</Label>
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center gap-2">
                                            {theme === 'light' ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
                                            <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                                        </div>
                                        <Button variant="outline" size="icon" onClick={toggleTheme}>
                                                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                                                <span className="sr-only">Toggle theme</span>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="language">Language</Label>
                                        <div className="flex items-center gap-2">
                                            <Select value={language} onValueChange={handleLanguageChange} disabled={isSwitchingLang}>
                                                <SelectTrigger id="language">
                                                    <SelectValue placeholder="Select language" />
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
                        <DialogTitle>Choose your Avatar</DialogTitle>
                        <DialogDescription>Select an avatar from the list below.</DialogDescription>
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
        </div>
    );
}
