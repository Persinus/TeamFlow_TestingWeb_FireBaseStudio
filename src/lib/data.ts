
import type { User, Team, Task, TaskStatus, TeamMemberRole } from '@/types';
import connectToDatabase from './mongodb';
import { User as UserModel, Team as TeamModel, Task as TaskModel } from './models';
import { MOCK_USERS } from './mock-data';

// Helper to simulate a delay
const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Database Seeding Function ---
export const seedDatabase = async () => {
    await connectToDatabase();

    // Clear existing data
    await UserModel.deleteMany({});
    await TeamModel.deleteMany({});
    await TaskModel.deleteMany({});
    
    console.log("Cleared existing data.");

    // Create users
    const users = await UserModel.create(MOCK_USERS);
    console.log(`${users.length} users created.`);
    
    const userMap = new Map(users.map(u => [u.id, u._id]));

    // Create teams
    const teamData = [
        { _id: 'team-frontend', name: 'Frontend Wizards', description: 'Crafting beautiful and responsive user interfaces.', members: [{ user: userMap.get('user-admin'), role: 'leader' }, { user: userMap.get('user-diana'), role: 'member' }, { user: userMap.get('user-bruce'), role: 'member' }] },
        { _id: 'team-backend', name: 'Backend Brigade', description: 'Building the powerful engines that drive our applications.', members: [{ user: userMap.get('user-clark'), role: 'leader' }, { user: userMap.get('user-bruce'), role: 'member' }] },
        { _id: 'team-infra', name: 'Infra Avengers', description: 'Ensuring our services are reliable, scalable, and secure.', members: [{ user: userMap.get('user-barry'), role: 'leader' }] },
    ];
    const teams = await TeamModel.create(teamData);
    console.log(`${teams.length} teams created.`);

    const teamMap = new Map(teams.map(t => [t._id, t._id]));

    // Create tasks
    const taskData = [
        { _id: 'task-1', title: 'Design new dashboard layout', description: 'Create mockups and prototypes for the v2 dashboard.', status: 'todo', team: teamMap.get('team-frontend'), assignee: userMap.get('user-diana'), tags: ['design', 'UI/UX'] },
        { _id: 'task-2', title: 'Implement user authentication API', description: 'Set up JWT-based authentication endpoints.', status: 'in-progress', team: teamMap.get('team-backend'), assignee: userMap.get('user-clark'), tags: ['backend', 'security'] },
        { _id: 'task-3', title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment.', status: 'done', team: teamMap.get('team-infra'), assignee: userMap.get('user-barry'), tags: ['devops', 'CI/CD'] },
        { _id: 'task-4', title: 'Develop landing page components', description: 'Build reusable React components for the marketing site.', status: 'in-progress', team: teamMap.get('team-frontend'), assignee: userMap.get('user-admin'), tags: ['frontend', 'feature'] },
        { _id: 'task-5', title: 'Refactor database schema', description: 'Optimize Firestore queries and data structures.', status: 'todo', team: teamMap.get('team-backend'), assignee: userMap.get('user-bruce'), tags: ['backend', 'database', 'refactor'] },
        { _id: 'task-6', title: 'User profile page design', description: 'Design the user settings and profile page.', status: 'backlog', team: teamMap.get('team-frontend'), tags: ['design'] },
    ];
    const tasks = await TaskModel.create(taskData);
    console.log(`${tasks.length} tasks created.`);

    console.log("Database seeded successfully.");
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
    return { ...updatedUser, id: updatedUser._id.toString() } as unknown as User;
};

// --- Team Functions ---
export const getTeams = async (): Promise<Team[]> => {
    await connectToDatabase();
    const teams = await TeamModel.find().lean();
    return teams.map(t => ({ ...t, id: t._id.toString() })) as unknown as Team[];
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
    const leader = await UserModel.findOne({id: leaderId});
    if (!leader) throw new Error("Leader not found");

    const newTeam = new TeamModel({
        name: teamData.name,
        description: teamData.description,
        members: [{ user: leader._id, role: 'leader' }],
    });
    await newTeam.save();
    return newTeam._id.toString();
};

export const updateTeam = async (teamId: string, teamData: Partial<Pick<Team, 'name' | 'description'>>): Promise<void> => {
    await connectToDatabase();
    await TeamModel.findByIdAndUpdate(teamId, teamData);
};

export const deleteTeam = async (teamId: string): Promise<void> => {
    await connectToDatabase();
    await TeamModel.findByIdAndDelete(teamId);
    // Also delete tasks associated with this team
    await TaskModel.deleteMany({ team: teamId });
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
};

export const removeTeamMember = async (teamId: string, userId: string): Promise<void> => {
    await connectToDatabase();
    await TeamModel.findByIdAndUpdate(teamId, {
        $pull: { members: { user: userId } }
    });
};

export const updateTeamMemberRole = async (teamId: string, userId: string, role: TeamMemberRole): Promise<void> => {
    await connectToDatabase();
    await TeamModel.updateOne(
        { _id: teamId, 'members.user': userId },
        { $set: { 'members.$.role': role } }
    );
};

// --- Task Functions ---
const populateTask = (task: any): Task => {
    // A helper to ensure the populated task has the correct shape
    return {
      ...task,
      id: task._id.toString(),
      team: task.team ? { ...task.team, id: task.team._id.toString() } : undefined,
      assignee: task.assignee ? { ...task.assignee, id: task.assignee._id.toString() } : undefined,
    } as unknown as Task;
}

export const getTasks = async (): Promise<Task[]> => {
    await connectToDatabase();
    const tasks = await TaskModel.find()
        .populate('team')
        .populate('assignee')
        .lean();
    return tasks.map(populateTask);
};

export const getTasksByAssignee = async (assigneeId: string): Promise<Task[]> => {
    await connectToDatabase();
    const tasks = await TaskModel.find({ assignee: assigneeId })
        .populate('team')
        .populate('assignee')
        .lean();
    return tasks.map(populateTask);
};

export const getTask = async (id: string): Promise<Task | undefined> => {
    await connectToDatabase();
    const task = await TaskModel.findById(id)
        .populate('team')
        .populate('assignee')
        .lean();
    if (!task) return undefined;
    return populateTask(task);
};

export const getTasksByTeam = async (teamId: string): Promise<Task[]> => {
    await connectToDatabase();
    const tasks = await TaskModel.find({ team: teamId })
        .populate('team')
        .populate('assignee')
        .lean();
    return tasks.map(populateTask);
};

export const addTask = async (taskData: Omit<Task, 'id' | 'team' | 'assignee' | 'createdAt'>): Promise<string> => {
    await connectToDatabase();
    const newTask = new TaskModel({
        ...taskData,
        assignee: taskData.assigneeId || null, // Handle 'unassigned'
    });
    await newTask.save();
    return newTask._id.toString();
};

export const updateTask = async (taskId: string, taskData: Partial<Omit<Task, 'id' | 'team' | 'assignee'>>): Promise<void> => {
    await connectToDatabase();
    // Make sure to handle assigneeId correctly
    const updateData = { ...taskData };
    if (updateData.assigneeId === 'unassigned' || updateData.assigneeId === undefined) {
      // @ts-ignore
      updateData.assignee = null;
    } else {
      // @ts-ignore
      updateData.assignee = updateData.assigneeId;
    }
    // @ts-ignore
    delete updateData.assigneeId;

    await TaskModel.findByIdAndUpdate(taskId, updateData);
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<void> => {
    await connectToDatabase();
    await TaskModel.findByIdAndUpdate(taskId, { status });
};

// --- Tag Functions ---
export const getAllTags = async (): Promise<string[]> => {
    await connectToDatabase();
    const tags = await TaskModel.distinct('tags');
    return tags.filter(tag => tag !== null);
};

// --- Mock Data related function still needed for auth ---
export const getMockUserByEmail = async (email: string): Promise<User | undefined> => {
    // This is a temporary function to support the mock auth system.
    // In a real app, this would query the database.
    await simulateDelay(50);
    return MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
};
