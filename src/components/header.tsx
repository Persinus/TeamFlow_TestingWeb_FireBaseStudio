
"use client";

import React, { useState, useEffect } from 'react';
import { Menu, Search, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CreateTaskSheet from '@/components/create-task-sheet';
import type { Task, User, Team } from '@/types';
import { MobileSidebar } from './sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from './icons';
import Link from 'next/link';
import { useToast } from '../hooks/use-toast';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  users: User[];
  teams: Team[];
  filters: { assignee: string; team: string; search: string };
  setFilters: React.Dispatch<React.SetStateAction<{ assignee: string; team: string; search: string }>>;
  onCreateTask: (newTaskData: Omit<Task, 'id' | 'comments' | 'team' | 'assignee'> & {teamId: string, assigneeId?: string}) => Promise<void>;
}

export default function Header({ users, teams, filters, setFilters, onCreateTask }: HeaderProps) {
  const [theme, setTheme] = useState('light');
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();


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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(f => ({ ...f, search: e.target.value }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({title: 'Logged out successfully'});
    } catch(error) {
      toast({title: 'Logout failed', variant: 'destructive'});
    }
  }

  const navigateToSettings = () => router.push('/settings');


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex w-full items-center gap-4">
        
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs p-0 sm:max-w-xs">
                <SheetHeader>
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                <MobileSidebar teams={teams} />
            </SheetContent>
        </Sheet>
        
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks by title..."
            className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[320px]"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex items-center gap-2">
            <Select value={filters.assignee} onValueChange={(value) => setFilters(f => ({...f, assignee: value}))}>
                <SelectTrigger className="w-[150px] hidden md:flex">
                    <SelectValue placeholder="Filter by assignee" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={filters.team} onValueChange={(value) => setFilters(f => ({...f, team: value}))}>
                <SelectTrigger className="w-[150px] hidden md:flex">
                    <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <CreateTaskSheet onCreateTask={onCreateTask} users={users} teams={teams}>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Create Task</Button>
        </CreateTaskSheet>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} data-ai-hint="woman face" />
                <AvatarFallback>{user?.name?.substring(0,2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={navigateToSettings}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme} className="gap-2">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
