
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
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import CreateTaskSheet from '@/components/create-task-sheet';
import type { Task, User, Team } from '@/types';
import { MobileSidebar } from './sidebar';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { useToast } from '../hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from './icons';

interface HeaderProps {
  users: User[];
  teams: Team[];
  filters: { assignee: string; team: string; search: string };
  setFilters: React.Dispatch<React.SetStateAction<{ assignee: string; team: string; search: string }>>;
  onCreateTask: (newTaskData: Omit<Task, 'id' | 'nhom' | 'nguoiThucHien' | 'ngayTao'>) => Promise<void>;
  onShowTour?: () => void;
}

export default function Header({ users, teams, filters, setFilters, onCreateTask, onShowTour }: HeaderProps) {
  const [theme, setTheme] = useState('light');
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    const storedTheme = typeof window !== "undefined" ? localStorage.getItem('theme') || 'light' : 'light';
    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(f => ({ ...f, search: e.target.value }));
  };

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
                  // This is a dummy handler for mobile, page reload will fetch new teams.
                }}/>
            </SheetContent>
        </Sheet>
        
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm công việc theo tiêu đề hoặc thẻ..."
            className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[320px]"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex items-center gap-2">
            <Select value={filters.assignee} onValueChange={(value) => setFilters(f => ({...f, assignee: value}))}>
                <SelectTrigger className={cn("w-[150px] hidden md:flex", filters.assignee !== 'all' && 'text-primary border-primary')}>
                    <SelectValue placeholder="Lọc theo người được giao" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả người được giao</SelectItem>
                    <SelectItem value="unassigned">Chưa được giao</SelectItem>
                    <SelectSeparator />
                    {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.hoTen}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={filters.team} onValueChange={(value) => setFilters(f => ({...f, team: value}))}>
                <SelectTrigger className={cn("w-[150px] hidden md:flex", filters.team !== 'all' && 'text-primary border-primary')}>
                    <SelectValue placeholder="Lọc theo đội" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả các đội</SelectItem>
                    {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.tenNhom}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <CreateTaskSheet onCreateTask={onCreateTask} users={users} teams={teams}>
          <Button>Tạo công việc</Button>
        </CreateTaskSheet>

        {onShowTour && (
            <Button variant="outline" size="icon" onClick={onShowTour} aria-label="Hướng dẫn sử dụng">
                <HelpCircle className="h-5 w-5" />
            </Button>
        )}
        
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
    </header>
  );
}
