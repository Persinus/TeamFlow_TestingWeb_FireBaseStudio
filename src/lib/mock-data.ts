
import type { User } from '@/types';

// Mock Data - Expanded to 10 users for more avatar options
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
  { 
    hoTen: 'Clark Kent', 
    email: 'clark@teamflow.com', 
    anhDaiDien: `https://api.dicebear.com/7.x/micah/svg?seed=Clark`, 
    chuyenMon: 'Backend Engineering', 
    taiCongViecHienTai: 4, 
    soDienThoai: '123-456-7894', 
    ngaySinh: '1988-02-29' 
  },
  { 
    hoTen: 'Barry Allen', 
    email: 'barry@teamflow.com', 
    anhDaiDien: `https://api.dicebear.com/7.x/micah/svg?seed=Barry`, 
    chuyenMon: 'QA & Testing', 
    taiCongViecHienTai: 1, 
    soDienThoai: '123-456-7895', 
    ngaySinh: '1995-09-30' 
  },
  { 
    hoTen: 'Arthur Curry', 
    email: 'arthur@teamflow.com', 
    anhDaiDien: `https://api.dicebear.com/7.x/micah/svg?seed=Arthur`, 
    chuyenMon: 'DevOps', 
    taiCongViecHienTai: 2, 
    soDienThoai: '123-456-7896', 
    ngaySinh: '1991-07-15' 
  },
  { 
    hoTen: 'Hal Jordan', 
    email: 'hal@teamflow.com', 
    anhDaiDien: `https://api.dicebear.com/7.x/micah/svg?seed=Hal`, 
    chuyenMon: 'Product Management', 
    taiCongViecHienTai: 3, 
    soDienThoai: '123-456-7897', 
    ngaySinh: '1993-11-01' 
  },
  { 
    hoTen: 'Selina Kyle', 
    email: 'selina@teamflow.com', 
    anhDaiDien: `https://api.dicebear.com/7.x/micah/svg?seed=Selina`, 
    chuyenMon: 'Marketing', 
    taiCongViecHienTai: 2, 
    soDienThoai: '123-456-7898', 
    ngaySinh: '1994-04-19' 
  },
  { 
    hoTen: 'Oliver Queen', 
    email: 'oliver@teamflow.com', 
    anhDaiDien: `https://api.dicebear.com/7.x/micah/svg?seed=Oliver`, 
    chuyenMon: 'Data Analysis', 
    taiCongViecHienTai: 1, 
    soDienThoai: '123-456-7899', 
    ngaySinh: '1990-05-16' 
  },
  { 
    hoTen: 'Zatanna Zatara', 
    email: 'zatanna@teamflow.com', 
    anhDaiDien: `https://api.dicebear.com/7.x/micah/svg?seed=Zatanna`, 
    chuyenMon: 'Technical Writing', 
    taiCongViecHienTai: 2, 
    soDienThoai: '123-456-7800', 
    ngaySinh: '1996-08-20' 
  },
];
