"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { initialTasks, users, teams, addTask } from '@/lib/data';
import type { Task, TaskStatus } from '@/types';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import TaskCard from '@/components/task-card';
import TaskDetailsSheet from '@/components/task-details-sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { SidebarInset } from '@/components/ui/sidebar';

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<{ assignee: string; team: string, search: string }>({ assignee: 'all', team: 'all', search: '' });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const assigneeMatch = filters.assignee === 'all' || task.assignee?.id === filters.assignee;
      const teamMatch = filters.team === 'all' || task.team.id === filters.team;
      const searchMatch = filters.search === '' || task.title.toLowerCase().includes(filters.search.toLowerCase());
      return assigneeMatch && teamMatch && searchMatch;
    });
  }, [tasks, filters]);

  const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'comments'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      comments: [],
    };
    const updatedTasks = addTask(newTask); // Add to the global-like source
    setTasks(updatedTasks); // Update local state to re-render
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };
  
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    // Also update selected task if it's the one being changed
    setSelectedTask(prev => prev && prev.id === taskId ? {...prev, status: newStatus} : prev);
  };

  const handleAddComment = (taskId: string, commentContent: string) => {
    const currentUser = users[3]; // Mock current user as Diana Prince for demo
    if (!currentUser) return;
    
    const newComment = {
      id: `comment-${Date.now()}`,
      author: currentUser,
      content: commentContent,
      createdAt: new Date().toISOString(),
    };
    
    let targetTask: Task | undefined;
    const newTasks = tasks.map(t => {
      if (t.id === taskId) {
        targetTask = { ...t, comments: [...t.comments, newComment] };
        return targetTask;
      }
      return t;
    });
    
    setTasks(newTasks);

    if (selectedTask?.id === taskId && targetTask) {
      setSelectedTask(targetTask);
    }
  };

  const tasksByStatus = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter(task => task.status === column.id).sort((a,b) => a.title.localeCompare(b.title));
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [filteredTasks]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-muted/40 dark:bg-zinc-900/40">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header filters={filters} setFilters={setFilters} onCreateTask={handleCreateTask} />
        <SidebarInset>
            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-auto">
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
            </main>
        </SidebarInset>
      </div>
      <TaskDetailsSheet
        task={selectedTask}
        onOpenChange={(isOpen) => !isOpen && setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onAddComment={handleAddComment}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
