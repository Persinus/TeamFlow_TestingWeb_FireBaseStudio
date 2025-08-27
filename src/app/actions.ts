

"use server";

import type { User, Team, Task, TrangThaiCongViec as TaskStatus, VaiTroThanhVien as TeamMemberRole } from '@/types';
import connectToDatabase from '@/lib/mongodb';
import { User as UserModel, Team as TeamModel, Task as TaskModel } from '@/lib/models';
import { suggestTaskAssignee } from "@/ai/flows/suggest-task-assignee";
import type { SuggestTaskAssigneeInput } from "@/ai/flows/suggest-task-assignee";
import { revalidatePath } from 'next/cache';

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


// --- Task Functions ---
const populateTask = (task: any): Task => {
    // A helper to ensure the populated task has the correct shape after lean() and populate()
    const taskObj = task._doc || task;

    return {
        id: taskObj._id.toString(),
        tieuDe: taskObj.tieuDe,
        moTa: taskObj.moTa,
        trangThai: taskObj.trangThai,
        loaiCongViec: taskObj.loaiCongViec,
        doUuTien: taskObj.doUuTien,
        nhomId: taskObj.nhomId,
        nhom: taskObj.nhom ? {
            ...taskObj.nhom,
            id: taskObj.nhom._id.toString(),
            tenNhom: taskObj.nhom.tenNhom,
            moTa: taskObj.nhom.moTa,
            thanhVien: taskObj.nhom.thanhVien?.map((m: any) => ({
                ...m,
                thanhVienId: m.thanhVienId,
                vaiTro: m.vaiTro,
                user: m.user ? {
                  ...m.user,
                  id: m.user._id.toString(),
                  hoTen: m.user.hoTen,
                  email: m.user.email,
                  anhDaiDien: m.user.anhDaiDien,
                  chuyenMon: m.user.chuyenMon,
                  taiCongViecHienTai: m.user.taiCongViecHienTai,
                } : undefined,
            }))
        } : undefined,
        nguoiThucHienId: taskObj.nguoiThucHienId,
        nguoiThucHien: taskObj.nguoiThucHien ? {
            ...taskObj.nguoiThucHien,
            id: taskObj.nguoiThucHien._id.toString(),
            hoTen: taskObj.nguoiThucHien.hoTen,
            email: taskObj.nguoiThucHien.email,
            anhDaiDien: taskObj.nguoiThucHien.anhDaiDien,
            chuyenMon: taskObj.nguoiThucHien.chuyenMon,
            taiCongViecHienTai: taskObj.nguoiThucHien.taiCongViecHienTai,
        } : undefined,
        ngayTao: taskObj.ngayTao,
        ngayBatDau: taskObj.ngayBatDau,
        ngayHetHan: taskObj.ngayHetHan,
        tags: taskObj.tags,
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
            const userObj = memberObj.user ? (memberObj.user._doc || memberObj.user) : null;
            return {
                thanhVienId: memberObj.thanhVienId,
                vaiTro: memberObj.vaiTro,
                user: userObj ? {
                    ...userObj,
                    id: userObj._id.toString(),
                    hoTen: userObj.hoTen,
                    email: userObj.email,
                    anhDaiDien: userObj.anhDaiDien,
                    chuyenMon: userObj.chuyenMon,
                } : undefined
            };
        }),
    };
};

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
}


export const getTasks = async (): Promise<Task[]> => {
    await connectToDatabase();
    const tasks = await TaskModel.find()
        .populate({ path: 'nhomId', model: TeamModel, populate: { path: 'thanhVien.thanhVienId', model: UserModel, select: 'hoTen anhDaiDien email chuyenMon' } })
        .populate({ path: 'nguoiThucHienId', model: UserModel })
        .lean();

    // Custom population because of schema complexity
    const teams = await TeamModel.find().populate({path: 'thanhVien.thanhVienId', model: UserModel, as: 'user'}).lean();
    const users = await UserModel.find().lean();
    
    return tasks.map((task: any) => {
        const teamData = teams.find(t => t._id === task.nhomId);
        const assigneeData = users.find(u => u._id === task.nguoiThucHienId);
        return {
            ...task,
            id: task._id.toString(),
            nhom: teamData ? {
                ...teamData,
                id: teamData._id.toString(),
                tenNhom: teamData.tenNhom,
                thanhVien: teamData.thanhVien.map((m: any) => ({
                    ...m,
                    user: {
                      ...(m.thanhVienId),
                      id: m.thanhVienId._id.toString(),
                      hoTen: m.thanhVienId.hoTen,
                    }
                }))
            } : undefined,
            nguoiThucHien: assigneeData ? {
                ...assigneeData,
                id: assigneeData._id.toString(),
                hoTen: assigneeData.hoTen,
            } : undefined
        } as Task;
    });
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
    revalidatePath('/');
    revalidatePath(`/teams/${taskData.nhomId}`);
    if (taskData.nguoiThucHienId) {
        revalidatePath(`/profile`);
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

export const getMockUserByEmail = async (email: string): Promise<User | undefined> => {
    return getUsers().then(users => users.find(u => u.email.toLowerCase() === email.toLowerCase()));
};


// --- Team Functions ---
export const getTeams = async (): Promise<Team[]> => {
    await connectToDatabase();
    const teams = await TeamModel.find().populate({ path: 'thanhVien.thanhVienId', model: UserModel, as: 'user' }).lean();
    return teams.map(populateTeam);
};

export const getTeam = async (id: string): Promise<Team | undefined> => {
    await connectToDatabase();
    const team = await TeamModel.findById(id).populate({ path: 'thanhVien.thanhVienId', model: UserModel, as: 'user' }).lean();
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
    await TeamModel.findByIdAndDelete(teamId);
    // Also delete tasks associated with this team
    await TaskModel.deleteMany({ nhomId: teamId });
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
