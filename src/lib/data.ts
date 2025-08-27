
import type { User, Team, Task, Comment, TaskStatus, TeamMemberRole } from '@/types';

// Mock Data
export const MOCK_USERS: User[] = [
  { id: 'user-admin', name: 'Admin User', email: 'admin@teamflow.com', avatar: `https://picsum.photos/seed/user-admin/200/200`, expertise: 'Project Overlord', currentWorkload: 1 },
  { id: 'user-bruce', name: 'Bruce Wayne', email: 'bruce@teamflow.com', avatar: `https://picsum.photos/seed/user-bruce/200/200`, expertise: 'Frontend Development', currentWorkload: 2 },
  { id: 'user-clark', name: 'Clark Kent', email: 'clark@teamflow.com', avatar: `https://picsum.photos/seed/user-clark/200/200`, expertise: 'Backend Development', currentWorkload: 1 },
  { id: 'user-diana', name: 'Diana Prince', email: 'diana@teamflow.com', avatar: `https_://picsum.photos/seed/user-diana/200/200`, expertise: 'UI/UX Design', currentWorkload: 3 },
  { id: 'user-barry', name: 'Barry Allen', email: 'barry@teamflow.com', avatar: `https://picsum.photos/seed/user-barry/200/200`, expertise: 'DevOps & Infrastructure', currentWorkload: 1 },
];

export const MOCK_TEAMS: Team[] = [
  { id: 'team-frontend', name: 'Frontend Wizards', members: [{ id: 'user-admin', role: 'leader' }, { id: 'user-diana', role: 'member' }, { id: 'user-bruce', role: 'member' }] },
  { id: 'team-backend', name: 'Backend Brigade', members: [{ id: 'user-clark', role: 'leader' }, { id: 'user-bruce', role: 'member' }] },
  { id: 'team-infra', name: 'Infra Avengers', members: [{ id: 'user-barry', role: 'leader' }] },
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

let MOCK_TASKS: Task[] = [
  { id: 'task-1', title: 'Design new dashboard layout', description: 'Create mockups and prototypes for the v2 dashboard, focusing on a more intuitive user experience.', status: 'todo', teamId: 'team-frontend', assigneeId: 'user-diana', createdAt: new Date().toISOString() },
  { id: 'task-2', title: 'Implement user authentication API', description: 'Set up JWT-based authentication endpoints. This includes login, logout, and token refresh.', status: 'in-progress', teamId: 'team-backend', assigneeId: 'user-clark', createdAt: new Date().toISOString() },
  { id: 'task-3', title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment to the staging environment.', status: 'done', teamId: 'team-infra', assigneeId: 'user-barry', createdAt: new Date().toISOString() },
  { id: 'task-4', title: 'Develop landing page components', description: 'Build reusable React components for the new marketing site based on the Figma designs.', status: 'in-progress', teamId: 'team-frontend', assigneeId: 'user-admin', createdAt: new Date().toISOString() },
  { id: 'task-5', title: 'Refactor database schema', description: 'Optimize Firestore queries and data structures for better performance and scalability.', status: 'todo', teamId: 'team-backend', assigneeId: 'user-bruce', createdAt: new Date().toISOString() },
  { id: 'task-6', title: 'User profile page design', description: 'Design the user settings and profile page, allowing users to update their information.', status: 'backlog', teamId: 'team-frontend', createdAt: new Date().toISOString() },
  { id: 'task-7', title: 'Fix login button style on mobile', description: 'The login button is not rendering correctly on small screen sizes.', status: 'todo', teamId: 'team-frontend', assigneeId: 'user-bruce', createdAt: new Date().toISOString() },
  { id: 'task-8', title: 'Write API documentation', description: 'Create comprehensive documentation for all public API endpoints using Swagger/OpenAPI.', status: 'backlog', teamId: 'team-backend', createdAt: new Date().toISOString() },
];

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to populate a task
const populateTask = (task: Omit<Task, 'team' | 'comments' | 'assignee'>): Task => {
    const team = MOCK_TEAMS.find(t => t.id === task.teamId)!;
    const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
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
    return MOCK_TASKS.map(populateTask);
};

export const getTask = async (id: string): Promise<Task | undefined> => {
    await simulateDelay(50);
    const task = MOCK_TASKS.find(t => t.id === id);
    return task ? populateTask(task) : undefined;
}

export const getTasksByTeam = async (teamId: string): Promise<Task[]> => {
    await simulateDelay(100);
    const teamTasks = MOCK_TASKS.filter(t => t.teamId === teamId);
    return teamTasks.map(populateTask);
}

export const addTask = async (taskData: Omit<Task, 'id' | 'comments' | 'team' | 'assignee'> & { teamId: string, assigneeId?: string }): Promise<string> => {
    await simulateDelay(200);
    const newId = `task-${Date.now()}`;
    const newTask: Task = populateTask({
        id: newId,
        comments: [],
        createdAt: new Date().toISOString(),
        ...taskData
    });
    MOCK_TASKS.push(newTask);
    return newId;
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<void> => {
    await simulateDelay(100);
    const task = MOCK_TASKS.find(t => t.id === taskId);
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
