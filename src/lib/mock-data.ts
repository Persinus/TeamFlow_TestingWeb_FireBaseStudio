
import type { User } from '@/types';

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
