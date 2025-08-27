import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, query, where } from 'firebase/firestore';
import type { User, Team, Task, Comment } from '@/types';

// USER FUNCTIONS
export const getUsers = async (): Promise<User[]> => {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const getUser = async (id: string): Promise<User | null> => {
    const userRef = doc(db, 'users', id);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;
    return { id: userSnap.id, ...userSnap.data() } as User;
};


// TEAM FUNCTIONS
export const getTeams = async (): Promise<Team[]> => {
    const teamsCol = collection(db, 'teams');
    const teamSnapshot = await getDocs(teamsCol);
    return teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
};

export const getTeam = async (id: string): Promise<Team | null> => {
    const teamRef = doc(db, 'teams', id);
    const teamSnap = await getDoc(teamRef);
    if (!teamSnap.exists()) return null;
    return { id: teamSnap.id, ...teamSnap.data() } as Team;
};

export const addTeamMember = async (teamId: string, userId: string): Promise<void> => {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    if (teamSnap.exists()) {
        const teamData = teamSnap.data() as Team;
        const newMembers = [...teamData.members, { id: userId, role: 'member' }];
        await updateDoc(teamRef, { members: newMembers });
    }
};

export const removeTeamMember = async (teamId: string, userId: string): Promise<void> => {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    if (teamSnap.exists()) {
        const teamData = teamSnap.data() as Team;
        const newMembers = teamData.members.filter(member => member.id !== userId);
        await updateDoc(teamRef, { members: newMembers });
    }
};

export const updateTeamMemberRole = async (teamId: string, userId: string, role: 'leader' | 'member'): Promise<void> => {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    if (teamSnap.exists()) {
        const teamData = teamSnap.data() as Team;
        const newMembers = teamData.members.map(member => member.id === userId ? { ...member, role } : member);
        await updateDoc(teamRef, { members: newMembers });
    }
};


// TASK FUNCTIONS
// Helper to populate task details
const populateTask = async (taskData: Omit<Task, 'team' | 'assignee' | 'comments'> & {id: string}): Promise<Task> => {
    const { teamId, assigneeId, ...rest } = taskData;
    
    const team = await getTeam(teamId);
    const assignee = assigneeId ? await getUser(assigneeId) : undefined;
    const comments = await getComments(taskData.id);

    return {
        ...rest,
        team: team!,
        assignee,
        comments
    };
};

export const getTasks = async (): Promise<Task[]> => {
    const tasksCol = collection(db, 'tasks');
    const taskSnapshot = await getDocs(tasksCol);
    const tasks = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    return Promise.all(tasks.map(populateTask));
};

export const getTask = async(id: string): Promise<Task | null> => {
    const taskRef = doc(db, 'tasks', id);
    const taskSnap = await getDoc(taskRef);
    if (!taskSnap.exists()) return null;

    return populateTask({id: taskSnap.id, ...taskSnap.data()} as any);
}

export const getTasksByTeam = async(teamId: string): Promise<Task[]> => {
    const tasksCol = collection(db, 'tasks');
    const q = query(tasksCol, where("teamId", "==", teamId));
    const taskSnapshot = await getDocs(q);
    const tasks = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    return Promise.all(tasks.map(populateTask));
}


export const addTask = async (taskData: Omit<Task, 'id' | 'team' | 'comments' | 'assignee'> & { teamId: string, assigneeId?: string }): Promise<string> => {
    const tasksCol = collection(db, 'tasks');
    const docRef = await addDoc(tasksCol, {
        ...taskData,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, updates);
};

export const updateTaskStatus = async (taskId: string, status: Task['status']): Promise<void> => {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, { status });
}

// COMMENT FUNCTIONS
export const getComments = async (taskId: string): Promise<Comment[]> => {
    const commentsCol = collection(db, 'tasks', taskId, 'comments');
    const commentSnapshot = await getDocs(commentsCol);
    
    const comments = await Promise.all(commentSnapshot.docs.map(async (doc) => {
        const commentData = doc.data();
        const author = await getUser(commentData.authorId);
        return { 
            id: doc.id, 
            ...commentData,
            author: author!,
            createdAt: commentData.createdAt.toDate().toISOString()
        } as Comment;
    }));

    return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const addComment = async (taskId: string, content: string, authorId: string): Promise<void> => {
    const commentsCol = collection(db, 'tasks', taskId, 'comments');
    await addDoc(commentsCol, {
        content,
        authorId,
        createdAt: serverTimestamp(),
    });
};
