"use client";

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { SidebarInset } from '@/components/ui/sidebar';
import type { Task, Team } from '@/types';
import { getTasks, getTeams, addTask } from '@/app/actions';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import TaskDetailsSheet from '@/components/task-details-sheet';

const GalleryCanvas = dynamic(() => import('@/components/gallery-canvas'), {
    ssr: false,
    loading: () => <GallerySkeleton />
});


function GallerySkeleton() {
    return (
        <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
                <p className="text-lg font-semibold text-muted-foreground">Đang tải phòng trưng bày 3D...</p>
                <Skeleton className="h-4 w-48 mt-2 mx-auto" />
            </div>
        </div>
    )
}


export default function GalleryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [tasksData, teamsData] = await Promise.all([getTasks(), getTeams()]);
            setCompletedTasks(tasksData.filter(t => t.trangThai === 'Hoàn thành'));
            setTeams(teamsData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải dữ liệu cho phòng trưng bày.' });
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
        if (!authLoading && user) {
            fetchData();
        }
    }, [user, authLoading, router, fetchData]);

    const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'nhom' | 'nguoiThucHien' | 'ngayTao'>) => {
        await addTask(newTaskData);
        fetchData();
    };
    
    const handleUpdateTask = async () => {
        await fetchData();
        setSelectedTask(null);
    }
    
    const handleDeleteTask = async () => {
        await fetchData();
        setSelectedTask(null);
    }

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
            <Sidebar teams={teams} onTeamChange={fetchData} />
            <div className="flex flex-1 flex-col">
                <Header onCreateTask={handleCreateTask} />
                <SidebarInset>
                    <motion.main
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 p-4 sm:p-6 md:p-8"
                    >
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold tracking-tight">Phòng trưng bày Thành tựu</h1>
                            <p className="text-muted-foreground">Một không gian 3D để nhìn lại các công việc đã hoàn thành của đội bạn.</p>
                        </div>

                        <div className="w-full h-[600px] rounded-lg overflow-hidden border bg-card text-card-foreground shadow-sm">
                             {loading ? <GallerySkeleton /> : (
                                <Suspense fallback={<GallerySkeleton />}>
                                    <GalleryCanvas completedTasks={completedTasks} onSelectTask={setSelectedTask} />
                                </Suspense>
                            )}
                        </div>
                    </motion.main>
                </SidebarInset>
            </div>
             {selectedTask && (
                <TaskDetailsSheet
                    task={selectedTask}
                    users={[]}
                    teams={teams}
                    onOpenChange={(isOpen) => !isOpen && setSelectedTask(null)}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                />
            )}
        </div>
    );
}