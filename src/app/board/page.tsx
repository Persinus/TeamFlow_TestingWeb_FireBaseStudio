

"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { getTasks, updateTaskStatus, getUsers, getTeamsForUser, updateTask, deleteTask as apiDeleteTask } from '@/app/actions';
import type { Task, TrangThaiCongViec as TaskStatus, User, Team } from '@/types';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import TaskCard from '@/components/task-card';
import TaskDetailsSheet from '@/components/task-details-sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LayoutGrid, CalendarDays, GanttChartSquare, ListTree } from 'lucide-react';
import CalendarView from '@/components/calendar-view';
import TimelineView from '@/components/timeline-view';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';


const columns: { id: TaskStatus; title: string }[] = [
  { id: 'Tồn đọng', title: 'Tồn đọng' },
  { id: 'Cần làm', title: 'Cần làm' },
  { id: 'Đang tiến hành', title: 'Đang làm' },
  { id: 'Hoàn thành', title: 'Hoàn thành' },
];


function DroppableColumn({ id, title, children, isDragOver, isCompact }: { id: string; title: string; children: React.ReactNode; isDragOver: boolean, isCompact: boolean }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <motion.div
      ref={setNodeRef}
      className={cn("flex h-full flex-col gap-2 rounded-lg transition-colors", isDragOver ? "bg-primary/10" : "")}
    >
      <div className="flex items-center justify-between rounded-lg bg-card p-3 shadow-sm border">
        <h2 className="font-semibold text-foreground">{title}</h2>
        <Badge variant="secondary" className="rounded-full">{React.Children.count(children)}</Badge>
      </div>
      <motion.div 
        layout
        className={cn("flex flex-col", isCompact ? "gap-1.5" : "gap-4")}
      >
        <AnimatePresence>
            {children}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}


function BoardSkeleton() {
  return (
    <div className="grid min-w-[1200px] grid-cols-4 gap-6">
      {columns.map(column => (
        <div key={column.id} className="flex h-full flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg bg-card p-3 shadow-sm border">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}


export default function BoardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<{ assignee: string; team: string; search: string }>({ assignee: 'all', team: 'all', search: '' });

  const [viewMode, setViewMode] = useState<'board' | 'calendar' | 'timeline'>('board');
  const [isCompactView, setIsCompactView] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));
  const activeTask = useMemo(() => tasks.find(t => t.id === activeId), [tasks, activeId]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [tasksData, usersData, teamsData] = await Promise.all([
        getTasks(),
        getUsers(),
        getTeamsForUser(user.id)
      ]);
      setTasks(tasksData);
      setUsers(usersData);
      setTeams(teamsData);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải dữ liệu dashboard.' });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

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
      if (!task) return false;
      
      let assigneeMatch = true;
      if (filters.assignee === 'all') {
        assigneeMatch = true;
      } else if (filters.assignee === 'unassigned') {
        assigneeMatch = !task.nguoiThucHienId;
      } else {
        assigneeMatch = task.nguoiThucHien?.id === filters.assignee;
      }

      const teamMatch = filters.team === 'all' || task.nhom?.id === filters.team;
      const searchMatch = filters.search === '' || task.tieuDe.toLowerCase().includes(filters.search.toLowerCase()) || (task.tags && task.tags.some(t => t.toLowerCase().includes(filters.search.toLowerCase())));
      return assigneeMatch && teamMatch && searchMatch;
    });
  }, [tasks, filters]);
  
  const handleUpdateTask = async (updatedTaskData: Omit<Task, 'nhom' | 'nguoiThucHien'>) => {
    const updatedTask = await updateTask(updatedTaskData.id, updatedTaskData);
    await fetchData(); 
    setSelectedTask(updatedTask); 
  };


  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const originalTasks = tasks;
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, trangThai: newStatus } : task
    );
    setTasks(updatedTasks);
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? {...prev, trangThai: newStatus} : null);
    }

    try {
        await updateTaskStatus(taskId, newStatus);
    } catch(error) {
        setTasks(originalTasks);
        console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };
  
  const tasksByStatus = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter(task => task.trangThai === column.id).sort((a,b) => a.tieuDe.localeCompare(b.tieuDe));
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [filteredTasks]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    setOverId(over ? over.id as string : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (active.id !== over?.id && over?.id) {
        const newStatus = over.id as TaskStatus;
        const taskId = active.id as string;
        
        const task = tasks.find(t => t.id === taskId);
        if (task && task.trangThai !== newStatus && columns.some(c => c.id === newStatus)) {
            handleStatusChange(taskId, newStatus);
            toast({
              title: "Công việc đã được di chuyển",
              description: `"${task.tieuDe}" đã được chuyển đến ${columns.find(c => c.id === newStatus)?.title}.`
            })
        }
    }
    setActiveId(null);
    setOverId(null);
  }


  if (authLoading || !user) {
    return <div className="flex h-screen items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
      <Sidebar teams={teams} onTeamChange={fetchData} />
      <div className="flex flex-1 flex-col">
        <Header 
          onCreateTask={fetchData}
        />
        <SidebarInset>
            <motion.main 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-auto"
            >
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển dự án</h1>
                  <p className="text-muted-foreground">{viewMode === 'board' ? "Kéo và thả các công việc để thay đổi trạng thái." : viewMode === 'calendar' ? "Xem công việc theo ngày hết hạn." : "Xem lộ trình công việc theo dòng thời gian."}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Tìm kiếm..."
                        className="w-full rounded-lg bg-secondary pl-8 md:w-[200px]"
                        value={filters.search}
                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                        />
                    </div>
                     <Select value={filters.assignee} onValueChange={(value) => setFilters(f => ({...f, assignee: value}))}>
                        <SelectTrigger className={cn("w-full md:w-[170px]", filters.assignee !== 'all' && 'text-primary border-primary')}>
                            <SelectValue placeholder="Lọc theo người được giao" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả người được giao</SelectItem>
                            <SelectItem value="unassigned">Chưa được giao</SelectItem>
                            <SelectSeparator />
                            {users.map(user => (
                                <SelectItem key={user.id} value={user.id}>{user.hoTen}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filters.team} onValueChange={(value) => setFilters(f => ({...f, team: value}))}>
                        <SelectTrigger className={cn("w-full md:w-[170px]", filters.team !== 'all' && 'text-primary border-primary')}>
                            <SelectValue placeholder="Lọc theo đội" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả các đội</SelectItem>
                            {teams.map(team => (
                                <SelectItem key={team.id} value={team.id}>{team.tenNhom}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2 rounded-lg bg-card border p-1 shadow-sm">
                        <Button variant={viewMode === 'board' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('board')} aria-label="Chế độ xem bảng">
                            <LayoutGrid className="h-5 w-5" />
                        </Button>
                        <Button variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('calendar')} aria-label="Chế độ xem lịch">
                            <CalendarDays className="h-5 w-5" />
                        </Button>
                        <Button variant={viewMode === 'timeline' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('timeline')} aria-label="Chế độ xem dòng thời gian">
                            <GanttChartSquare className="h-5 w-5" />
                        </Button>
                         <Button variant={isCompactView ? 'secondary' : 'ghost'} size="icon" onClick={() => setIsCompactView(v => !v)} aria-label="Chế độ xem nhỏ gọn">
                            <ListTree className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
              </div>
              {loading ? (
                <BoardSkeleton />
              ) : viewMode === 'board' ? (
                <DndContext 
                  sensors={sensors}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                >
                  <div className="grid min-w-[1200px] grid-cols-4 gap-6">
                    {columns.map(column => (
                      <DroppableColumn key={column.id} id={column.id} title={column.title} isDragOver={overId === column.id} isCompact={isCompactView}>
                        {tasksByStatus[column.id].map(task => (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onSelectTask={setSelectedTask} 
                            isDragging={activeId === task.id}
                            isCompact={isCompactView}
                          />
                        ))}
                      </DroppableColumn>
                    ))}
                  </div>
                  {typeof document !== "undefined" && createPortal(
                     <DragOverlay>
                        {activeTask ? <TaskCard task={activeTask} isDragging isCompact={isCompactView} /> : null}
                     </DragOverlay>,
                     document.body
                  )}
                </DndContext>
              ) : viewMode === 'calendar' ? (
                <CalendarView tasks={filteredTasks} onSelectTask={setSelectedTask} />
              ) : (
                 <TimelineView tasks={filteredTasks} onSelectTask={setSelectedTask} />
              )}
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
            onTaskDeleted={fetchData}
        />
      )}
    </div>
  );
}
