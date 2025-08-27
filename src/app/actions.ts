
"use server";

import type { User, Team, Task, TaskStatus, TeamMemberRole } from '@/types';
import connectToDatabase from '@/lib/mongodb';
import { User as UserModel, Team as TeamModel, Task as TaskModel } from '@/lib/models';
import { MOCK_USERS } from '@/lib/mock-data';
import { suggestTaskAssignee } from "@/ai/flows/suggest-task-assignee";
import type { SuggestTaskAssigneeInput } from "@/ai/flows/suggest-task-assignee";
import { revalidatePath } from 'next/cache';

// --- AI Sugggestion Action ---
export async function getAssigneeSuggestion(input: SuggestTaskAssigneeInput) {
    try {
        const result = await suggestTaskAssignee(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("AI suggestion failed:", error);
        return { success: false, error: "Failed to get AI suggestion." };
    }
}


// --- Task Functions ---
const populateTask = (task: any): Task => {
    // A helper to ensure the populated task has the correct shape
    return {
      ...task,
      id: task._id.toString(),
      team: task.team ? { ...task.team, id: task.team._id.toString(), members: task.team.members.map((m: any) => ({...m, id: m.user?._id.toString()})) } : undefined,
      assignee: task.assignee ? { ...task.assignee, id: task.assignee._id.toString() } : undefined,
    } as unknown as Task;
}

export const getTasks = async (): Promise<Task[]> => {
    await connectToDatabase();
    const tasks = await TaskModel.find()
        .populate({ path: 'team', populate: { path: 'members.user' }})
        .populate('assignee')
        .lean();
    return tasks.map(populateTask);
};

export const getTasksByAssignee = async (assigneeId: string): Promise<Task[]> => {
    await connectToDatabase();
    const tasks = await TaskModel.find({ assignee: assigneeId })
        .populate({ path: 'team', populate: { path: 'members.user' }})
        .populate('assignee')
        .lean();
    return tasks.map(populateTask);
};

export const getTask = async (id: string): Promise<Task | undefined> => {
    await connectToDatabase();
    const task = await TaskModel.findById(id)
        .populate({ path: 'team', populate: { path: 'members.user' }})
        .populate('assignee')
        .lean();
    if (!task) return undefined;
    return populateTask(task);
};

export const getTasksByTeam = async (teamId: string): Promise<Task[]> => {
    await connectToDatabase();
    const tasks = await TaskModel.find({ team: teamId })
        .populate({ path: 'team', populate: { path: 'members.user' }})
        .populate('assignee')
        .lean();
    return tasks.map(populateTask);
};

export const addTask = async (taskData: Omit<Task, 'id' | 'team' | 'assignee' | 'createdAt'>): Promise<string> => {
    await connectToDatabase();
    const newTask = new TaskModel({
        ...taskData,
        _id: `task-${Date.now()}`,
        assignee: taskData.assigneeId || null, // Handle 'unassigned'
        team: taskData.teamId,
    });
    await newTask.save();
    revalidatePath('/');
    revalidatePath(`/teams/${taskData.teamId}`);
    return newTask._id.toString();
};

export const updateTask = async (taskId: string, taskData: Partial<Omit<Task, 'id' | 'team' | 'assignee'>>): Promise<void> => {
    await connectToDatabase();
    // Make sure to handle assigneeId correctly
    const updateData: any = { ...taskData };
    if (updateData.assigneeId === 'unassigned' || updateData.assigneeId === undefined || updateData.assigneeId === null) {
      updateData.assignee = null;
    } else {
      updateData.assignee = updateData.assigneeId;
    }
    
    updateData.team = updateData.teamId;

    delete updateData.assigneeId;
    delete updateData.teamId;

    await TaskModel.findByIdAndUpdate(taskId, updateData);
    revalidatePath('/');
    revalidatePath(`/teams/${taskData.teamId}`);
    if (taskData.assigneeId) {
        revalidatePath(`/profile`);
    }
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<void> => {
    await connectToDatabase();
    await TaskModel.findByIdAndUpdate(taskId, { status });
    revalidatePath('/');
};

// --- Tag Functions ---
export const getAllTags = async (): Promise<string[]> => {
    await connectToDatabase();
    const tags = await TaskModel.distinct('tags');
    return tags.filter(tag => tag !== null);
};

// --- User Functions ---
export const getUsers = async (): Promise<User[]> => {
    await connectToDatabase();
    // Using lean() for performance and to get plain JS objects
    const users = await UserModel.find().lean();
    // Mongoose uses _id, but our app uses id. Let's map it.
    return users.map(u => ({ ...u, id: u._id.toString() })) as unknown as User[];
};

export const getUser = async (id: string): Promise<User | undefined> => {
    await connectToDatabase();
    const user = await UserModel.findById(id).lean();
    if (!user) return undefined;
    return { ...user, id: user._id.toString() } as unknown as User;
};

export const updateUser = async (userId: string, userData: Partial<Pick<User, 'name' | 'avatar' | 'phone' | 'dob'>>): Promise<User | undefined> => {
    await connectToDatabase();
    const updatedUser = await UserModel.findByIdAndUpdate(userId, userData, { new: true }).lean();
    if (!updatedUser) return undefined;
    revalidatePath('/settings');
    revalidatePath('/profile');
    return { ...updatedUser, id: updatedUser._id.toString() } as unknown as User;
};

export const getMockUserByEmail = async (email: string): Promise<User | undefined> => {
    // This is a temporary function to support the mock auth system.
    // In a real app, this would query the database.
    return getUsers().then(users => users.find(u => u.email.toLowerCase() === email.toLowerCase()));
};


// --- Team Functions ---
export const getTeams = async (): Promise<Team[]> => {
    await connectToDatabase();
    const teams = await TeamModel.find().populate('members.user').lean();
    return teams.map(t => ({ 
        ...t, 
        id: t._id.toString(),
        members: t.members.map((m: any) => ({...m, user: {...m.user, id: m.user._id.toString()}}))
    })) as unknown as Team[];
};

export const getTeam = async (id: string): Promise<Team | undefined> => {
    await connectToDatabase();
    const team = await TeamModel.findById(id).populate('members.user').lean();
    if (!team) return undefined;
    
    // Manually map user objects to have 'id' property
    const populatedMembers = team.members.map((m: any) => ({
        ...m,
        id: m.user._id.toString(), // The user ID for the team member list
        user: {
            ...m.user,
            id: m.user._id.toString()
        }
    }));
    
    return { ...team, id: team._id.toString(), members: populatedMembers } as unknown as Team;
};

export const createTeam = async (teamData: Pick<Team, 'name' | 'description'>, leaderId: string): Promise<string> => {
    await connectToDatabase();
    const leader = await UserModel.findOne({_id: leaderId});
    if (!leader) throw new Error("Leader not found");

    const newTeam = new TeamModel({
        _id: `team-${teamData.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
        name: teamData.name,
        description: teamData.description,
        members: [{ user: leader._id, role: 'leader' }],
    });
    await newTeam.save();
    revalidatePath('/settings');
    revalidatePath('/');
    return newTeam._id.toString();
};

export const updateTeam = async (teamId: string, teamData: Partial<Pick<Team, 'name' | 'description'>>): Promise<void> => {
    await connectToDatabase();
    await TeamModel.findByIdAndUpdate(teamId, teamData);
    revalidatePath('/settings');
    revalidatePath('/');
    revalidatePath(`/teams/${teamId}`);
};

export const deleteTeam = async (teamId: string): Promise<void> => {
    await connectToDatabase();
    await TeamModel.findByIdAndDelete(teamId);
    // Also delete tasks associated with this team
    await TaskModel.deleteMany({ team: teamId });
    revalidatePath('/settings');
    revalidatePath('/');
};

export const addTeamMember = async (teamId: string, userId: string): Promise<void> => {
    await connectToDatabase();
    const team = await TeamModel.findById(teamId);
    if (team) {
        // @ts-ignore
        if (!team.members.some(m => m.user.equals(userId))) {
            // @ts-ignore
            team.members.push({ user: userId, role: 'member' });
            await team.save();
        }
    }
    revalidatePath(`/teams/${teamId}`);
};

export const removeTeamMember = async (teamId: string, userId: string): Promise<void> => {
    await connectToDatabase();
    await TeamModel.findByIdAndUpdate(teamId, {
        $pull: { members: { user: userId } }
    });
    revalidatePath(`/teams/${teamId}`);
};

export const updateTeamMemberRole = async (teamId: string, userId: string, role: TeamMemberRole): Promise<void> => {
    await connectToDatabase();
    await TeamModel.updateOne(
        { _id: teamId, 'members.user': userId },
        { $set: { 'members.$.role': role } }
    );
    revalidatePath(`/teams/${teamId}`);
};
