
"use client";

import React, { useState, useEffect } from 'react';
import { Menu, Search, Moon, Sun, User as UserIcon, LogOut, Settings as SettingsIcon, HelpCircle } from 'lucide-react';
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
import CreateTaskSheet from '@/components/create-task-sheet';
import type { Task, User, Team } from '@/types';
import { MobileSidebar } from './sidebar';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { useToast } from '../hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from './icons';

interface HeaderProps {
  onCreateTask: (newTaskData: Omit<Task, 'id' | 'nhom' | 'nguoiThucHien' | 'ngayTao' > & { users: User[], teams: Team[] }) => Promise<void>;
}

export default function Header({ onCreateTask }: HeaderProps) {
  const [theme, setTheme] = useState('light');
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // State for CreateTaskSheet's dependencies
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);


  useEffect(() => {
    const storedTheme = typeof window !== "undefined" ? localStorage.getItem('theme') || 'light' : 'light';
    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, []);

  // Fetch users and teams for the CreateTaskSheet
  useEffect(() => {
    const fetchDataForSheet = async () => {
        // In a real app, you might want a more efficient way to get this data
        // but for now, this ensures the sheet has what it needs.
        const { getUsers, getTeams } = await import('@/app/actions');
        const [usersData, teamsData] = await Promise.all([getUsers(), getTeams()]);
        setUsers(usersData);
        setTeams(teamsData);
    }
    fetchDataForSheet();
  }, []);


  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    document.documentElement.style.colorScheme = newTheme;
  };
  
  useEffect(() => {
    const root = document.documentElement;
    root.style.colorScheme = theme;
  }, [theme]);


  const handleLogout = async () => {
    try {
      await logout();
      toast({title: 'Đăng xuất thành công'});
    } catch(error) {
      toast({title: 'Đăng xuất thất bại', variant: 'destructive'});
    }
  }

  const navigateToSettings = () => router.push('/settings');
  const navigateToProfile = () => router.push('/profile');

  const isBoardPage = pathname === '/board';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
      <div className="flex w-full items-center gap-4">
        
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Mở menu điều hướng</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs p-0 sm:max-w-xs">
                <SheetHeader>
                    <SheetTitle className="sr-only">Menu Điều hướng</SheetTitle>
                </SheetHeader>
                <MobileSidebar teams={teams} onTeamChange={() => {
                   const { getTeams } = require('@/app/actions');
                   getTeams().then(setTeams);
                }} onShowTour={() => {}}/>
            </SheetContent>
        </Sheet>
        
        <div className="flex-1" />

        <div className="flex items-center gap-2 ml-auto">
            <CreateTaskSheet onCreateTask={onCreateTask} users={users} teams={teams}>
            <Button>Tạo công việc</Button>
            </CreateTaskSheet>

            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.anhDaiDien} alt={user?.hoTen} data-ai-hint="woman face" />
                    <AvatarFallback>{user?.hoTen?.substring(0,2).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={navigateToProfile} className="gap-2">
                <UserIcon className="h-4 w-4" />
                <span>Hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={navigateToSettings} className="gap-2">
                <SettingsIcon className="h-4 w-4" />
                <span>Cài đặt</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme} className="gap-2">
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span>Chế độ {theme === 'light' ? 'Tối' : 'Sáng'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
