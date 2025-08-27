
import type { User } from '@/types';

// Mock Data - Reduced to 3 users for a cleaner seed
export const MOCK_USERS: Omit<User, 'id' | 'matKhau'>[] = [
  { 
    hoTen: 'Admin User', 
    email: 'admin@teamflow.com', 
    anhDaiDien: `https://api.dicebear.com/7.x/micah/svg?seed=Admin`, 
    chuyenMon: 'Project Overlord', 
    taiCongViecHienTai: 1, 
    soDienThoai: '123-456-7890', 
    ngaySinh: '1990-01-01' 
  },
  { 
    hoTen: 'Bruce Wayne', 
    email: 'bruce@teamflow.com', 
    anhDaiDien: `https://api.dicebear.com/7.x/micah/svg?seed=Bruce`, 
    chuyenMon: 'Frontend Development', 
    taiCongViecHienTai: 2, 
    soDienThoai: '123-456-7891', 
    ngaySinh: '1985-05-27' 
  },
  { 
    hoTen: 'Diana Prince', 
    email: 'diana@teamflow.com', 
    anhDaiDien: `https://api.dicebear.com/7.x/micah/svg?seed=Diana`, 
    chuyenMon: 'UI/UX Design', 
    taiCongViecHienTai: 3, 
    soDienThoai: '123-456-7893', 
    ngaySinh: '1992-03-22' 
  },
];
