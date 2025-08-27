
export interface User {
  id: string; // This will map to MongoDB's _id
  name: string;
  email: string;
  avatar: string; // URL to avatar image
  expertise: string;
  currentWorkload: number;
  phone?: string;
  dob?: string; // Date of birth
}

export type TeamMemberRole = 'leader' | 'member';

export interface TeamMember {
  user: User | string; // Can be populated or just the ID
  role: TeamMemberRole;
}

export interface Team {
  id: string; // This will map to MongoDB's _id
  name: string;
  description?: string;
  members: TeamMember[];
}

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'backlog';

export interface Task {
  id: string; // This will map to MongoDB's _id
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId?: string; 
  assignee?: User; 
  teamId: string; 
  team: Team; 
  createdAt: string; // ISO string
  startDate?: string; // ISO string
  dueDate?: string; // ISO string
  tags?: string[];
}
