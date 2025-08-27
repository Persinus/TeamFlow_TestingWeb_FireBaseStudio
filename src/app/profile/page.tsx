

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { SidebarInset } from '@/components/ui/sidebar';
import { getTeams, getUsers, getTasksByAssignee, addTask, Task, updateTask, deleteTeam, updateTeam } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import TaskCard from '@/components/task-card';
import TaskDetailsSheet from '@/components/task-details-sheet';
import type { User, Team } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function ProfileSkeleton() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-64" />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-40" />
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-36 w-full" />
                    <Skeleton className="h-36 w-full" />
                    <Skeleton className="h-36 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}


export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const fetchData = useCallback(async (userId: string) => {
        setPageLoading(true);
        try {
            const [teamsData, usersData, tasksData] = await Promise.all([
                getTeams(),
                getUsers(),
                getTasksByAssignee(userId)
            ]);
            setTeams(teamsData);
            setUsers(usersData);
            setAssignedTasks(tasksData);
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Failed to load profile data."});
        } finally {
            setPageLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
        if (!authLoading && user) {
            fetchData(user.id);
        }
    }, [user, authLoading, router, fetchData]);

    // Dummy handlers for Header component
    const [filters, setFilters] = useState({ assignee: 'all', team: 'all', search: '' });
    const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'team' | 'assignee' | 'createdAt'>) => {
        await addTask(newTaskData);
        if(user) fetchData(user.id);
    };
    
    const handleUpdateTask = async (updatedTaskData: Omit<Task, 'team' | 'assignee'>) => {
         await updateTask(updatedTaskData.id, updatedTaskData);
         if(user) await fetchData(user.id);
         setSelectedTask(null);
    }
    
    if (authLoading || pageLoading || !user) {
        return (
            <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
                <Sidebar teams={teams} onTeamChange={() => user && fetchData(user.id)} />
                <div className="flex flex-1 flex-col">
                    <Header users={users} teams={teams} filters={filters} setFilters={setFilters} onCreateTask={handleCreateTask} />
                    <SidebarInset>
                        <main className="flex-1 p-4 sm:p-6 md:p-8">
                             <ProfileSkeleton />
                        </main>
                    </SidebarInset>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
            <Sidebar teams={teams} onTeamChange={() => fetchData(user.id)} />
            <div className="flex flex-1 flex-col">
                <Header users={users} teams={teams} filters={filters} setFilters={setFilters} onCreateTask={handleCreateTask} />
                <SidebarInset>
                    <motion.main 
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5 }}
                        className="flex-1 p-4 sm:p-6 md:p-8"
                    >
                        <div className="max-w-5xl mx-auto space-y-8">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <Avatar className="h-24 w-24 text-3xl">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="text-center sm:text-left">
                                    <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                                    <p className="text-muted-foreground">{user.email}</p>
                                    <p className="text-sm text-primary">{user.expertise}</p>
                                </div>
                            </div>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>My Assigned Tasks</CardTitle>
                                    <CardDescription>You have {assignedTasks.length} task(s) assigned to you.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {assignedTasks.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {assignedTasks.map(task => (
                                                <TaskCard key={task.id} task={task} onSelectTask={setSelectedTask} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No tasks are currently assigned to you. Enjoy the peace and quiet!</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </motion.main>
                </SidebarInset>
            </div>
             {selectedTask && (
                <TaskDetailsSheet
                    task={selectedTask}
                    users={users}
                    teams={teams}
                    onOpenChange={(isOpen) => !isOpen && setSelectedTask(null)}
                    onUpdateTask={handleUpdateTask}
                />
            )}
        </div>
    );
}
