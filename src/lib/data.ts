

import type { User, Team, Task, TaskStatus, TeamMemberRole } from '@/types';
import { addDays, subDays } from 'date-fns';

// Mock Data - Expanded to 10 users with 'micah' avatar set
export const MOCK_USERS: User[] = [
  { id: 'user-admin', name: 'Admin User', email: 'admin@teamflow.com', avatar: `https://api.dicebear.com/7.x/micah/svg?seed=Admin`, expertise: 'Project Overlord', currentWorkload: 1, phone: '123-456-7890', dob: '1990-01-01' },
  { id: 'user-bruce', name: 'Bruce Wayne', email: 'bruce@teamflow.com', avatar: `https://api.dicebear.com/7.x/micah/svg?seed=Bruce`, expertise: 'Frontend Development', currentWorkload: 2, phone: '123-456-7891', dob: '1985-05-27' },
  { id: 'user-clark', name: 'Clark Kent', email: 'clark@teamflow.com', avatar: `https://api.dicebear.com/7.x/micah/svg?seed=Clark`, expertise: 'Backend Development', currentWorkload: 1, phone: '123-456-7892', dob: '1988-06-18' },
  { id: 'user-diana', name: 'Diana Prince', email: 'diana@teamflow.com', avatar: `https://api.dicebear.com/7.x/micah/svg?seed=Diana`, expertise: 'UI/UX Design', currentWorkload: 3, phone: '123-456-7893', dob: '1992-03-22' },
  { id: 'user-barry', name: 'Barry Allen', email: 'barry@teamflow.com', avatar: `https://api.dicebear.com/7.x/micah/svg?seed=Barry`, expertise: 'DevOps & Infrastructure', currentWorkload: 1, phone: '123-456-7894', dob: '1995-09-30' },
  { id: 'user-hal', name: 'Hal Jordan', email: 'hal@teamflow.com', avatar: `https://api.dicebear.com/7.x/micah/svg?seed=Hal`, expertise: 'QA & Testing', currentWorkload: 2 },
  { id: 'user-arthur', name: 'Arthur Curry', email: 'arthur@teamflow.com', avatar: `https://api.dicebear.com/7.x/micah/svg?seed=Arthur`, expertise: 'Mobile Development (iOS)', currentWorkload: 1 },
  { id: 'user-victor', name: 'Victor Stone', email: 'victor@teamflow.com', avatar: `https://api.dicebear.com/7.x/micah/svg?seed=Victor`, expertise: 'Data Science & Analytics', currentWorkload: 2 },
  { id: 'user-selina', name: 'Selina Kyle', email: 'selina@teamflow.com', avatar: `https://api.dicebear.com/7.x/micah/svg?seed=Selina`, expertise: 'Marketing & SEO', currentWorkload: 4 },
  { id: 'user-harley', name: 'Harleen Quinzel', email: 'harley@teamflow.com', avatar: `https://api.dicebear.com/7.x/micah/svg?seed=Harley`, expertise: 'Graphic Design', currentWorkload: 2 },
];


export let MOCK_TEAMS: Team[] = [
  { id: 'team-frontend', name: 'Frontend Wizards', description: 'Crafting beautiful and responsive user interfaces.', members: [{ id: 'user-admin', role: 'leader' }, { id: 'user-diana', role: 'member' }, { id: 'user-bruce', role: 'member' }] },
  { id: 'team-backend', name: 'Backend Brigade', description: 'Building the powerful engines that drive our applications.', members: [{ id: 'user-clark', role: 'leader' }, { id: 'user-bruce', role: 'member' }] },
  { id: 'team-infra', name: 'Infra Avengers', description: 'Ensuring our services are reliable, scalable, and secure.', members: [{ id: 'user-barry', role: 'leader' }] },
];


let MOCK_TASKS_RAW: Omit<Task, 'team' | 'assignee'>[] = [
  { id: 'task-1', title: 'Design new dashboard layout', description: 'Create mockups and prototypes for the v2 dashboard.', status: 'todo', teamId: 'team-frontend', assigneeId: 'user-diana', createdAt: new Date().toISOString(), startDate: new Date().toISOString(), dueDate: addDays(new Date(), 7).toISOString(), tags: ['design', 'UI/UX'] },
  { id: 'task-2', title: 'Implement user authentication API', description: 'Set up JWT-based authentication endpoints.', status: 'in-progress', teamId: 'team-backend', assigneeId: 'user-clark', createdAt: new Date().toISOString(), startDate: subDays(new Date(), 2).toISOString(), dueDate: addDays(new Date(), 5).toISOString(), tags: ['backend', 'security'] },
  { id: 'task-3', title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment.', status: 'done', teamId: 'team-infra', assigneeId: 'user-barry', createdAt: new Date().toISOString(), startDate: subDays(new Date(), 10).toISOString(), dueDate: subDays(new Date(), 5).toISOString(), tags: ['devops', 'CI/CD'] },
  { id: 'task-4', title: 'Develop landing page components', description: 'Build reusable React components for the marketing site.', status: 'in-progress', teamId: 'team-frontend', assigneeId: 'user-admin', createdAt: new Date().toISOString(), startDate: subDays(new Date(), 1).toISOString(), dueDate: addDays(new Date(), 2).toISOString(), tags: ['frontend', 'feature'] }, // Due soon
  { id: 'task-5', title: 'Refactor database schema', description: 'Optimize Firestore queries and data structures.', status: 'todo', teamId: 'team-backend', assigneeId: 'user-bruce', createdAt: new Date().toISOString(), dueDate: addDays(new Date(), 14).toISOString(), tags: ['backend', 'database', 'refactor'] },
  { id: 'task-6', title: 'User profile page design', description: 'Design the user settings and profile page.', status: 'backlog', teamId: 'team-frontend', createdAt: new Date().toISOString(), tags: ['design'] },
  { id: 'task-7', title: 'Fix login button style on mobile', description: 'The login button is not rendering correctly on small screens.', status: 'todo', teamId: 'team-frontend', assigneeId: 'user-bruce', createdAt: new Date().toISOString(), startDate: subDays(new Date(), 4).toISOString(), dueDate: subDays(new Date(), 1).toISOString(), tags: ['bug', 'frontend', 'mobile'] }, // Overdue
  { id: 'task-8', title: 'Write API documentation', description: 'Create comprehensive documentation for all public API endpoints.', status: 'backlog', teamId: 'team-backend', createdAt: new Date().toISOString(), tags: ['documentation'] },
  { id: 'task-9', title: 'Conduct user experience testing', description: 'Gather feedback on the new dashboard design from a focus group.', status: 'todo', teamId: 'team-frontend', assigneeId: 'user-diana', createdAt: new Date().toISOString(), dueDate: addDays(new Date(), 10).toISOString(), tags: ['UX', 'research'] },
  { id: 'task-10', title: 'Integrate a payment gateway', description: 'Add Stripe to handle subscription payments.', status: 'backlog', teamId: 'team-backend', assigneeId: 'user-clark', createdAt: new Date().toISOString(), tags: ['feature', 'billing'] },
];

let ALL_TAGS = [...new Set(MOCK_TASKS_RAW.flatMap(t => t.tags || []))];


const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to populate a task
const populateTask = (task: Omit<Task, 'team' | 'assignee'>): Task | null => {
    const team = MOCK_TEAMS.find(t => t.id === task.teamId);
    if (!team) {
        console.warn(`Task ${task.id} has an invalid teamId: ${task.teamId}`);
        return null;
    }
    const assignee = MOCK_USERS.find(u => u.id === task.assigneeId) ?? undefined;
    return { ...task, team, assignee };
}

// USER FUNCTIONS
export const getUsers = async (): Promise<User[]> => {
    await simulateDelay(50);
    return MOCK_USERS;
};

export const getUser = async (id: string): Promise<User | undefined> => {
    await simulateDelay(50);
    return MOCK_USERS.find(u => u.id === id);
};

export const updateUser = async (userId: string, userData: Partial<Pick<User, 'name' | 'avatar' | 'phone' | 'dob'>>) => {
    await simulateDelay(100);
    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...userData };
        return MOCK_USERS[userIndex];
    }
    return undefined;
};


// TEAM FUNCTIONS
export const getTeams = async (): Promise<Team[]> => {
    await simulateDelay(50);
    return MOCK_TEAMS;
};

export const getTeam = async (id: string): Promise<Team | undefined> => {
    await simulateDelay(50);
    return MOCK_TEAMS.find(t => t.id === id);
};

export const createTeam = async (teamData: Pick<Team, 'name' | 'description'>, leaderId: string): Promise<string> => {
    await simulateDelay(200);
    const newId = `team-${Date.now()}`;
    const newTeam: Team = {
        id: newId,
        name: teamData.name,
        description: teamData.description,
        members: [{ id: leaderId, role: 'leader' }],
    };
    MOCK_TEAMS.push(newTeam);
    return newId;
};

export const addTeamMember = async (teamId: string, userId: string): Promise<void> => {
    await simulateDelay(200);
    const team = MOCK_TEAMS.find(t => t.id === teamId);
    if (team && !team.members.some(m => m.id === userId)) {
        team.members.push({ id: userId, role: 'member' });
    }
};

export const removeTeamMember = async (teamId: string, userId: string): Promise<void> => {
    await simulateDelay(200);
    const team = MOCK_TEAMS.find(t => t.id === teamId);
    if (team) {
        team.members = team.members.filter(m => m.id !== userId);
    }
};

export const updateTeamMemberRole = async (teamId: string, userId: string, role: TeamMemberRole): Promise<void> => {
    await simulateDelay(200);
    const team = MOCK_TEAMS.find(t => t.id === teamId);
    const member = team?.members.find(m => m.id === userId);
    if (member) {
        member.role = role;
    }
};

// TASK FUNCTIONS
export const getTasks = async (): Promise<Task[]> => {
    await simulateDelay(100);
    return MOCK_TASKS_RAW.map(populateTask).filter((t): t is Task => t !== null);
};

export const getTasksByAssignee = async (assigneeId: string): Promise<Task[]> => {
    await simulateDelay(100);
    const userTasks = MOCK_TASKS_RAW.filter(t => t.assigneeId === assigneeId);
    return userTasks.map(populateTask).filter((t): t is Task => t !== null);
}

export const getTask = async (id: string): Promise<Task | undefined> => {
    await simulateDelay(50);
    const task = MOCK_TASKS_RAW.find(t => t.id === id);
    if (!task) return undefined;
    return populateTask(task) ?? undefined;
}

export const getTasksByTeam = async (teamId: string): Promise<Task[]> => {
    await simulateDelay(100);
    const teamTasks = MOCK_TASKS_RAW.filter(t => t.teamId === teamId);
    return teamTasks.map(populateTask).filter((t): t is Task => t !== null);
}

export const addTask = async (taskData: Omit<Task, 'id' | 'team' | 'assignee' | 'createdAt'>): Promise<string> => {
    await simulateDelay(200);
    const newId = `task-${Date.now()}`;
    const newTaskRaw: Omit<Task, 'team' | 'assignee'> = {
        id: newId,
        createdAt: new Date().toISOString(),
        ...taskData
    };
    MOCK_TASKS_RAW.unshift(newTaskRaw);
    if (taskData.tags) {
        taskData.tags.forEach(tag => {
            if (!ALL_TAGS.includes(tag)) {
                ALL_TAGS.push(tag);
            }
        });
    }
    return newId;
};

export const updateTask = async (taskId: string, taskData: Partial<Omit<Task, 'id' | 'team' | 'assignee'>>): Promise<void> => {
    await simulateDelay(100);
    const taskIndex = MOCK_TASKS_RAW.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        MOCK_TASKS_RAW[taskIndex] = { ...MOCK_TASKS_RAW[taskIndex], ...taskData };
        if (taskData.tags) {
            taskData.tags.forEach(tag => {
                if (!ALL_TAGS.includes(tag)) {
                    ALL_TAGS.push(tag);
                }
            });
        }
    }
};


export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<void> => {
    await simulateDelay(100);
    const task = MOCK_TASKS_RAW.find(t => t.id === taskId);
    if (task) {
        task.status = status;
    }
};

// TAGS FUNCTIONS
export const getAllTags = async (): Promise<string[]> => {
    await simulateDelay(20);
    return ALL_TAGS;
}
