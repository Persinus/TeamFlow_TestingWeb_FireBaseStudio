
"use client"

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, Moon, Sun,Smile } from 'lucide-react';
import { users } from '@/lib/data';
import type { Task } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';


export default function SettingsPage() {
    // Mock user, in a real app, this would come from an auth context
    const currentUser = users[3]; 

    const [theme, setTheme] = useState('light');
    const [name, setName] = useState(currentUser.name);
    const [email, setEmail] = useState('diana.prince@example.com'); // Mock email
    const [phone, setPhone] = useState(currentUser.phone || '');
    const [status, setStatus] = useState('Focusing on the main quest!');
    const [dob, setDob] = useState<Date | undefined>(currentUser.dob ? new Date(currentUser.dob) : undefined);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    // Dummy handlers for filters and task creation for Header component
    const [filters, setFilters] = useState({ assignee: 'all', team: 'all', search: '' });
    const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'comments'>) => {};


    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-muted/40">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header filters={filters} setFilters={setFilters} onCreateTask={handleCreateTask} />
                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile</CardTitle>
                                <CardDescription>This is how others will see you on the site.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                        <AvatarFallback>{currentUser.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <Button variant="outline">Change Photo</Button>
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
                                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
                                <Button>Update Profile</Button>
                            </CardContent>
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
                                    <Select defaultValue="en">
                                        <SelectTrigger id="language">
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English (United States)</SelectItem>
                                            <SelectItem value="es">Español (España)</SelectItem>
                                            <SelectItem value="fr">Français (France)</SelectItem>
                                            <SelectItem value="vi">Tiếng Việt (Việt Nam)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
