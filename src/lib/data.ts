import type { User, Team, Task } from '@/types';

export const users: User[] = [
  { id: 'user-1', name: 'Alice Johnson', avatar: 'https://picsum.photos/seed/alice/40/40', expertise: 'Frontend Development, React, UI/UX', currentWorkload: 3, phone: '123-456-7890', dob: '1990-05-15' },
  { id: 'user-2', name: 'Bob Williams', avatar: 'https://picsum.photos/seed/bob/40/40', expertise: 'Backend Development, Node.js, Databases', currentWorkload: 2, phone: '234-567-8901', dob: '1988-08-20' },
  { id: 'user-3', name: 'Charlie Brown', avatar: 'https://picsum.photos/seed/charlie/40/40', expertise: 'DevOps, CI/CD, Cloud Infrastructure', currentWorkload: 5, phone: '345-678-9012', dob: '1992-11-30' },
  { id: 'user-4', name: 'Diana Prince', avatar: 'https://picsum.photos/seed/diana/40/40', expertise: 'Project Management, Agile Methodologies', currentWorkload: 4, phone: '456-789-0123', dob: '1985-03-22' },
];

export let teams: Team[] = [
  { 
    id: 'team-1', 
    name: 'Frontend Wizards',
    members: [
      { id: 'user-1', role: 'leader' },
      { id: 'user-4', role: 'member' },
    ]
  },
  { 
    id: 'team-2', 
    name: 'Backend Brigade',
    members: [
      { id: 'user-2', role: 'leader' },
    ]
  },
  { 
    id: 'team-3', 
    name: 'Infra Avengers',
    members: [
      { id: 'user-3', role: 'leader' },
    ]
  },
];

const now = new Date();

export let initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design new homepage mockup',
    description: 'Create a high-fidelity mockup for the new homepage using Figma. Focus on a clean and modern look, incorporating the new branding guidelines and ensuring an intuitive user experience.',
    status: 'in-progress',
    assignee: users[0],
    team: teams[0],
    comments: [
      { id: 'comment-1', author: users[3], content: 'Make sure to use the new brand colors!', createdAt: new Date(now.setDate(now.getDate() - 1)).toISOString() }
    ],
  },
  {
    id: 'task-2',
    title: 'Develop user authentication API',
    description: 'Build REST API endpoints for user registration, login, and logout. Use JWT for authentication and ensure all sensitive data is encrypted.',
    status: 'todo',
    assignee: users[1],
    team: teams[1],
    comments: [],
  },
  {
    id: 'task-3',
    title: 'Set up staging environment on AWS',
    description: 'Configure a new staging environment for the application on AWS. This includes setting up EC2 instances, an RDS database, and an S3 bucket for static assets.',
    status: 'todo',
    assignee: users[2],
    team: teams[2],
    comments: [],
  },
  {
    id: 'task-4',
    title: 'Refactor legacy CSS to Tailwind',
    description: 'Go through the old stylesheets and refactor them to use Tailwind CSS utility classes to improve maintainability and consistency.',
    status: 'done',
    assignee: users[0],
    team: teams[0],
    comments: [
      { id: 'comment-2', author: users[0], content: 'This is complete. Ready for review.', createdAt: new Date(now.setDate(now.getDate() - 2)).toISOString() }
    ],
  },
  {
    id: 'task-5',
    title: 'Write API documentation',
    description: 'Document all public API endpoints using Swagger/OpenAPI specification. Include examples for each endpoint.',
    status: 'backlog',
    team: teams[1],
    comments: [],
  },
  {
    id: 'task-6',
    title: 'User profile page UI',
    description: 'Create the user interface for the user profile page, allowing them to view and update their personal information and preferences.',
    status: 'todo',
    assignee: users[0],
    team: teams[0],
    comments: [],
  },
  {
    id: 'task-7',
    title: 'Database schema migration',
    description: 'Write and test the database migration scripts for the upcoming "Organizations" feature. Ensure backward compatibility.',
    status: 'in-progress',
    assignee: users[1],
    team: teams[1],
    comments: [
      { id: 'comment-3', author: users[3], content: 'Need to coordinate this with the frontend team.', createdAt: new Date(now.setDate(now.getDate() - 1)).toISOString() }
    ],
  },
];


export const addTask = (task: Task) => {
  initialTasks.unshift(task);
};
