

import mongoose, { Schema, models, model, Document, Model } from 'mongoose';

// --- User Schema (NguoiDung) ---
const UserSchema = new Schema({
  _id: { type: String, required: true },
  hoTen: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  matKhau: { type: String, required: true, select: false },
  anhDaiDien: { type: String, required: true },
  chuyenMon: { type: String, required: true },
  taiCongViecHienTai: { type: Number, default: 0 },
  soDienThoai: String,
  ngaySinh: String,
}, { _id: false, versionKey: false });

// --- Team Schema (Nhom) ---
const ThanhVienNhomSchema = new Schema({
  thanhVienId: { type: String, ref: 'User', required: true },
  vaiTro: { type: String, enum: ['Trưởng nhóm', 'Thành viên'], required: true },
}, { _id: false });

const TeamSchema = new Schema({
  _id: { type: String, required: true },
  tenNhom: { type: String, required: true },
  moTa: String,
  thanhVien: [ThanhVienNhomSchema],
}, { _id: false, versionKey: false });

// --- Task Schema (CongViec) ---
const TaskSchema = new Schema({
  _id: { type: String, required: true },
  tieuDe: { type: String, required: true },
  moTa: { type: String, default: '' },
  trangThai: { type: String, enum: ['Cần làm', 'Đang tiến hành', 'Hoàn thành', 'Tồn đọng'], required: true },
  loaiCongViec: { type: String, enum: ['Tính năng', 'Lỗi', 'Công việc'], default: 'Công việc' },
  doUuTien: { type: String, enum: ['Cao', 'Trung bình', 'Thấp'], default: 'Trung bình' },
  nguoiTaoId: { type: String, ref: 'User', required: true },
  nguoiThucHienId: { type: String, ref: 'User', default: null },
  nhomId: { type: String, ref: 'Team', required: false, default: null },
  ngayTao: { type: Date, default: Date.now },
  ngayBatDau: Date,
  ngayHetHan: Date,
  tags: [String],
  gitLinks: { type: [String], default: [] },
}, { _id: false, versionKey: false });

// --- Task Template Schema ---
const TaskTemplateSchema = new Schema({
    _id: { type: String, required: true },
    tenMau: { type: String, required: true },
    tieuDe: { type: String, required: true },
    moTa: { type: String, default: '' },
    loaiCongViec: { type: String, enum: ['Tính năng', 'Lỗi', 'Công việc'], default: 'Công việc' },
    doUuTien: { type: String, enum: ['Cao', 'Trung bình', 'Thấp'], default: 'Trung bình' },
    tags: [String],
    nguoiTaoId: { type: String, ref: 'User', required: true },
}, { _id: false, versionKey: false });


// To prevent model overwrite errors in Next.js hot-reloading environments
export const User = (models.User || model('User', UserSchema)) as Model<Document & import('@/types').User>;
export const Team = (models.Team || model('Team', TeamSchema)) as Model<Document & import('@/types').Team>;
export const Task = (models.Task || model('Task', TaskSchema)) as Model<Document & import('@/types').Task>;
export const TaskTemplate = (models.TaskTemplate || model('TaskTemplate', TaskTemplateSchema)) as Model<Document & import('@/types').TaskTemplate>;
