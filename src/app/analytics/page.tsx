

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { getTeamsForUser, getAnalyticsData } from '@/app/actions';
import type { Team, UserAnalyticsData } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { BarChart as BarChartIcon, Users, Download, PieChart as PieChartIcon, Check, ChevronsUpDown } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from '@/lib/utils';


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
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader><Skeleton className="h-7 w-40" /></CardHeader>
                    <CardContent><Skeleton className="h-64 w-full" /></CardContent>
                </Card>
                <Card>
                    <CardHeader><Skeleton className="h-7 w-40" /></CardHeader>
                    <CardContent><Skeleton className="h-64 w-full" /></CardContent>
                </Card>
             </div>
        </div>
    );
}

function TeamCombobox({ teams, value, onChange }: { teams: Team[], value: string, onChange: (value: string) => void }) {
    const [open, setOpen] = useState(false)

    const teamOptions = [{ id: "all", tenNhom: "Tất cả các đội" }, ...teams];

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full sm:w-[200px] justify-between"
          >
            {value
              ? teamOptions.find((team) => team.id === value)?.tenNhom
              : "Chọn đội..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Tìm đội..." />
            <CommandList>
                <CommandEmpty>Không tìm thấy đội nào.</CommandEmpty>
                <CommandGroup>
                {teamOptions.map((team) => (
                    <CommandItem
                    key={team.id}
                    value={team.id}
                    onSelect={(currentValue) => {
                        onChange(currentValue === value ? "" : currentValue)
                        setOpen(false)
                    }}
                    >
                    <Check
                        className={cn(
                        "mr-2 h-4 w-4",
                        value === team.id ? "opacity-100" : "opacity-0"
                        )}
                    />
                    {team.tenNhom}
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
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

    const sortedAnalyticsData = useMemo(() => {
        return [...analyticsData].sort((a, b) => (b['Hoàn thành'] / b.total || 0) - (a['Hoàn thành'] / a.total || 0));
    }, [analyticsData]);

    const totalTaskByType = useMemo(() => {
        const totals = { 'Tính năng': 0, 'Lỗi': 0, 'Công việc': 0 };
        analyticsData.forEach(user => {
            totals['Tính năng'] += user.byType['Tính năng'];
            totals['Lỗi'] += user.byType['Lỗi'];
            totals['Công việc'] += user.byType['Công việc'];
        });
        return Object.entries(totals)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0);
    }, [analyticsData]);

    const handleExport = () => {
        const headers = ["Thành viên", "Tổng cộng", "Tồn đọng", "Cần làm", "Đang tiến hành", "Hoàn thành", "Tiến độ (%)"];
        const rows = sortedAnalyticsData.map(data => [
            data.hoTen,
            data.total,
            data['Tồn đọng'],
            data['Cần làm'],
            data['Đang tiến hành'],
            data['Hoàn thành'],
            Math.round(data.total > 0 ? (data['Hoàn thành'] / data.total) * 100 : 0)
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    if (authLoading || !user) {
        return <div className="flex h-screen items-center justify-center">Đang tải...</div>;
    }
    
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
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">Báo cáo & Phân tích</h1>
                                    <p className="text-muted-foreground">Theo dõi hiệu suất và phân bổ công việc của các thành viên.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                     <TeamCombobox 
                                        teams={teams}
                                        value={selectedTeam}
                                        onChange={setSelectedTeam}
                                     />
                                    <Button onClick={handleExport} disabled={analyticsData.length === 0}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Xuất ra CSV
                                    </Button>
                                </div>
                            </div>
                            
                            {loading ? <AnalyticsSkeleton /> : (
                                <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <Card className="lg:col-span-2">
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
                                                    <TableHead className="text-center">Đang tiến hành</TableHead>
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
                                     <Card>
                                        <CardHeader>
                                            <CardTitle>Phân loại Công việc</CardTitle>
                                            <CardDescription>Tỷ lệ các loại công việc trong phạm vi đã chọn.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                             <ChartContainer config={{}} className="mx-auto aspect-square h-[250px]">
                                                <PieChart>
                                                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                                    <Pie data={totalTaskByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                        <Cell key="cell-0" fill="hsl(var(--chart-1))" />
                                                        <Cell key="cell-1" fill="hsl(var(--chart-2))" />
                                                        <Cell key="cell-2" fill="hsl(var(--chart-3))" />
                                                    </Pie>
                                                </PieChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                                </div>
                            )}
                        </div>
                    </motion.main>
                </SidebarInset>
            </div>
        </div>
    );
}
