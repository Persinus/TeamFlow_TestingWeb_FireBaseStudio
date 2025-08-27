
"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { getTeam, getUsers, getTasksByTeam, addTeamMember, removeTeamMember, updateTeamMemberRole, getTeams, createTeam } from '@/lib/data';
import type { Task, TaskStatus, User, Team, TeamMemberRole } from '@/types';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import TaskCard from '@/components/task-card';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserPlus, Crown, Trash2, Shield } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import TaskDetailsSheet from '@/components/task-details-sheet';

const statusColors = {
  backlog: 'hsl(var(--muted-foreground))',
  todo: 'hsl(var(--primary))',
  'in-progress': 'hsl(var(--accent))',
  done: 'hsl(var(--chart-2))',
};

export default function TeamDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [teamTasks, setTeamTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [userToAdd, setUserToAdd] = useState('');
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);


  const fetchData = useCallback(async () => {
    if (!teamId) return;
    try {
        setLoading(true);
        const [teamData, usersData, tasksData, allTeamsData] = await Promise.all([
            getTeam(teamId),
            getUsers(),
            getTasksByTeam(teamId),
            getTeams()
        ]);

        if (!teamData) {
            notFound();
            return;
        }

        setTeam(teamData);
        setAllUsers(usersData);
        setTeamTasks(tasksData);
        setAllTeams(allTeamsData);
    } catch (error) {
        console.error("Failed to fetch team data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load team data.' });
    } finally {
        setLoading(false);
    }
  }, [teamId, toast]);

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
    }
    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user, router, fetchData]);

  const teamMembers = useMemo(() => {
    if (!team) return [];
    return team.members.map(member => {
      const userDetails = allUsers.find(u => u.id === member.id);
      return userDetails ? { ...userDetails, role: member.role } : null;
    }).filter(Boolean) as (User & { role: TeamMemberRole })[];
  }, [team, allUsers]);
  
  const usersNotInTeam = useMemo(() => {
      if (!team) return [];
      const memberIds = new Set(team.members.map(m => m.id));
      return allUsers.filter(u => !memberIds.has(u.id));
  }, [team, allUsers]);

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

  const handleAddMember = async () => {
    if (!userToAdd || !team) return;
    try {
        await addTeamMember(team.id, userToAdd);
        toast({ title: 'Member Added', description: `${allUsers.find(u => u.id === userToAdd)?.name} has been added to the team.` });
        fetchData(); // Refetch
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to add member.' });
    } finally {
        setAddMemberOpen(false);
        setUserToAdd('');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!team) return;
    try {
        await removeTeamMember(team.id, memberId);
        toast({ variant: 'destructive', title: 'Member Removed', description: `${allUsers.find(u => u.id === memberId)?.name} has been removed from the team.` });
        fetchData(); // Refetch
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove member.' });
    }
  };

  const handleChangeRole = async (memberId: string, newRole: TeamMemberRole) => {
    if (!team) return;
     if (newRole === 'member' && team.members.filter(m => m.role === 'leader').length === 1 && team.members.find(m => m.id === memberId)?.role === 'leader') {
        toast({ variant: 'destructive', title: 'Action Denied', description: 'A team must have at least one leader.' });
        return;
    }
    try {
        await updateTeamMemberRole(team.id, memberId, newRole);
        toast({ title: 'Role Updated', description: `${allUsers.find(u => u.id === memberId)?.name} is now a ${newRole}.` });
        fetchData(); // Refetch
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update role.' });
    }
  };

  // Dummy handlers for Header
  const [filters, setFilters] = React.useState({ assignee: 'all', team: 'all', search: '' });
  const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'comments' | 'team' | 'assignee' | 'createdAt'>) => {};
  const handleTeamCreated = async () => {
    // This will just refetch all teams, and the sidebar will update.
    const teams = await getTeams();
    setAllTeams(teams);
  }

  if (authLoading || loading || !user) {
    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-muted/40">
            <Sidebar teams={[]} onTeamCreated={() => {}}/>
            <div className="flex flex-1 flex-col">
                <Header users={[]} teams={[]} filters={filters} setFilters={setFilters} onCreateTask={handleCreateTask as any} />
                <SidebarInset>
                    <main className="flex-1 p-4 sm:p-6 md:p-8">
                        <Skeleton className="h-8 w-48 mb-8" />
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card><CardHeader><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-40" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                            <Card><CardHeader><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-40" /></CardHeader><CardContent><div className="flex justify-center items-center h-48"><Skeleton className="h-36 w-36 mx-auto rounded-full" /></div></CardContent></Card>
                            <Card><CardHeader><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-40" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
                        </div>
                         <Skeleton className="h-8 w-48 mt-8 mb-4" />
                         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            <Skeleton className="h-36 w-full rounded-lg" />
                            <Skeleton className="h-36 w-full rounded-lg" />
                            <Skeleton className="h-36 w-full rounded-lg" />
                         </div>
                    </main>
                </SidebarInset>
            </div>
        </div>
    );
  }
  
  if (!team) {
    return notFound();
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-muted/40">
      <Sidebar teams={allTeams} onTeamCreated={handleTeamCreated} />
      <div className="flex flex-1 flex-col">
        <Header users={allUsers} teams={allTeams} filters={filters} setFilters={setFilters} onCreateTask={handleCreateTask as any} />
        <SidebarInset>
            <main className="flex-1 p-4 sm:p-6 md:p-8">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                    <p className="text-muted-foreground">{team.description}</p>
                  </div>
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
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>There are {teamMembers.length} members in this team.</CardDescription>
                        </div>
                        <AlertDialog open={isAddMemberOpen} onOpenChange={setAddMemberOpen}>
                            <AlertDialogTrigger asChild>
                                <Button size="icon"><UserPlus className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Add Member to {team.name}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Select a user to add to the team. They will be added as a 'member'.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <Select onValueChange={setUserToAdd} value={userToAdd}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {usersNotInTeam.map(u => (
                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleAddMember} disabled={!userToAdd}>Add Member</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {teamMembers.map(member => (
                        <div key={member.id} className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{member.name}</p>
                              {member.role === 'leader' && <Crown className="h-4 w-4 text-amber-500" />}
                            </div>
                            <p className="text-xs text-muted-foreground">{member.expertise}</p>
                          </div>
                          { user.id !== member.id && (
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                  {member.role === 'member' && (
                                    <DropdownMenuItem onClick={() => handleChangeRole(member.id, 'leader')}><Crown className="mr-2 h-4 w-4" /> Make Leader</DropdownMenuItem>
                                  )}
                                  {member.role === 'leader' && (
                                    <DropdownMenuItem onClick={() => handleChangeRole(member.id, 'member')}><Shield className="mr-2 h-4 w-4" /> Make Member</DropdownMenuItem>
                                  )}
                                  <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                          <AlertDialogHeader>
                                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                  This will permanently remove {member.name} from the team. This action cannot be undone.
                                              </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleRemoveMember(member.id)} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction>
                                          </AlertDialogFooter>
                                      </AlertDialogContent>
                                  </AlertDialog>
                              </DropdownMenuContent>
                          </DropdownMenu>
                          )}
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
                     {teamTasks.length === 0 && <p className="text-muted-foreground col-span-full">No tasks found for this team.</p>}
                  </div>
                </div>
              </div>
            </main>
        </SidebarInset>
      </div>
      {selectedTask && (
        <TaskDetailsSheet
            task={selectedTask}
            onOpenChange={(isOpen) => !isOpen && setSelectedTask(null)}
            onUpdateTask={() => {}}
            onAddComment={() => {}}
            onStatusChange={() => {}}
        />
       )}
    </div>
  );
}
