

export interface User {
  id: string;
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
  id: string; // Corresponds to User ID
  role: TeamMemberRole;
}

export interface Team {
  id:string;
  name: string;
  description?: string;
  members: TeamMember[];
}

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'backlog';

export interface Task {
  id: string;
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
