
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getTasks, getTeamsForUser } from '@/app/actions';
import type { Task, Team, User } from '@/types';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { differenceInDays, format, subDays, parseISO, isBefore, startOfToday } from 'date-fns';
import { AlertCircle, CalendarIcon, CheckCircle, Lightbulb, ArrowRight, TrendingUp, Check, ListTodo } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const quotes = [
    { text: "Làm việc nhóm khiến giấc mơ thành hiện thực.", author: "Bang Gae" },
    { text: "Tài năng thắng các trận đấu, nhưng tinh thần đồng đội và trí tuệ giành chức vô địch.", author: "Michael Jordan" },
    { text: "Đoàn kết là sức mạnh... Khi có sự hợp tác và cộng tác, những điều tuyệt vời có thể đạt được.", author: "Mattie Stepanek" },
    { text: "Không ai trong chúng ta thông minh bằng tất cả chúng ta.", author: "Ken Blanchard" },
    { text: "Cách tốt nhất để dự đoán tương lai là tạo ra nó.", author: "Peter Drucker" }
];

function DashboardSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card className="lg:col-span-2">
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

const safeParseDate = (date: string | Date | undefined): Date | undefined => {
    if (!date) return undefined;
    if (date instanceof Date) return date;
    try {
        return parseISO(date);
    } catch (e) {
        return undefined;
    }
};

const getAIInsight = (tasks: Task[]) => {
    const total = tasks.length;
    if (total === 0) return "Bạn chưa có công việc nào. Hãy tạo một công việc mới để bắt đầu!";
    
    const completed = tasks.filter(t => t.trangThai === 'Hoàn thành').length;
    const overdue = tasks.filter(t => t.trangThai !== 'Hoàn thành' && t.ngayHetHan && isBefore(safeParseDate(t.ngayHetHan)!, startOfToday())).length;
    const backlog = tasks.filter(t => t.trangThai === 'Tồn đọng').length;

    if (overdue > total / 2) return "Bạn có nhiều công việc quá hạn. Hãy ưu tiên giải quyết chúng trước!";
    if (backlog > total / 2) return "Có vẻ như bạn có nhiều công việc trong backlog. Hãy xem xét và chuyển chúng sang 'Cần làm' nhé!";
    if (completed === total) return "Xuất sắc! Bạn đã hoàn thành tất cả công việc được giao. Hãy tiếp tục phát huy!";
    
    return "Bạn đang làm rất tốt. Hãy tiếp tục duy trì đà làm việc hiệu quả này!";
};


export default function HomePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [randomQuote, setRandomQuote] = useState(quotes[0]);

    const fetchData = useCallback(async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const [taskData, teamData] = await Promise.all([getTasks(), getTeamsForUser(userId)]);
            setTasks(taskData.filter(t => t.nguoiThucHienId === userId));
            setTeams(teamData);
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
            toast({
                variant: "destructive",
                title: "Lỗi tải dữ liệu",
                description: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchData(user.id);
            setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        }
    }, [user, authLoading, router, fetchData]);

    const taskCompletionData = useMemo(() => {
        const today = new Date();
        const last30Days = Array.from({ length: 30 }, (_, i) => subDays(today, i)).reverse();
        
        const completedTasksByDate = tasks
            .filter(t => t.trangThai === 'Hoàn thành' && t.ngayHetHan)
            .reduce((acc, task) => {
                const completedDate = safeParseDate(task.ngayHetHan);
                if (completedDate) {
                   const completedDateStr = format(completedDate, 'yyyy-MM-dd');
                   acc[completedDateStr] = (acc[completedDateStr] || 0) + 1;
                }
                return acc;
            }, {} as Record<string, number>);

        return last30Days.map(date => ({
            date: format(date, 'MMM d'),
            total: completedTasksByDate[format(date, 'yyyy-MM-dd')] || 0,
        }));
    }, [tasks]);
    
    const hasActivity = useMemo(() => taskCompletionData.some(d => d.total > 0), [taskCompletionData]);

    const upcomingTasks = useMemo(() => {
        const today = startOfToday();
        return tasks
            .filter(task => {
                if (task.trangThai === 'Hoàn thành' || !task.ngayHetHan) return false;
                const dueDate = safeParseDate(task.ngayHetHan);
                if (!dueDate) return false;
                
                const daysDiff = differenceInDays(dueDate, today);
                return daysDiff >= 0 && daysDiff <= 7;
            })
            .sort((a, b) => {
                const dateA = safeParseDate(a.ngayHetHan);
                const dateB = safeParseDate(b.ngayHetHan);
                if (!dateA || !dateB) return 0;
                return dateA.getTime() - dateB.getTime()
            });
    }, [tasks]);

    const userStats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.trangThai === 'Hoàn thành').length;
        const inProgress = tasks.filter(t => t.trangThai === 'Đang tiến hành').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, inProgress, completionRate };
    }, [tasks]);
    
    const aiInsight = useMemo(() => getAIInsight(tasks), [tasks]);


    if (authLoading || !user) {
        return <div className="flex h-screen w-full items-center justify-center">Đang tải...</div>;
    }
    
    const renderContent = () => {
        if (loading) {
            return <DashboardSkeleton />;
        }
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center text-center text-destructive-foreground h-96 gap-4 p-4 bg-destructive/80 rounded-lg">
                    <AlertCircle className="h-12 w-12" />
                    <div>
                        <h3 className="font-semibold text-lg">Đã xảy ra lỗi</h3>
                        <p className="mt-1 max-w-md mx-auto">{error}</p>
                    </div>
                    <Button variant="secondary" onClick={() => user && fetchData(user.id)}>Thử lại</Button>
                </div>
            );
        }
        
        return (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                     <div className="grid gap-6 sm:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tổng Công việc</CardTitle>
                                <ListTodo className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats.total}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Đã Hoàn thành</CardTitle>
                                <Check className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats.completed}</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tỷ lệ Hoàn thành</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats.completionRate}%</div>
                                <Progress value={userStats.completionRate} className="h-2 mt-1" />
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tổng quan hoạt động</CardTitle>
                            <CardDescription>Số lượng công việc bạn đã hoàn thành trong 30 ngày qua.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            {hasActivity ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={taskCompletionData}>
                                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} allowDecimals={false} />
                                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                 <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-[250px] gap-4 p-4 bg-muted/50 rounded-lg">
                                    <Lightbulb className="h-12 w-12 text-accent" />
                                    <div>
                                        <h3 className="font-semibold text-lg text-foreground">Chưa có hoạt động nào được ghi lại</h3>
                                        <p className="mt-1 max-w-md mx-auto">
                                            Bắt đầu làm việc để thấy biểu đồ của bạn được lấp đầy! Mời đồng đội và bắt đầu quản lý dự án cùng nhau.
                                        </p>
                                    </div>
                                    <Button asChild>
                                        <Link href="/board">
                                            Đi tới Bảng điều khiển <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-accent/50 to-background">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Lightbulb className="text-accent-foreground" /> Gợi ý cho bạn</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground">{aiInsight}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Công việc sắp tới</CardTitle>
                            <CardDescription>Các công việc của bạn sẽ hết hạn trong 7 ngày tới.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingTasks.length > 0 ? (
                                <ul className="space-y-3">
                                    {upcomingTasks.map(task => {
                                        const dueDate = safeParseDate(task.ngayHetHan);
                                        if (!dueDate) return null;
                                        return (
                                            <li key={task.id}>
                                                <Link href={`/board`} className="block hover:bg-muted p-2 rounded-md transition-colors">
                                                    <p className="font-semibold truncate">{task.tieuDe}</p>
                                                    <div className="flex justify-between items-center">
                                                         <div className={cn("text-sm flex items-center gap-1", differenceInDays(dueDate, new Date()) <= 3 ? 'text-destructive' : 'text-muted-foreground')}>
                                                            <CalendarIcon className="h-4 w-4" />
                                                            <span>Hết hạn vào {format(dueDate, 'PPP')}</span>
                                                        </div>
                                                        {task.nhom && <Badge variant="outline">{task.nhom.tenNhom}</Badge>}
                                                    </div>
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-6">
                                    <CheckCircle className="h-10 w-10 mb-2" />
                                    <p>Tuyệt vời!</p>
                                    <p className="text-sm">Bạn không có công việc nào sắp hết hạn.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
             </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
            <Sidebar teams={teams} onTeamChange={() => user && fetchData(user.id)} />
            <div className="flex flex-1 flex-col">
                <Header onCreateTask={async () => user && await fetchData(user.id)} />
                <SidebarInset>
                    <motion.main
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 p-4 sm:p-6 md:p-8"
                    >
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold tracking-tight">Chào mừng trở lại, {user.hoTen}!</h1>
                            <p className="text-muted-foreground">Đây là tổng quan nhanh về không gian làm việc của bạn.</p>
                        </div>
                        {renderContent()}
                    </motion.main>
                </SidebarInset>
            </div>
        </div>
    );
}

    