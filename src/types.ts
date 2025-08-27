import { FieldValue } from "firebase/firestore";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // URL to avatar image
  expertise: string;
  currentWorkload: number;
  phone?: string;
  dob?: string; // Date of birth
  createdAt?: FieldValue;
  // No password stored here, it's managed by Firebase Auth
}

export type TeamMemberRole = 'leader' | 'member';

export interface TeamMember {
  id: string; // Corresponds to User ID
  role: TeamMemberRole;
}

export interface Team {
  id:string;
  name: string;
  members: TeamMember[];
  createdAt?: FieldValue;
}

export interface Comment {
  id: string;
  author: User; // Keep the nested user object for display purposes
  content: string;
  createdAt: string; // Keep as ISO string for date-fns formatting
}

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'backlog';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId?: string; // Store only the ID
  assignee?: User; // Keep for FE convenience, will be populated
  teamId: string; // Store only the ID
  team: Team; // Keep for FE convenience, will be populated
  comments?: Comment[]; // Comments will be a subcollection
  createdAt?: FieldValue;
}
