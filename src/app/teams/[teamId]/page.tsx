
"use client";

import React, { useMemo } from 'react';
import { notFound } from 'next/navigation';
import { initialTasks, users, teams } from '@/lib/data';
import type { Task, TaskStatus } from '@/types';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import TaskCard from '@/components/task-card';


const statusColors = {
  backlog: 'hsl(var(--muted-foreground))',
  todo: 'hsl(var(--primary))',
  'in-progress': 'hsl(var(--accent))',
  done: 'hsl(var(--chart-2))',
};

export default function TeamDetailPage({ params }: { params: { teamId: string } }) {
  const { teamId } = params;
  const team = teams.find(t => t.id === teamId);
  
  // Dummy handlers for filters and task creation for Header component
  const [filters, setFilters] = React.useState({ assignee: 'all', team: 'all', search: '' });
  const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'comments'>) => {};
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);


  const teamMembers = useMemo(() => {
    // This is a simplified logic. In a real app, you'd have a proper team-member relationship.
    // Here we'll just find tasks for this team and get the assignees.
    const memberIds = new Set<string>();
    initialTasks.forEach(task => {
      if (task.team.id === teamId && task.assignee) {
        memberIds.add(task.assignee.id);
      }
    });
    return users.filter(u => memberIds.has(u.id));
  }, [teamId]);
  
  const teamTasks = useMemo(() => {
    return initialTasks.filter(task => task.team.id === teamId);
  }, [teamId]);
  
  const progress = useMemo(() => {
    if (teamTasks.length === 0) return 0;
    const doneTasks = teamTasks.filter(t => t.status === 'done').length;
    return (doneTasks / teamTasks.length) * 100;
  }, [teamTasks]);
  
  const taskStatusDistribution = useMemo(() => {
    const distribution = {
      backlog: 0,
      todo: 0,
      'in-progress': 0,
      done: 0,
    };
    teamTasks.forEach(task => {
      distribution[task.status]++;
    });
    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value, fill: statusColors[name as TaskStatus] }))
      .filter(item => item.value > 0);
  }, [teamTasks]);
  
  if (!team) {
    return notFound();
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-muted/40">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header filters={filters} setFilters={setFilters} onCreateTask={handleCreateTask} />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
              <div className="flex -space-x-2 overflow-hidden">
                {teamMembers.map(member => (
                  <Avatar key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                  <CardDescription>Overall completion of tasks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} aria-label={`${Math.round(progress)}% complete`} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Task Distribution</CardTitle>
                  <CardDescription>Current tasks by status.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{}}
                    className="mx-auto aspect-square h-[200px]"
                  >
                    <PieChart>
                      <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={taskStatusDistribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                      >
                         {taskStatusDistribution.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                   <CardDescription>There are {teamMembers.length} members in this team.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                       <Avatar className="h-9 w-9">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.expertise}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Current Tasks</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {teamTasks.map(task => (
                  <TaskCard key={task.id} task={task} onSelectTask={setSelectedTask} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
