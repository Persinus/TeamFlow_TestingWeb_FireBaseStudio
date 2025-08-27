
"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { getTeam, getUsers, getTasksByTeam, addTeamMember, removeTeamMember, updateTeamMemberRole, getTeams, updateTask, deleteTask, createTeam, updateTeam as apiUpdateTeam, deleteTeam as apiDeleteTeam, addTask } from '@/app/actions';
import type { Task, TrangThaiCongViec as TaskStatus, User, Team, VaiTroThanhVien as TeamMemberRole, LoaiCongViec } from '@/types';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip, BarChart, XAxis, YAxis, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';
import TaskCard from '@/components/task-card';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserPlus, Crown, Trash2, Shield, Edit } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import TaskDetailsSheet from '@/components/task-details-sheet';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const statusColors: Record<TaskStatus, string> = {
  'Tồn đọng': 'hsl(var(--muted-foreground))',
  'Cần làm': 'hsl(var(--chart-1))',
  'Đang tiến hành': 'hsl(var(--chart-3))',
  'Hoàn thành': 'hsl(var(--chart-2))',
};

const statusMap: Record<TaskStatus, string> = {
  'Tồn đọng': 'Tồn đọng',
  'Cần làm': 'Cần làm',
  'Đang tiến hành': 'Đang tiến hành',
  'Hoàn thành': 'Hoàn thành',
};

export default function TeamDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [teamTasks, setTeamTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [isEditTeamOpen, setEditTeamOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<{name: string, description: string}>({name: '', description: ''});
  const [userToAdd, setUserToAdd] = useState('');
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);


  const fetchData = useCallback(async () => {
    if (!teamId) return;
    try {
        setLoading(true);
        const [teamData, usersData, tasksData, allTeamsData] = await Promise.all([
            getTeam(teamId),
            getUsers(),
            getTasksByTeam(teamId),
            getTeams()
        ]);

        if (!teamData) {
            notFound();
            return;
        }

        setTeam(teamData);
        setTeamToEdit({name: teamData.tenNhom, description: teamData.moTa || ''});
        setAllUsers(usersData);
        setTeamTasks(tasksData);
        setAllTeams(allTeamsData);
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu đội:", error);
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải dữ liệu của đội.' });
    } finally {
        setLoading(false);
    }
  }, [teamId, toast]);

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
    }
    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user, router, fetchData]);

  const teamMembers = useMemo(() => {
    if (!team) return [];
    return team.thanhVien.map(member => {
      const userDetails = allUsers.find(u => u.id === member.thanhVienId);
      return userDetails ? { ...userDetails, vaiTro: member.vaiTro } : null;
    }).filter(Boolean) as (User & { vaiTro: TeamMemberRole })[];
  }, [team, allUsers]);
  
  const usersNotInTeam = useMemo(() => {
      if (!team) return [];
      const memberIds = new Set(teamMembers.map(m => m.id));
      return allUsers.filter(u => !memberIds.has(u.id));
  }, [team, allUsers, teamMembers]);

  const progress = useMemo(() => {
    if (teamTasks.length === 0) return 0;
    const doneTasks = teamTasks.filter(t => t.trangThai === 'Hoàn thành').length;
    return (doneTasks / teamTasks.length) * 100;
  }, [teamTasks]);
  
  const taskStatusDistribution = useMemo(() => {
    const distribution: Record<TaskStatus, number> = {
      'Tồn đọng': 0, 'Cần làm': 0, 'Đang tiến hành': 0, 'Hoàn thành': 0,
    };
    teamTasks.forEach(task => {
      distribution[task.trangThai]++;
    });
    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value, fill: statusColors[name as TaskStatus] }))
      .filter(item => item.value > 0);
  }, [teamTasks]);

  const memberPerformanceData = useMemo(() => {
    return teamMembers.map(member => {
        const memberTasks = teamTasks.filter(t => t.nguoiThucHienId === member.id);
        return {
            name: member.hoTen.split(' ').slice(-1).join(' '), // Short name
            todo: memberTasks.filter(t => t.trangThai === 'Cần làm').length,
            inProgress: memberTasks.filter(t => t.trangThai === 'Đang tiến hành').length,
            done: memberTasks.filter(t => t.trangThai === 'Hoàn thành').length,
        };
    });
  }, [teamMembers, teamTasks]);

  const taskTypeDistribution = useMemo(() => {
    const distribution: Record<LoaiCongViec, number> = { 'Tính năng': 0, 'Lỗi': 0, 'Công việc': 0 };
    teamTasks.forEach(task => {
        if (task.loaiCongViec) {
            distribution[task.loaiCongViec]++;
        }
    });
    return Object.entries(distribution)
        .map(([name, value], index) => ({ name, value, fill: `hsl(var(--chart-${index + 2}))` }))
        .filter(item => item.value > 0);
  }, [teamTasks]);

  const handleAddMember = async () => {
    if (!userToAdd || !team) return;
    try {
        await addTeamMember(team.id, userToAdd);
        toast({ title: 'Đã thêm thành viên', description: `${allUsers.find(u => u.id === userToAdd)?.hoTen} đã được thêm vào đội.` });
        fetchData(); // Refetch
    } catch (error) {
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể thêm thành viên.' });
    } finally {
        setAddMemberOpen(false);
        setUserToAdd('');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!team) return;
    try {
        await removeTeamMember(team.id, memberId);
        toast({ variant: 'destructive', title: 'Đã xóa thành viên', description: `${allUsers.find(u => u.id === memberId)?.hoTen} đã bị xóa khỏi đội.` });
        fetchData(); // Refetch
    } catch (error) {
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể xóa thành viên.' });
    }
  };

  const handleChangeRole = async (memberId: string, newRole: TeamMemberRole) => {
    if (!team) return;
     if (newRole === 'Thành viên' && team.thanhVien.filter(m => m.vaiTro === 'Trưởng nhóm').length === 1 && team.thanhVien.find(m => m.thanhVienId === memberId)?.vaiTro === 'Trưởng nhóm') {
        toast({ variant: 'destructive', title: 'Hành động bị từ chối', description: 'Một đội phải có ít nhất một đội trưởng.' });
        return;
    }
    try {
        await updateTeamMemberRole(team.id, memberId, newRole);
        toast({ title: 'Vai trò đã được cập nhật', description: `${allUsers.find(u => u.id === memberId)?.hoTen} giờ là một ${newRole}.` });
        fetchData(); // Refetch
    } catch (error) {
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể cập nhật vai trò.' });
    }
  };

  const handleUpdateTeam = async () => {
      if (!team) return;
      try {
        await apiUpdateTeam(team.id, { tenNhom: teamToEdit.name, moTa: teamToEdit.description });
        toast({ title: 'Đã cập nhật đội', description: 'Thông tin đội đã được cập nhật.'});
        setEditTeamOpen(false);
        fetchData();
      } catch (error) {
         toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể cập nhật thông tin đội.'});
      }
  }

  const handleDeleteTeam = async () => {
    if(!team) return;
    try {
        await apiDeleteTeam(team.id);
        toast({ title: 'Đã xóa đội', description: `Đội "${team.tenNhom}" đã được xóa.`, variant: 'destructive' });
        router.push('/');
    } catch (error) {
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể xóa đội.' });
    }
  }
  
  const handleUpdateTask = async (updatedTaskData: Omit<Task, 'nhom' | 'nguoiThucHien'>) => {
    await updateTask(updatedTaskData.id, updatedTaskData);
    await fetchData(); // Refetch all data to ensure consistency
    setSelectedTask(prev => prev ? {...prev, ...updatedTaskData} : null); // Optimistically update
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    fetchData();
    setSelectedTask(null);
  }

  const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'nhom' | 'nguoiThucHien' | 'ngayTao'>) => {
      await addTask(newTaskData);
      fetchData();
  };
  const handleTeamCreated = async () => {
    const teams = await getTeams();
    setAllTeams(teams);
  }

  if (authLoading || loading || !user) {
    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
            <Sidebar teams={[]} onTeamChange={() => {}} />
            <div className="flex flex-1 flex-col">
                <Header onCreateTask={handleCreateTask as any} />
                <SidebarInset>
                    <main className="flex-1 p-4 sm:p-6 md:p-8">
                        <Skeleton className="h-8 w-48 mb-8" />
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card><CardHeader><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-40" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                            <Card><CardHeader><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-40" /></CardHeader><CardContent><div className="flex justify-center items-center h-48"><Skeleton className="h-36 w-36 mx-auto rounded-full" /></div></CardContent></Card>
                            <Card><CardHeader><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-40" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
                        </div>
                         <Skeleton className="h-8 w-48 mt-8 mb-4" />
                         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            <Skeleton className="h-36 w-full rounded-lg" />
                            <Skeleton className="h-36 w-full rounded-lg" />
                            <Skeleton className="h-36 w-full rounded-lg" />
                         </div>
                    </main>
                </SidebarInset>
            </div>
        </div>
    );
  }
  
  if (!team) {
    return notFound();
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
      <Sidebar teams={allTeams} onTeamChange={handleTeamCreated} />
      <div className="flex flex-1 flex-col">
        <Header onCreateTask={handleCreateTask as any} />
        <SidebarInset>
            <motion.main 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 p-4 sm:p-6 md:p-8"
            >
              <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">{team.tenNhom}</h1>
                    <p className="text-muted-foreground">{team.moTa}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 overflow-hidden">
                        {teamMembers.slice(0, 5).map(member => (
                        <Avatar key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                            <AvatarImage src={member.anhDaiDien} alt={member.hoTen} />
                            <AvatarFallback>{member.hoTen.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        ))}
                         {teamMembers.length > 5 && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-background">
                                +{teamMembers.length - 5}
                            </div>
                        )}
                    </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditTeamOpen(true)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Chỉnh sửa đội</span>
                        </DropdownMenuItem>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> Xóa đội
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Bạn có chắc chắn muốn xóa đội này?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Hành động này sẽ xóa vĩnh viễn đội "{team.tenNhom}" và tất cả các công việc liên quan. Hành động này không thể được hoàn tác.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteTeam} className="bg-destructive hover:bg-destructive/90">Xóa vĩnh viễn</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Tabs defaultValue="overview">
                    <TabsList className="mb-4">
                        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                        <TabsTrigger value="analytics">Phân tích & Thống kê</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-8">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                            <CardTitle>Tiến độ dự án</CardTitle>
                            <CardDescription>Mức độ hoàn thành tổng thể của các công việc.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Đã hoàn thành</span>
                                <span className="font-semibold">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} aria-label={`${Math.round(progress)}% hoàn thành`} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                            <CardTitle>Phân bổ công việc</CardTitle>
                            <CardDescription>Các công việc hiện tại theo trạng thái.</CardDescription>
                            </CardHeader>
                            <CardContent>
                            <ChartContainer
                                config={{}}
                                className="mx-auto aspect-square h-[200px]"
                            >
                                <PieChart>
                                <Tooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={taskStatusDistribution}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={60}
                                    strokeWidth={5}
                                >
                                    {taskStatusDistribution.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                </PieChart>
                            </ChartContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle>Thành viên đội</CardTitle>
                                    <CardDescription>Có {teamMembers.length} thành viên trong đội này.</CardDescription>
                                </div>
                                <AlertDialog open={isAddMemberOpen} onOpenChange={setAddMemberOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button size="icon"><UserPlus className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Thêm thành viên vào {team.tenNhom}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Chọn một người dùng để thêm vào đội. Họ sẽ được thêm với vai trò 'Thành viên'.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <Select onValueChange={setUserToAdd} value={userToAdd}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn một người dùng" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {usersNotInTeam.map(u => (
                                                    <SelectItem key={u.id} value={u.id}>{u.hoTen}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleAddMember} disabled={!userToAdd}>Thêm thành viên</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardHeader>
                            <CardContent className="space-y-4">
                            {teamMembers.map(member => (
                                <div key={member.id} className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={member.anhDaiDien} alt={member.hoTen} />
                                    <AvatarFallback>{member.hoTen.substring(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                    <p className="font-semibold">{member.hoTen}</p>
                                    {member.vaiTro === 'Trưởng nhóm' && <Crown className="h-4 w-4 text-amber-500" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{member.chuyenMon}</p>
                                </div>
                                { user.id !== member.id && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {member.vaiTro === 'Thành viên' && (
                                            <DropdownMenuItem onClick={() => handleChangeRole(member.id, 'Trưởng nhóm')}><Crown className="mr-2 h-4 w-4" /> Đặt làm Trưởng nhóm</DropdownMenuItem>
                                        )}
                                        {member.vaiTro === 'Trưởng nhóm' && (
                                            <DropdownMenuItem onClick={() => handleChangeRole(member.id, 'Thành viên')}><Shield className="mr-2 h-4 w-4" /> Đặt làm Thành viên</DropdownMenuItem>
                                        )}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Bạn có chắc không?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Hành động này sẽ xóa vĩnh viễn {member.hoTen} khỏi đội. Hành động này không thể được hoàn tác.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleRemoveMember(member.id)} className="bg-destructive hover:bg-destructive/90">Xóa</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                )}
                                </div>
                            ))}
                            </CardContent>
                        </Card>
                        </div>
                        
                        <div>
                        <h2 className="text-2xl font-bold tracking-tight mb-4">Công việc hiện tại</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {teamTasks.map(task => (
                            <TaskCard key={task.id} task={task} onSelectTask={setSelectedTask} />
                            ))}
                            {teamTasks.length === 0 && <p className="text-muted-foreground col-span-full">Không tìm thấy công việc nào cho đội này.</p>}
                        </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="analytics" className="space-y-8">
                         <div className="grid gap-6 md:grid-cols-2">
                             <Card>
                                 <CardHeader>
                                     <CardTitle>Hiệu suất thành viên</CardTitle>
                                     <CardDescription>Số lượng công việc theo trạng thái của mỗi thành viên.</CardDescription>
                                 </CardHeader>
                                 <CardContent>
                                     <ChartContainer config={{}} className="h-[250px] w-full">
                                         <BarChart data={memberPerformanceData} layout="vertical" margin={{ left: 10, right: 10}}>
                                             <XAxis type="number" hide />
                                             <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                                             <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                             <Bar dataKey="todo" stackId="a" fill="hsl(var(--chart-1))" name="Cần làm" radius={[4, 0, 0, 4]} />
                                             <Bar dataKey="inProgress" stackId="a" fill="hsl(var(--chart-3))" name="Đang làm" />
                                             <Bar dataKey="done" stackId="a" fill="hsl(var(--chart-2))" name="Hoàn thành" radius={[0, 4, 4, 0]}/>
                                         </BarChart>
                                     </ChartContainer>
                                 </CardContent>
                             </Card>
                              <Card>
                                 <CardHeader>
                                     <CardTitle>Phân loại công việc</CardTitle>
                                     <CardDescription>Tỷ lệ các loại công việc trong đội.</CardDescription>
                                 </CardHeader>
                                 <CardContent>
                                     <ChartContainer config={{}} className="h-[250px] w-full">
                                        <PieChart>
                                            <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                                            <Pie data={taskTypeDistribution} dataKey="value" nameKey="name" startAngle={90} endAngle={-270}>
                                                 {taskTypeDistribution.map((entry) => (
                                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                     </ChartContainer>
                                 </CardContent>
                             </Card>
                         </div>
                    </TabsContent>
                </Tabs>

              </div>
            </motion.main>
        </SidebarInset>
      </div>
       {selectedTask && (
        <TaskDetailsSheet
            task={selectedTask}
            users={allUsers}
            teams={allTeams}
            onOpenChange={(isOpen) => !isOpen && setSelectedTask(null)}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
        />
       )}
        <Dialog open={isEditTeamOpen} onOpenChange={setEditTeamOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa đội</DialogTitle>
                    <DialogDescription>Cập nhật tên và mô tả cho đội của bạn.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="team-name" className="text-right">Tên</label>
                        <Input id="team-name" value={teamToEdit.name} onChange={(e) => setTeamToEdit(prev => ({ ...prev, name: e.target.value }))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                         <label htmlFor="team-desc" className="text-right">Mô tả</label>
                         <Textarea id="team-desc" value={teamToEdit.description} onChange={(e) => setTeamToEdit(prev => ({...prev, description: e.target.value}))} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setEditTeamOpen(false)}>Hủy</Button>
                    <Button onClick={handleUpdateTeam}>Lưu thay đổi</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
