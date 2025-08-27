

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as UserModel, Team as TeamModel, Task as TaskModel } from '@/lib/models';
import { MOCK_USERS } from '@/lib/mock-data';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from exploding during
 * local development.
 */
// @ts-ignore
let cached = global.mongoose;

if (!cached) {
  // @ts-ignore
  cached = global.mongoose = { conn: null, promise: null };
}

// --- Database Seeding ---
const seedDatabase = async () => {
    try {
        const userCount = await UserModel.countDocuments();
        if (userCount > 0) {
            console.log('Database already seeded.');
            return;
        }

        console.log('Seeding database with 3 new users...');
        
        // Hash the default password
        const hashedPassword = await bcrypt.hash('Admin@1234', 10);

        // 1. Insert all mock users with their specific IDs and hashed password
        const usersToCreate = MOCK_USERS.map((user) => ({
             _id: `user-${user.hoTen.toLowerCase().replace(/\s/g, '')}`,
             ...user,
             matKhau: hashedPassword,
        }));
        await UserModel.insertMany(usersToCreate);
        const createdUsers = await UserModel.find();
        console.log(`${createdUsers.length} users created.`);


        // 2. Create default teams
        const frontendTeam = new TeamModel({
            _id: 'team-frontend-ui-1',
            tenNhom: 'Frontend UI',
            moTa: 'Xây dựng giao diện người dùng và trải nghiệm người dùng.',
            thanhVien: [
                { thanhVienId: createdUsers.find(u => u.hoTen === 'Bruce Wayne')?._id, vaiTro: 'Trưởng nhóm' },
                { thanhVienId: createdUsers.find(u => u.hoTen === 'Diana Prince')?._id, vaiTro: 'Thành viên' },
            ],
        });
        await frontendTeam.save();

        console.log('1 default team created.');
        
        // 3. Create some tasks for the teams
        const tasksToCreate = [
            {
                _id: 'task-1',
                tieuDe: 'Xây dựng trang Dashboard',
                moTa: 'Thiết kế và triển khai trang dashboard chính với các cột Kanban.',
                trangThai: 'Đang tiến hành',
                loaiCongViec: 'Tính năng',
                doUuTien: 'Cao',
                nguoiThucHienId: createdUsers.find(u => u.hoTen === 'Bruce Wayne')?._id,
                nhomId: frontendTeam._id,
                tags: ['dashboard', 'kanban', 'ui'],
                ngayHetHan: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            {
                _id: 'task-2',
                tieuDe: 'Thiết kế mockup cho trang Profile',
                moTa: 'Tạo mockup chi tiết cho trang quản lý thông tin người dùng mới.',
                trangThai: 'Cần làm',
                loaiCongViec: 'Tính năng',
                doUuTien: 'Trung bình',
                nguoiThucHienId: createdUsers.find(u => u.hoTen === 'Diana Prince')?._id,
                nhomId: frontendTeam._id,
                tags: ['design', 'figma', 'ux'],
            },
            {
                _id: 'task-3',
                tieuDe: 'Nghiên cứu thư viện kéo thả',
                moTa: 'Đánh giá các thư viện kéo thả (dnd-kit, react-beautiful-dnd) để chọn ra giải pháp tốt nhất.',
                trangThai: 'Tồn đọng',
                loaiCongViec: 'Công việc',
                doUuTien: 'Thấp',
                nhomId: frontendTeam._id,
                nguoiThucHienId: createdUsers.find(u => u.hoTen === 'Bruce Wayne')?._id,
                tags: ['research', 'dnd-kit'],
            }
        ];
        await TaskModel.insertMany(tasksToCreate);
        console.log(`${tasksToCreate.length} tasks created.`);
        
        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw new Error('Database seeding failed.');
    }
};


async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then(async (mongoose) => {
      // Seed the database only if the connection is new and successful
      await seedDatabase();
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
