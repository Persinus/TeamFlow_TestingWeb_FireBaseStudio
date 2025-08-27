

"use server";

import bcrypt from 'bcryptjs';
import type { User, Team, Task, TrangThaiCongViec as TaskStatus, VaiTroThanhVien as TeamMemberRole } from '@/types';
import connectToDatabase from '@/lib/mongodb';
import { User as UserModel, Team as TeamModel, Task as TaskModel } from '@/lib/models';
import { suggestTaskAssignee } from "@/ai/flows/suggest-task-assignee";
import type { SuggestTaskAssigneeInput } from "@/ai/flows/suggest-task-assignee";
import { revalidatePath } from 'next/cache';

// --- Auth Functions ---
export const verifyUserCredentials = async (credentials: Pick<User, 'email' | 'matKhau'>): Promise<Omit<User, 'matKhau'> | null> => {
    await connectToDatabase();
    const { email, matKhau } = credentials;

    if (!email || !matKhau) return null;

    const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+matKhau').lean();
    
    if (!user) {
        return null;
    }

    const isMatch = await bcrypt.compare(matKhau, user.matKhau);
    if (!isMatch) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { matKhau: _, ...userWithoutPassword } = user;
    return populateUser(userWithoutPassword);
};


// --- AI Sugggestion Action ---
export async function getAssigneeSuggestion(input: SuggestTaskAssigneeInput) {
    try {
        const result = await suggestTaskAssignee(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("AI suggestion failed:", error);
        return { success: false, error: "Failed to get AI suggestion." };
    }
}


// --- Helper Functions for Populating Data ---
const populateUser = (user: any): User => {
    const userObj = user._doc || user;
    return {
        id: userObj._id.toString(),
        hoTen: userObj.hoTen,
        email: userObj.email,
        anhDaiDien: userObj.anhDaiDien,
        chuyenMon: userObj.chuyenMon,
        taiCongViecHienTai: userObj.taiCongViecHienTai,
        soDienThoai: userObj.soDienThoai,
        ngaySinh: userObj.ngaySinh,
    };
};

const populateTeam = (team: any): Team => {
    const teamObj = team._doc || team;
    return {
        id: teamObj._id.toString(),
        tenNhom: teamObj.tenNhom,
        moTa: teamObj.moTa,
        thanhVien: teamObj.thanhVien.map((m: any) => {
            const memberObj = m._doc || m;
            const userObj = memberObj.thanhVienId ? (memberObj.thanhVienId._doc || memberObj.thanhVienId) : null;
            return {
                thanhVienId: userObj ? userObj._id.toString() : memberObj.thanhVienId.toString(),
                vaiTro: memberObj.vaiTro,
                user: userObj ? populateUser(userObj) : undefined,
            };
        }),
    };
};

const populateTask = (task: any): Task => {
    const taskObj = task._doc || task;
    const populatedTask: Task = {
        id: taskObj._id.toString(),
        tieuDe: taskObj.tieuDe,
        moTa: taskObj.moTa,
        trangThai: taskObj.trangThai,
        loaiCongViec: taskObj.loaiCongViec,
        doUuTien: taskObj.doUuTien,
        nhomId: taskObj.nhomId ? (typeof taskObj.nhomId === 'object' ? taskObj.nhomId._id.toString() : taskObj.nhomId.toString()) : '',
        nguoiThucHienId: taskObj.nguoiThucHienId ? (typeof taskObj.nguoiThucHienId === 'object' ? taskObj.nguoiThucHienId._id.toString() : taskObj.nguoiThucHienId.toString()) : undefined,
        ngayTao: taskObj.ngayTao,
        ngayBatDau: taskObj.ngayBatDau,
        ngayHetHan: taskObj.ngayHetHan,
        tags: taskObj.tags || [],
    };

    if (taskObj.nhomId && typeof taskObj.nhomId === 'object') {
        populatedTask.nhom = populateTeam(taskObj.nhomId);
    }
    if (taskObj.nguoiThucHienId && typeof taskObj.nguoiThucHienId === 'object') {
        populatedTask.nguoiThucHien = populateUser(taskObj.nguoiThucHienId);
    }

    return populatedTask;
};



// --- Task Functions ---
export const getTasks = async (): Promise<Task[]> => {
    await connectToDatabase();
    const tasks = await TaskModel.find()
        .populate({
            path: 'nhomId',
            model: TeamModel,
            populate: {
                path: 'thanhVien.thanhVienId',
                model: UserModel,
                select: 'hoTen anhDaiDien email chuyenMon taiCongViecHienTai',
            },
        })
        .populate({ path: 'nguoiThucHienId', model: UserModel })
        .lean();

    return tasks.map(populateTask);
};

export const getTasksByAssignee = async (assigneeId: string): Promise<Task[]> => {
    await connectToDatabase();
    const tasks = await TaskModel.find({ nguoiThucHienId: assigneeId })
        .populate({ path: 'nhomId', model: TeamModel })
        .populate({ path: 'nguoiThucHienId', model: UserModel })
        .lean();
    return tasks.map(populateTask);
};

export const getTask = async (id: string): Promise<Task | undefined> => {
    await connectToDatabase();
    const task = await TaskModel.findById(id)
       .populate({ path: 'nhomId', model: TeamModel })
       .populate({ path: 'nguoiThucHienId', model: UserModel })
       .lean();
    if (!task) return undefined;
    return populateTask(task);
};

export const getTasksByTeam = async (teamId: string): Promise<Task[]> => {
    await connectToDatabase();
    const tasks = await TaskModel.find({ nhomId: teamId })
        .populate({ path: 'nhomId', model: TeamModel })
        .populate({ path: 'nguoiThucHienId', model: UserModel })
        .lean();
    return tasks.map(populateTask);
};

export const addTask = async (taskData: Omit<Task, 'id' | 'nhom' | 'nguoiThucHien' | 'ngayTao'>): Promise<string> => {
    await connectToDatabase();
    const newTask = new TaskModel({
        ...taskData,
        _id: `task-${Date.now()}`,
    });
    await newTask.save();
    revalidatePath('/');
    revalidatePath(`/teams/${taskData.nhomId}`);
    return newTask._id.toString();
};

export const updateTask = async (taskId: string, taskData: Partial<Omit<Task, 'id' | 'nhom' | 'nguoiThucHien'>>): Promise<void> => {
    await connectToDatabase();
    const updateData: any = { ...taskData };
    if (updateData.nguoiThucHienId === 'unassigned') {
      updateData.nguoiThucHienId = null;
    } 

    await TaskModel.findByIdAndUpdate(taskId, updateData);
    const updatedTask = await TaskModel.findById(taskId);
    revalidatePath('/');
    if (updatedTask) {
        revalidatePath(`/teams/${updatedTask.nhomId}`);
        if(updatedTask.nguoiThucHienId) {
             revalidatePath(`/profile`);
        }
    }
};

export const deleteTask = async (taskId: string): Promise<void> => {
    await connectToDatabase();
    const task = await TaskModel.findById(taskId);
    if (!task) {
        throw new Error('Task not found');
    }
    await TaskModel.findByIdAndDelete(taskId);
    revalidatePath('/');
    revalidatePath(`/teams/${task.nhomId}`);
    if (task.nguoiThucHienId) {
        revalidatePath(`/profile`);
    }
}

export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<void> => {
    await connectToDatabase();
    await TaskModel.findByIdAndUpdate(taskId, { trangThai: status });
    revalidatePath('/');
};

// --- Tag Functions ---
export const getAllTags = async (): Promise<string[]> => {
    await connectToDatabase();
    const tags = await TaskModel.distinct('tags');
    return tags.filter(tag => tag !== null);
};

// --- User Functions ---
export const getUsers = async (): Promise<User[]> => {
    await connectToDatabase();
    const users = await UserModel.find().lean();
    return users.map(populateUser);
};

export const getUser = async (id: string): Promise<User | undefined> => {
    await connectToDatabase();
    const user = await UserModel.findById(id).lean();
    if (!user) return undefined;
    return populateUser(user);
};

export const updateUser = async (userId: string, userData: Partial<Pick<User, 'hoTen' | 'anhDaiDien' | 'soDienThoai' | 'ngaySinh'>>): Promise<User | undefined> => {
    await connectToDatabase();
    const updatedUser = await UserModel.findByIdAndUpdate(userId, userData, { new: true }).lean();
    if (!updatedUser) return undefined;
    revalidatePath('/settings');
    revalidatePath('/profile');
    return populateUser(updatedUser);
};

// --- Team Functions ---
export const getTeams = async (): Promise<Team[]> => {
    await connectToDatabase();
    const teams = await TeamModel.find().populate({ path: 'thanhVien.thanhVienId', model: UserModel, select: 'hoTen anhDaiDien email chuyenMon' }).lean();
    return teams.map(populateTeam);
};

export const getTeam = async (id: string): Promise<Team | undefined> => {
    await connectToDatabase();
    const team = await TeamModel.findById(id).populate({ path: 'thanhVien.thanhVienId', model: UserModel, select: 'hoTen anhDaiDien email chuyenMon taiCongViecHienTai' }).lean();
    if (!team) return undefined;
    return populateTeam(team);
};

export const createTeam = async (teamData: Pick<Team, 'tenNhom' | 'moTa'>, leaderId: string): Promise<string> => {
    await connectToDatabase();
    const leader = await UserModel.findOne({_id: leaderId});
    if (!leader) throw new Error("Leader not found");

    const newTeam = new TeamModel({
        _id: `team-${teamData.tenNhom.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
        tenNhom: teamData.tenNhom,
        moTa: teamData.moTa,
        thanhVien: [{ thanhVienId: leader._id, vaiTro: 'Trưởng nhóm' }],
    });
    await newTeam.save();
    revalidatePath('/settings');
    revalidatePath('/');
    return newTeam._id.toString();
};

export const updateTeam = async (teamId: string, teamData: Partial<Pick<Team, 'tenNhom' | 'moTa'>>): Promise<void> => {
    await connectToDatabase();
    await TeamModel.findByIdAndUpdate(teamId, teamData);
    revalidatePath('/settings');
    revalidatePath('/');
    revalidatePath(`/teams/${teamId}`);
};

export const deleteTeam = async (teamId: string): Promise<void> => {
    await connectToDatabase();
    await TaskModel.deleteMany({ nhomId: teamId });
    await TeamModel.findByIdAndDelete(teamId);
    revalidatePath('/settings');
    revalidatePath('/');
};

export const addTeamMember = async (teamId: string, userId: string): Promise<void> => {
    await connectToDatabase();
    const team = await TeamModel.findById(teamId);
    if (team) {
        if (!team.thanhVien.some((m: any) => m.thanhVienId.equals(userId))) {
            team.thanhVien.push({ thanhVienId: userId, vaiTro: 'Thành viên' } as any);
            await team.save();
        }
    }
    revalidatePath(`/teams/${teamId}`);
};

export const removeTeamMember = async (teamId: string, userId: string): Promise<void> => {
    await connectToDatabase();
    await TeamModel.findByIdAndUpdate(teamId, {
        $pull: { thanhVien: { thanhVienId: userId } }
    });
    revalidatePath(`/teams/${teamId}`);
};

export const updateTeamMemberRole = async (teamId: string, userId: string, role: TeamMemberRole): Promise<void> => {
    await connectToDatabase();
    await TeamModel.updateOne(
        { _id: teamId, 'thanhVien.thanhVienId': userId },
        { $set: { 'thanhVien.$.vaiTro': role } }
    );
    revalidatePath(`/teams/${teamId}`);
};
