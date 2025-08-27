

import mongoose from 'mongoose';
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

        console.log('Seeding database with IT-oriented Vietnamese data...');
        
        // 1. Insert all mock users with their specific IDs
        const usersToCreate = MOCK_USERS.map(({ id, name, avatar, expertise, email, phone, dob, currentWorkload }) => ({
             _id: id,
             hoTen: name,
             email: email,
             anhDaiDien: avatar,
             chuyenMon: expertise,
             taiCongViecHienTai: currentWorkload,
             soDienThoai: phone,
             ngaySinh: dob,
        }));
        await UserModel.insertMany(usersToCreate);
        console.log(`${MOCK_USERS.length} users created.`);

        // 2. Create default teams
        const coreTeam = new TeamModel({
            _id: 'team-core-backend-1',
            tenNhom: 'Core Backend',
            moTa: 'Phát triển và bảo trì các dịch vụ lõi của hệ thống.',
            thanhVien: [
                { thanhVienId: 'user-clark', vaiTro: 'Trưởng nhóm' },
                { thanhVienId: 'user-victor', vaiTro: 'Thành viên' },
                { thanhVienId: 'user-barry', vaiTro: 'Thành viên' },
            ],
        });
        await coreTeam.save();

        const frontendTeam = new TeamModel({
            _id: 'team-frontend-ui-1',
            tenNhom: 'Frontend UI',
            moTa: 'Xây dựng giao diện người dùng và trải nghiệm người dùng.',
            thanhVien: [
                { thanhVienId: 'user-bruce', vaiTro: 'Trưởng nhóm' },
                { thanhVienId: 'user-diana', vaiTro: 'Thành viên' },
                { thanhVienId: 'user-harley', vaiTro: 'Thành viên' },
            ],
        });
        await frontendTeam.save();

        console.log('2 default teams created.');
        
        // 3. Create some tasks for the teams
        const tasksToCreate = [
            {
                _id: 'task-1',
                tieuDe: 'Xây dựng API xác thực người dùng (JWT)',
                moTa: 'Thiết kế và triển khai endpoint cho việc đăng nhập, đăng ký và refresh token sử dụng JSON Web Tokens.',
                trangThai: 'Đang tiến hành',
                loaiCongViec: 'Tính năng',
                doUuTien: 'Cao',
                nguoiThucHienId: 'user-clark',
                nhomId: coreTeam._id,
                tags: ['api', 'security', 'jwt'],
                ngayHetHan: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            {
                _id: 'task-2',
                tieuDe: 'Fix lỗi hiển thị sai thông tin trên dashboard',
                moTa: 'Dữ liệu thống kê trên dashboard không được cập nhật real-time. Cần điều tra và sửa lỗi phía client.',
                trangThai: 'Cần làm',
                loaiCongViec: 'Lỗi',
                doUuTien: 'Cao',
                nguoiThucHienId: 'user-bruce',
                nhomId: frontendTeam._id,
                tags: ['bug', 'dashboard', 'ui'],
                 ngayHetHan: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            },
            {
                _id: 'task-3',
                tieuDe: 'Thiết kế wireframe và mockup cho trang Profile',
                moTa: 'Tạo wireframe và mockup chi tiết cho trang quản lý thông tin người dùng mới.',
                trangThai: 'Cần làm',
                loaiCongViec: 'Tính năng',
                doUuTien: 'Trung bình',
                nguoiThucHienId: 'user-diana',
                nhomId: frontendTeam._id,
                tags: ['design', 'figma', 'ux'],
            },
            {
                _id: 'task-4',
                tieuDe: 'Tối ưu hóa truy vấn cơ sở dữ liệu cho service Products',
                moTa: 'Một số API của service Products đang có thời gian phản hồi chậm. Cần review và tối ưu lại các câu query MongoDB.',
                trangThai: 'Tồn đọng',
                loaiCongViec: 'Công việc',
                doUuTien: 'Thấp',
                nhomId: coreTeam._id,
                tags: ['database', 'performance', 'mongodb'],
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
