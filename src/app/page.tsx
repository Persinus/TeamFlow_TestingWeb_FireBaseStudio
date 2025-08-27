
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getTasks, getTeams, getUsers } from '@/app/actions';
import type { Task, Team, User } from '@/types';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { differenceInDays, format, subDays, parseISO } from 'date-fns';
import { AlertCircle, CalendarIcon, CheckCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import TourGuide from '@/components/tour-guide';
import { Button } from '@/components/ui/button';

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

export default function HomePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [randomQuote, setRandomQuote] = useState(quotes[0]);
    const [isTourOpen, setIsTourOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            setLoading(true);
            Promise.all([getTasks(), getTeams()])
                .then(([taskData, teamData]) => {
                    setTasks(taskData.filter(t => t.nguoiThucHienId === user.id));
                    setTeams(teamData);
                })
                .finally(() => setLoading(false));
            
            setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        }
    }, [user, authLoading, router]);

    const taskCompletionData = useMemo(() => {
        const today = new Date();
        const last30Days = Array.from({ length: 30 }, (_, i) => subDays(today, i)).reverse();
        
        const completedTasksByDate = tasks
            .filter(t => t.trangThai === 'Hoàn thành' && t.ngayHetHan)
            .reduce((acc, task) => {
                const completedDateStr = task.ngayHetHan ? format(parseISO(task.ngayHetHan as string), 'yyyy-MM-dd') : '';
                if (completedDateStr) {
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
        const now = new Date();
        return tasks
            .filter(task => {
                if (task.trangThai === 'Hoàn thành' || !task.ngayHetHan) return false;
                const dueDate = parseISO(task.ngayHetHan as string);
                const daysDiff = differenceInDays(dueDate, now);
                return daysDiff >= 0 && daysDiff <= 7;
            })
            .sort((a, b) => parseISO(a.ngayHetHan as string).getTime() - parseISO(b.ngayHetHan as string).getTime());
    }, [tasks]);

    if (authLoading || !user) {
        return <div className="flex h-screen w-full items-center justify-center">Đang tải...</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
            <Sidebar teams={teams} onTeamChange={() => getTeams().then(setTeams)} onShowTour={() => setIsTourOpen(true)} />
            <div className="flex flex-1 flex-col">
                <Header onCreateTask={async () => {}} />
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
                        
                        {loading ? <DashboardSkeleton /> : (
                             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Tổng quan hoạt động</CardTitle>
                                        <CardDescription>Số lượng công việc bạn đã hoàn thành trong 30 ngày qua.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        {hasActivity ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={taskCompletionData}>
                                                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} allowDecimals={false} />
                                                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                             <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-[300px] gap-4 p-4 bg-muted/50 rounded-lg">
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
                                <div className="space-y-6">
                                    <Card className="bg-gradient-to-br from-accent/50 to-background">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2"><Lightbulb className="text-accent-foreground" /> Trích dẫn trong ngày</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <blockquote className="border-l-2 border-accent-foreground pl-4 italic">
                                                <p>"{randomQuote.text}"</p>
                                                <cite className="mt-2 block text-right font-semibold not-italic">— {randomQuote.author}</cite>
                                            </blockquote>
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
                                                    {upcomingTasks.map(task => (
                                                        <li key={task.id}>
                                                            <Link href={`/teams/${task.nhomId}`} className="block hover:bg-muted p-2 rounded-md transition-colors">
                                                                <p className="font-semibold truncate">{task.tieuDe}</p>
                                                                <div className={cn("text-sm flex items-center gap-1", differenceInDays(parseISO(task.ngayHetHan as string), new Date()) <= 3 ? 'text-destructive' : 'text-muted-foreground')}>
                                                                    <CalendarIcon className="h-4 w-4" />
                                                                    <span>Hết hạn vào {format(parseISO(task.ngayHetHan as string), 'PPP')}</span>
                                                                </div>
                                                            </Link>
                                                        </li>
                                                    ))}
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
                        )}
                       
                    </motion.main>
                </SidebarInset>
            </div>
            <TourGuide open={isTourOpen} onOpenChange={setIsTourOpen} />
        </div>
    );
}

    
