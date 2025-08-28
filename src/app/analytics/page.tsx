
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTeamsForUser, getAnalyticsData } from '@/app/actions';
import type { Team, UserAnalyticsData } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { BarChart, Users } from 'lucide-react';

function AnalyticsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <Skeleton className="h-10 w-48" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-40" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                             <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/4" />
                                     <Skeleton className="h-4 w-3/4" />
                                </div>
                                <Skeleton className="h-6 w-1/4" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AnalyticsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [teams, setTeams] = useState<Team[]>([]);
    const [analyticsData, setAnalyticsData] = useState<UserAnalyticsData[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (teamId?: string) => {
        if (!user) return;
        setLoading(true);
        try {
            const [teamsData, data] = await Promise.all([
                getTeamsForUser(user.id),
                getAnalyticsData(teamId === 'all' ? undefined : teamId)
            ]);
            setTeams(teamsData);
            setAnalyticsData(data);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu phân tích:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
        if (!authLoading && user) {
            fetchData();
        }
    }, [user, authLoading, router, fetchData]);

    useEffect(() => {
        if (user) {
            fetchData(selectedTeam);
        }
    }, [selectedTeam, user, fetchData]);

    if (authLoading || !user) {
        return <div className="flex h-screen items-center justify-center">Đang tải...</div>;
    }
    
    const sortedAnalyticsData = useMemo(() => {
        return [...analyticsData].sort((a, b) => (b['Hoàn thành'] / b.total || 0) - (a['Hoàn thành'] / a.total || 0));
    }, [analyticsData]);

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
            <Sidebar teams={teams} onTeamChange={() => user && getTeamsForUser(user.id).then(setTeams)} />
            <div className="flex flex-1 flex-col">
                <Header onCreateTask={async () => await fetchData(selectedTeam)} />
                <SidebarInset>
                    <motion.main 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 p-4 sm:p-6 md:p-8"
                    >
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">Báo cáo & Phân tích</h1>
                                    <p className="text-muted-foreground">Theo dõi hiệu suất và phân bổ công việc của các thành viên.</p>
                                </div>
                                <div className="w-full sm:w-auto">
                                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                                        <SelectTrigger className="w-full sm:w-[200px]">
                                            <SelectValue placeholder="Chọn đội" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả các đội</SelectItem>
                                            {teams.map(team => (
                                                <SelectItem key={team.id} value={team.id}>{team.tenNhom}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            {loading ? <AnalyticsSkeleton /> : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Báo cáo hiệu suất thành viên</CardTitle>
                                        <CardDescription>
                                            Tổng quan về số lượng công việc được giao và tiến độ hoàn thành của mỗi thành viên trong {selectedTeam === 'all' ? 'tất cả các đội' : teams.find(t => t.id === selectedTeam)?.tenNhom}.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[300px]">Thành viên</TableHead>
                                                    <TableHead>Tiến độ</TableHead>
                                                    <TableHead className="text-center">Tồn đọng</TableHead>
                                                    <TableHead className="text-center">Cần làm</TableHead>
                                                    <TableHead className="text-center">Đang làm</TableHead>
                                                    <TableHead className="text-center">Hoàn thành</TableHead>
                                                    <TableHead className="text-center">Tổng cộng</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sortedAnalyticsData.length > 0 ? sortedAnalyticsData.map(data => {
                                                    const progress = data.total > 0 ? (data['Hoàn thành'] / data.total) * 100 : 0;
                                                    return (
                                                        <TableRow key={data.userId}>
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar>
                                                                        <AvatarImage src={data.anhDaiDien} />
                                                                        <AvatarFallback>{data.hoTen.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="font-medium">{data.hoTen}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <Progress value={progress} className="w-32" />
                                                                    <span className="text-muted-foreground text-sm">{Math.round(progress)}%</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">{data['Tồn đọng']}</TableCell>
                                                            <TableCell className="text-center">{data['Cần làm']}</TableCell>
                                                            <TableCell className="text-center">{data['Đang tiến hành']}</TableCell>
                                                            <TableCell className="text-center font-semibold text-green-600">{data['Hoàn thành']}</TableCell>
                                                            <TableCell className="text-center font-bold">{data.total}</TableCell>
                                                        </TableRow>
                                                    );
                                                }) : (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                            Không có dữ liệu để hiển thị.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </motion.main>
                </SidebarInset>
            </div>
        </div>
    );
}
