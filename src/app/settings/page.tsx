
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
import { Moon, Sun } from 'lucide-react';
import { users } from '@/lib/data';
import type { Task } from '@/types';

export default function SettingsPage() {
    // Mock user, in a real app, this would come from an auth context
    const currentUser = users[3]; 

    const [theme, setTheme] = useState('light');
    const [name, setName] = useState(currentUser.name);
    const [email, setEmail] = useState('diana.prince@example.com'); // Mock email

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
                                <CardDescription>Manage your public profile and account details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                        <AvatarFallback>{currentUser.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <Button variant="outline">Change Photo</Button>
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
