

export interface User {
  id: string; // Map to _id
  hoTen: string;
  email: string;
  matKhau?: string; // Hashed password - should not be sent to client
  anhDaiDien: string; // URL to avatar image
  chuyenMon: string; // e.g., "Backend Developer", "Frontend Developer", "DevOps"
  taiCongViecHienTai: number; // e.g., number of active tasks
  soDienThoai?: string;
  ngaySinh?: string; // ISO Date string
}

export type VaiTroThanhVien = 'Trưởng nhóm' | 'Thành viên';

export interface ThanhVienNhom {
  thanhVienId: string; // Ref to User._id
  vaiTro: VaiTroThanhVien;
  user?: User; // Populated field
}

export interface Team {
  id: string; // Map to _id
  tenNhom: string;
  moTa?: string;
  thanhVien: ThanhVienNhom[];
}

export type TrangThaiCongViec = 'Cần làm' | 'Đang tiến hành' | 'Hoàn thành' | 'Tồn đọng';
export type LoaiCongViec = 'Tính năng' | 'Lỗi' | 'Công việc';
export type DoUuTien = 'Cao' | 'Trung bình' | 'Thấp';


export interface Task {
  id: string; // Map to _id
  tieuDe: string;
  moTa: string;
  trangThai: TrangThaiCongViec;
  loaiCongViec: LoaiCongViec;
  doUuTien: DoUuTien;

  nhomId: string; // Ref to Team._id
  nhom?: Team; // Populated field

  nguoiThucHienId?: string; // Ref to User._id
  nguoiThucHien?: User; // Populated field
  
  ngayTao: string | Date; // ISO string or Date object
  ngayBatDau?: string | Date; // ISO string or Date object
  ngayHetHan?: string | Date; // ISO string or Date object
  
  tags?: string[];
}
