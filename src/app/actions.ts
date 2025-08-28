
"use server";

import bcrypt from 'bcryptjs';
import type { User, Team, Task, TrangThaiCongViec as TaskStatus, VaiTroThanhVien as TeamMemberRole } from '@/types';
import connectToDatabase from '@/lib/mongodb';
import { User as UserModel, Team as TeamModel, Task as TaskModel } from '@/lib/models';
import { suggestTaskAssignee } from "@/ai/flows/suggest-task-assignee";
import type { SuggestTaskAssigneeInput } from "@/ai/flows/suggest-task-assignee";
import { generateTaskDescription } from "@/ai/flows/generate-task-description";
import type { GenerateTaskDescriptionInput } from "@/ai/flows/generate-task-description";
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

export const createUser = async (userData: Pick<User, 'hoTen' | 'email' | 'matKhau'>): Promise<Omit<User, 'matKhau'>> => {
    await connectToDatabase();
    const { hoTen, email, matKhau } = userData;

    if (!hoTen || !email || !matKhau) {
        throw new Error("Missing required fields");
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new Error("Email đã tồn tại. Vui lòng chọn một email khác.");
    }

    const hashedPassword = await bcrypt.hash(matKhau, 10);
    
    const newUser = new UserModel({
        _id: `user-${hoTen.toLowerCase().replace(/\s/g, '')}-${Date.now()}`,
        hoTen,
        email: email.toLowerCase(),
        matKhau: hashedPassword,
        anhDaiDien: `https://api.dicebear.com/7.x/micah/svg?seed=${hoTen.replace(/\s/g, '')}`,
        chuyenMon: "Thành viên mới",
        taiCongViecHienTai: 0,
    });

    await newUser.save();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { matKhau: _, ...userWithoutPassword } = newUser.toObject();
    return populateUser(userWithoutPassword);
}


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

export async function generateDescriptionFromAI(input: GenerateTaskDescriptionInput) {
    try {
        const result = await generateTaskDescription(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("AI description generation failed:", error);
        return { success: false, error: "Failed to get AI description." };
    }
}


// --- Helper Functions for Populating Data ---
const populateUser = (user: any): User => {
    const userObj = user?._doc || user;
    if (!userObj) return user; // Return original if it's not a mongoose doc
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
    const teamObj = team?._doc || team;
     if (!teamObj) return team;
    return {
        id: teamObj._id.toString(),
        tenNhom: teamObj.tenNhom,
        moTa: teamObj.moTa,
        thanhVien: (teamObj.thanhVien || []).map((m: any) => {
            const memberObj = m?._doc || m;
            if (!memberObj || !memberObj.thanhVienId) return null;

            const userObj = memberObj.thanhVienId?._doc || memberObj.thanhVienId;
            const isPopulated = typeof userObj === 'object' && userObj !== null && '_id' in userObj;
            
            return {
                thanhVienId: isPopulated ? userObj._id.toString() : memberObj.thanhVienId.toString(),
                vaiTro: memberObj.vaiTro,
                user: isPopulated ? populateUser(userObj) : undefined,
            };
        }).filter(Boolean),
    };
};

const populateTask = (task: any): Task => {
    const taskObj = task?._doc || task;
    if (!taskObj) return task;
    
    const populatedTask: Task = {
        id: taskObj._id.toString(),
        tieuDe: taskObj.tieuDe,
        moTa: taskObj.moTa,
        trangThai: taskObj.trangThai,
        loaiCongViec: taskObj.loaiCongViec,
        doUuTien: taskObj.doUuTien,
        nguoiTaoId: taskObj.nguoiTaoId?.toString(),
        ngayTao: taskObj.ngayTao,
        ngayBatDau: taskObj.ngayBatDau,
        ngayHetHan: taskObj.ngayHetHan,
        tags: taskObj.tags || [],
    };

    if (taskObj.nhomId) {
        if (typeof taskObj.nhomId === 'object' && taskObj.nhomId !== null && '_id' in taskObj.nhomId) {
            populatedTask.nhomId = taskObj.nhomId._id.toString();
            populatedTask.nhom = populateTeam(taskObj.nhomId);
        } else {
            populatedTask.nhomId = taskObj.nhomId.toString();
        }
    }

    if (taskObj.nguoiThucHienId) {
        if (typeof taskObj.nguoiThucHienId === 'object' && taskObj.nguoiThucHienId !== null && '_id' in taskObj.nguoiThucHienId) {
            populatedTask.nguoiThucHienId = taskObj.nguoiThucHienId._id.toString();
            populatedTask.nguoiThucHien = populateUser(taskObj.nguoiThucHienId);
        } else {
            populatedTask.nguoiThucHienId = taskObj.nguoiThucHienId.toString();
        }
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

export const addTask = async (taskData: Omit<Task, 'id' | 'nhom' | 'nguoiThucHien' | 'ngayTao'>, creatorId: string): Promise<string> => {
    await connectToDatabase();
    
    // --- Permission Check ---
    if (taskData.nhomId) {
        const team = await TeamModel.findById(taskData.nhomId);
        if (!team) {
            throw new Error("Đội không tồn tại.");
        }
        const member = team.thanhVien?.find((m: any) => m.thanhVienId.toString() === creatorId);
        if (!member) {
            throw new Error("Bạn không phải là thành viên của đội này.");
        }
        
        if (taskData.nguoiThucHienId && !team.thanhVien?.some((m: any) => m.thanhVienId.toString() === taskData.nguoiThucHienId)) {
            throw new Error("Người được giao không phải là thành viên của đội này.");
        }

        if (member.vaiTro === 'Thành viên' && taskData.nguoiThucHienId !== creatorId) {
             throw new Error("Bạn chỉ có thể tạo công việc cho chính mình.");
        }

    } else { // Personal task
        if (taskData.nguoiThucHienId !== creatorId) {
            throw new Error("Không thể giao công việc cá nhân cho người khác.");
        }
    }

    const newTask = new TaskModel({
        ...taskData,
        _id: `task-${Date.now()}`,
        nguoiTaoId: creatorId, // Set creator
        nhomId: taskData.nhomId || null,
    });
    await newTask.save();
    
    revalidatePath('/');
    revalidatePath('/board');
    if (taskData.nhomId) {
      revalidatePath(`/teams/${taskData.nhomId}`);
    }
    if (taskData.nguoiThucHienId) {
      revalidatePath('/profile');
    }

    return newTask._id.toString();
};


export const updateTask = async (taskId: string, taskData: Partial<Omit<Task, 'id' | 'nhom' | 'nguoiThucHien'>>): Promise<Task> => {
    await connectToDatabase();
    const updateData: any = { ...taskData };
    if (updateData.nguoiThucHienId === 'unassigned' || updateData.nguoiThucHienId === null) {
      updateData.nguoiThucHienId = null;
    } 
    if (!updateData.nhomId || updateData.nhomId === 'personal') {
        updateData.nhomId = null;
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(taskId, { $set: updateData }, { new: true });
    if (!updatedTask) {
        throw new Error('Task not found');
    }
    revalidatePath('/');
    revalidatePath('/board');
    if (updatedTask.nhomId) {
      revalidatePath(`/teams/${updatedTask.nhomId}`);
    }
    if(updatedTask.nguoiThucHienId) {
         revalidatePath(`/profile`);
    }
    return populateTask(updatedTask);
};

export const deleteTask = async (taskId: string, userId: string): Promise<void> => {
    await connectToDatabase();
    
    const task = await TaskModel.findById(taskId).populate('nhomId');
    if (!task) {
        throw new Error('Không tìm thấy công việc.');
    }

    // Case 1: Personal task (no team)
    if (!task.nhomId) {
        if (task.nguoiTaoId?.toString() !== userId) {
            throw new Error('Bạn không có quyền xóa công việc này.');
        }
    } 
    // Case 2: Team task
    else {
        const team = await TeamModel.findById(task.nhomId);
        if (!team) {
             throw new Error('Đội liên kết với công việc không tồn tại.');
        }
        const member = team.thanhVien?.find((m: any) => m.thanhVienId.toString() === userId);
        if (!member) {
            throw new Error('Bạn không phải là thành viên của đội này.');
        }
        if (member.vaiTro !== 'Trưởng nhóm') {
             throw new Error('Chỉ có Trưởng nhóm mới có quyền xóa công việc của đội.');
        }
    }
    
    // If permission checks pass, delete the task
    await TaskModel.findByIdAndDelete(taskId);

    revalidatePath('/');
    revalidatePath('/board');
    if (task.nhomId) {
      revalidatePath(`/teams/${task.nhomId}`);
    }
    if (task.nguoiThucHienId) {
        revalidatePath(`/profile`);
    }
}

export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<void> => {
    await connectToDatabase();
    await TaskModel.findByIdAndUpdate(taskId, { trangThai: status });
    revalidatePath('/board');
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

export const getTeamsForUser = async (userId: string): Promise<Team[]> => {
    await connectToDatabase();
    const teams = await TeamModel.find({ 'thanhVien.thanhVienId': userId })
        .populate({
            path: 'thanhVien.thanhVienId',
            model: UserModel,
            select: 'hoTen anhDaiDien email chuyenMon taiCongViecHienTai'
        }).lean();
    return teams.map(populateTeam);
}


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
    revalidatePath('/board');
    return newTeam._id.toString();
};

export const updateTeam = async (teamId: string, teamData: Partial<Pick<Team, 'tenNhom' | 'moTa'>>): Promise<void> => {
    await connectToDatabase();
    await TeamModel.findByIdAndUpdate(teamId, teamData);
    revalidatePath('/settings');
    revalidatePath('/board');
    revalidatePath(`/teams/${teamId}`);
};

export const deleteTeam = async (teamId: string): Promise<void> => {
    await connectToDatabase();
    await TaskModel.deleteMany({ nhomId: teamId });
    await TeamModel.findByIdAndDelete(teamId);
    revalidatePath('/settings');
    revalidatePath('/board');
};

export const addTeamMember = async (teamId: string, userId: string): Promise<void> => {
    await connectToDatabase();
    const team = await TeamModel.findById(teamId);
    if (team) {
        if (!team.thanhVien) {
            team.thanhVien = [];
        }
        
        const isAlreadyMember = team.thanhVien.some((m: any) => m.thanhVienId.toString() === userId);
        
        if (!isAlreadyMember) {
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
