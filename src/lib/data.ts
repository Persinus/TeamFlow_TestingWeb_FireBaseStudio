
import type { User, Team, Task, Comment, TaskStatus, TeamMemberRole } from '@/types';
import { addDays, subDays } from 'date-fns';

// Mock Data
export const MOCK_USERS: User[] = [
  { id: 'user-admin', name: 'Admin User', email: 'admin@teamflow.com', avatar: `https://picsum.photos/seed/user-admin/200/200`, expertise: 'Project Overlord', currentWorkload: 1 },
  { id: 'user-bruce', name: 'Bruce Wayne', email: 'bruce@teamflow.com', avatar: `https://picsum.photos/seed/user-bruce/200/200`, expertise: 'Frontend Development', currentWorkload: 2 },
  { id: 'user-clark', name: 'Clark Kent', email: 'clark@teamflow.com', avatar: `https://picsum.photos/seed/user-clark/200/200`, expertise: 'Backend Development', currentWorkload: 1 },
  { id: 'user-diana', name: 'Diana Prince', email: 'diana@teamflow.com', avatar: `https://picsum.photos/seed/user-diana/200/200`, expertise: 'UI/UX Design', currentWorkload: 3 },
  { id: 'user-barry', name: 'Barry Allen', email: 'barry@teamflow.com', avatar: `https://picsum.photos/seed/user-barry/200/200`, expertise: 'DevOps & Infrastructure', currentWorkload: 1 },
];

export let MOCK_TEAMS: Team[] = [
  { id: 'team-frontend', name: 'Frontend Wizards', description: 'Crafting beautiful and responsive user interfaces.', members: [{ id: 'user-admin', role: 'leader' }, { id: 'user-diana', role: 'member' }, { id: 'user-bruce', role: 'member' }] },
  { id: 'team-backend', name: 'Backend Brigade', description: 'Building the powerful engines that drive our applications.', members: [{ id: 'user-clark', role: 'leader' }, { id: 'user-bruce', role: 'member' }] },
  { id: 'team-infra', name: 'Infra Avengers', description: 'Ensuring our services are reliable, scalable, and secure.', members: [{ id: 'user-barry', role: 'leader' }] },
];

const MOCK_COMMENTS: { [taskId: string]: Comment[] } = {
  'task-1': [
    { id: 'comment-1', author: MOCK_USERS[3], content: 'Initial mockups are ready for review.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'comment-2', author: MOCK_USERS[0], content: 'Looks great! Let\'s proceed with these.', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  'task-2': [
    { id: 'comment-3', author: MOCK_USERS[2], content: 'The basic structure is in place. Need to add the token validation logic.', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  'task-4': [
     { id: 'comment-4', author: MOCK_USERS[1], content: 'I\'ve created the button and input components.', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
  ]
};

let MOCK_TASKS_RAW: Omit<Task, 'team' | 'comments' | 'assignee'>[] = [
  { id: 'task-1', title: 'Design new dashboard layout', description: 'Create mockups and prototypes for the v2 dashboard.', status: 'todo', teamId: 'team-frontend', assigneeId: 'user-diana', createdAt: new Date().toISOString(), startDate: new Date().toISOString(), dueDate: addDays(new Date(), 7).toISOString() },
  { id: 'task-2', title: 'Implement user authentication API', description: 'Set up JWT-based authentication endpoints.', status: 'in-progress', teamId: 'team-backend', assigneeId: 'user-clark', createdAt: new Date().toISOString(), startDate: subDays(new Date(), 2).toISOString(), dueDate: addDays(new Date(), 5).toISOString() },
  { id: 'task-3', title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment.', status: 'done', teamId: 'team-infra', assigneeId: 'user-barry', createdAt: new Date().toISOString(), startDate: subDays(new Date(), 10).toISOString(), dueDate: subDays(new Date(), 5).toISOString() },
  { id: 'task-4', title: 'Develop landing page components', description: 'Build reusable React components for the marketing site.', status: 'in-progress', teamId: 'team-frontend', assigneeId: 'user-admin', createdAt: new Date().toISOString(), startDate: subDays(new Date(), 1).toISOString(), dueDate: addDays(new Date(), 2).toISOString() }, // Due soon
  { id: 'task-5', title: 'Refactor database schema', description: 'Optimize Firestore queries and data structures.', status: 'todo', teamId: 'team-backend', assigneeId: 'user-bruce', createdAt: new Date().toISOString(), dueDate: addDays(new Date(), 14).toISOString() },
  { id: 'task-6', title: 'User profile page design', description: 'Design the user settings and profile page.', status: 'backlog', teamId: 'team-frontend', createdAt: new Date().toISOString() },
  { id: 'task-7', title: 'Fix login button style on mobile', description: 'The login button is not rendering correctly on small screens.', status: 'todo', teamId: 'team-frontend', assigneeId: 'user-bruce', createdAt: new Date().toISOString(), startDate: subDays(new Date(), 4).toISOString(), dueDate: subDays(new Date(), 1).toISOString() }, // Overdue
  { id: 'task-8', title: 'Write API documentation', description: 'Create comprehensive documentation for all public API endpoints.', status: 'backlog', teamId: 'team-backend', createdAt: new Date().toISOString() },
];


const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to populate a task
const populateTask = (task: Omit<Task, 'team' | 'comments' | 'assignee'>): Task | null => {
    const team = MOCK_TEAMS.find(t => t.id === task.teamId);
    if (!team) {
        console.warn(`Task ${task.id} has an invalid teamId: ${task.teamId}`);
        return null;
    }
    const assignee = MOCK_USERS.find(u => u.id === task.assigneeId) ?? undefined;
    const comments = MOCK_COMMENTS[task.id] || [];
    return { ...task, team, assignee, comments };
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

export const addTask = async (taskData: Omit<Task, 'id' | 'comments' | 'team' | 'assignee' | 'createdAt'>): Promise<string> => {
    await simulateDelay(200);
    const newId = `task-${Date.now()}`;
    const newTaskRaw: Omit<Task, 'team' | 'comments' | 'assignee'> = {
        id: newId,
        createdAt: new Date().toISOString(),
        ...taskData
    };
    MOCK_TASKS_RAW.push(newTaskRaw);
    return newId;
};

export const updateTask = async (taskId: string, taskData: Partial<Omit<Task, 'id' | 'team' | 'assignee' | 'comments'>>): Promise<void> => {
    await simulateDelay(100);
    const taskIndex = MOCK_TASKS_RAW.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        MOCK_TASKS_RAW[taskIndex] = { ...MOCK_TASKS_RAW[taskIndex], ...taskData };
    }
};


export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<void> => {
    await simulateDelay(100);
    const task = MOCK_TASKS_RAW.find(t => t.id === taskId);
    if (task) {
        task.status = status;
    }
};

// COMMENT FUNCTIONS
export const addComment = async (taskId: string, content: string, authorId: string): Promise<void> => {
    await simulateDelay(150);
    const author = MOCK_USERS.find(u => u.id === authorId);
    if (!author) return;

    if (!MOCK_COMMENTS[taskId]) {
        MOCK_COMMENTS[taskId] = [];
    }
    
    const newComment: Comment = {
        id: `comment-${Date.now()}`,
        content,
        author,
        createdAt: new Date().toISOString(),
    };
    MOCK_COMMENTS[taskId].push(newComment);
};
