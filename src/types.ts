
export interface User {
  id: string;
  name: string;
  avatar: string; // URL to avatar image
  expertise: string;
  currentWorkload: number;
  phone?: string;
  dob?: string; // Date of birth
}

export interface Team {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'backlog';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee?: User;
  team: Team;
  comments: Comment[];
}
