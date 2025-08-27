
"use client";

import React, { useMemo } from 'react';
import type { Task } from '@/types';
import { parseISO, format, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Package, Bug, Star } from 'lucide-react';

interface TimelineViewProps {
    tasks: Task[];
    onSelectTask: (task: Task) => void;
}

const getIconForTaskType = (type: Task['loaiCongViec']) => {
    switch (type) {
        case 'Tính năng': return <Star className="h-5 w-5" />;
        case 'Lỗi': return <Bug className="h-5 w-5" />;
        case 'Công việc': return <Package className="h-5 w-5" />;
        default: return <Package className="h-5 w-5" />;
    }
};

const safeGetDate = (date: string | Date | undefined): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    try {
        return parseISO(date);
    } catch {
        return null;
    }
}


export default function TimelineView({ tasks, onSelectTask }: TimelineViewProps) {

    const tasksByDate = useMemo(() => {
        const grouped: Record<string, Task[]> = {};
        const sortedTasks = [...tasks]
            .filter(t => t.ngayHetHan)
            .sort((a, b) => {
                const dateA = safeGetDate(a.ngayHetHan);
                const dateB = safeGetDate(b.ngayHetHan);
                if (!dateA || !dateB) return 0;
                return dateA.getTime() - dateB.getTime();
            });

        sortedTasks.forEach(task => {
            const dueDate = safeGetDate(task.ngayHetHan);
            if (dueDate) {
                const dateKey = format(dueDate, 'yyyy-MM-dd');
                if (!grouped[dateKey]) {
                    grouped[dateKey] = [];
                }
                grouped[dateKey].push(task);
            }
        });

        return Object.entries(grouped);
    }, [tasks]);

    if (tasksByDate.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-96 gap-4 p-4 bg-muted/50 rounded-lg">
                <Star className="h-12 w-12 text-accent" />
                <div>
                    <h3 className="font-semibold text-lg text-foreground">Không có công việc nào có ngày hết hạn</h3>
                    <p className="mt-1 max-w-md mx-auto">
                        Chỉ các công việc có ngày hết hạn mới được hiển thị ở đây. Hãy thử thêm ngày hết hạn cho một vài công việc!
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative pl-8">
            {/* The vertical timeline bar */}
            <div className="absolute left-8 top-0 h-full w-0.5 bg-border" />

            <div className="space-y-8">
                {tasksByDate.map(([date, tasksForDate]) => (
                    <div key={date} className="relative">
                        {/* Timeline dot */}
                        <div className={cn(
                            "absolute -left-[3px] top-1 h-3 w-3 rounded-full",
                            isSameDay(parseISO(date), new Date()) ? 'bg-primary ring-4 ring-primary/30' : 'bg-muted-foreground'
                        )} />
                        
                        <div className="pl-8">
                            <h3 className="font-semibold text-lg text-primary sticky top-16 bg-background/80 backdrop-blur-sm py-2 -mt-2 z-10">
                                {format(parseISO(date), "EEEE, 'ngày' d 'tháng' M, yyyy", { locale: vi })}
                            </h3>
                            <div className="grid gap-4 mt-2">
                                {tasksForDate.map(task => (
                                    <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelectTask(task)}>
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="flex-shrink-0 p-2 bg-secondary text-secondary-foreground rounded-full">
                                                {getIconForTaskType(task.loaiCongViec)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold">{task.tieuDe}</p>
                                                <p className="text-sm text-muted-foreground line-clamp-1">{task.moTa}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={task.trangThai === 'Hoàn thành' ? 'default' : 'secondary'}>{task.trangThai}</Badge>
                                                {task.nguoiThucHien ? (
                                                     <Avatar className="h-8 w-8">
                                                        <AvatarImage src={task.nguoiThucHien.anhDaiDien} />
                                                        <AvatarFallback>{task.nguoiThucHien.hoTen.substring(0,2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">?</div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
    
