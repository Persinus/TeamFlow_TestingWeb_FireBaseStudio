
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { getTasks, updateTaskStatus, addComment as apiAddComment, addTask as apiAddTask, getUsers, getTeams } from '@/lib/data';
import type { Task, TaskStatus, User, Team } from '@/types';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import TaskCard from '@/components/task-card';
import TaskDetailsSheet from '@/components/task-details-sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

function BoardSkeleton() {
  return (
    <div className="grid min-w-[1200px] grid-cols-4 gap-6">
      {columns.map(column => (
        <div key={column.id} className="flex h-full flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg bg-background p-3 shadow-sm">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-36 w-full rounded-lg" />
            <Skeleton className="h-36 w-full rounded-lg" />
            <Skeleton className="h-36 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<{ assignee: string; team: string, search: string }>({ assignee: 'all', team: 'all', search: '' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksData, usersData, teamsData] = await Promise.all([
        getTasks(),
        getUsers(),
        getTeams()
      ]);
      setTasks(tasksData);
      setUsers(usersData);
      setTeams(teamsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user, router, fetchData]);


  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const assigneeMatch = filters.assignee === 'all' || task.assignee?.id === filters.assignee;
      const teamMatch = filters.team === 'all' || task.team.id === filters.team;
      const searchMatch = filters.search === '' || task.title.toLowerCase().includes(filters.search.toLowerCase());
      return assigneeMatch && teamMatch && searchMatch;
    });
  }, [tasks, filters]);

  const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'comments' | 'team' | 'assignee'> & {teamId: string, assigneeId?: string}) => {
    await apiAddTask(newTaskData);
    fetchData(); // Refetch all data to get the new task
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    // This is a placeholder as we're not editing tasks directly from the board view
    // In a real app, you would have a function in data.ts like `updateTask`
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };
  
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    const originalTasks = tasks;
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? {...prev, status: newStatus} : null);
    }

    try {
        await updateTaskStatus(taskId, newStatus);
    } catch(error) {
        // Revert on failure
        setTasks(originalTasks);
        console.error("Failed to update status:", error);
    }
  };

  const handleAddComment = async (taskId: string, commentContent: string) => {
    if (!user) return;
    await apiAddComment(taskId, commentContent, user.id);
    
    // Refetch task to show new comment
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if(taskToUpdate) {
        const newComment = {
            id: `comment-${Date.now()}`, // Temporary ID
            author: user, // Optimistically use current user
            content: commentContent,
            createdAt: new Date().toISOString(),
        };
        const updatedTask = { ...taskToUpdate, comments: [...(taskToUpdate.comments || []), newComment]};
        
        setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
        if (selectedTask?.id === taskId) {
            setSelectedTask(updatedTask);
        }
    }
  };

  const tasksByStatus = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter(task => task.status === column.id).sort((a,b) => a.title.localeCompare(b.title));
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [filteredTasks]);

  if (authLoading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-muted/40 dark:bg-zinc-900/40">
      <Sidebar teams={teams} />
      <div className="flex flex-1 flex-col">
        <Header 
          users={users} 
          teams={teams} 
          filters={filters} 
          setFilters={setFilters} 
          onCreateTask={handleCreateTask} 
        />
        <SidebarInset>
            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-auto">
              {loading ? (
                <BoardSkeleton />
              ) : (
                <div className="grid min-w-[1200px] grid-cols-4 gap-6">
                  {columns.map(column => (
                    <div key={column.id} className="flex h-full flex-col gap-4">
                      <div className="flex items-center justify-between rounded-lg bg-background p-3 shadow-sm">
                        <h2 className="font-semibold text-foreground">{column.title}</h2>
                        <Badge variant="secondary" className="rounded-full">{tasksByStatus[column.id].length}</Badge>
                      </div>
                      <div className="flex flex-col gap-4">
                        {tasksByStatus[column.id].map(task => (
                          <TaskCard key={task.id} task={task} onSelectTask={setSelectedTask} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
        </SidebarInset>
      </div>
      {selectedTask && (
        <TaskDetailsSheet
            task={selectedTask}
            onOpenChange={(isOpen) => !isOpen && setSelectedTask(null)}
            onUpdateTask={handleUpdateTask}
            onAddComment={handleAddComment}
            onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
