import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, query, where, Timestamp } from 'firebase/firestore';
import type { User, Team, Task, Comment, TeamMember, TaskStatus } from '@/types';

// USER FUNCTIONS
export const getUsers = async (): Promise<User[]> => {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const getUser = async (id: string): Promise<User | null> => {
    if (!id) return null;
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
        // Avoid adding duplicate members
        if (teamData.members.some(member => member.id === userId)) {
            console.log("User already in the team.");
            return;
        }
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
type RawTask = Omit<Task, 'id' | 'team' | 'assignee' | 'comments' | 'createdAt'> & {
    id: string;
    teamId: string;
    assigneeId?: string;
    createdAt: Timestamp;
}

// Helper to populate task details
const populateTask = async (taskData: RawTask): Promise<Task | null> => {
    const { teamId, assigneeId, ...rest } = taskData;
    
    // Fetch team, assignee, and comments in parallel
    const [team, assigneeResult, comments] = await Promise.all([
        getTeam(teamId),
        assigneeId ? getUser(assigneeId) : Promise.resolve(undefined),
        getComments(taskData.id)
    ]);

    // If a team is deleted but tasks still exist, gracefully handle it
    if (!team) {
        console.warn(`Task ${taskData.id} references a deleted team ${teamId}. Skipping task.`);
        return null;
    }

    return {
        ...rest,
        team,
        assignee: assigneeResult || undefined,
        comments,
        createdAt: taskData.createdAt.toDate().toISOString()
    };
};

export const getTasks = async (): Promise<Task[]> => {
    const tasksCol = collection(db, 'tasks');
    const taskSnapshot = await getDocs(tasksCol);
    const rawTasks = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RawTask));
    const populatedTasks = await Promise.all(rawTasks.map(populateTask));

    // Filter out any tasks that failed to populate (e.g., due to a deleted team)
    return populatedTasks.filter((task): task is Task => task !== null);
};

export const getTask = async(id: string): Promise<Task | null> => {
    const taskRef = doc(db, 'tasks', id);
    const taskSnap = await getDoc(taskRef);
    if (!taskSnap.exists()) return null;

    return populateTask({id: taskSnap.id, ...taskSnap.data()} as RawTask);
}

export const getTasksByTeam = async(teamId: string): Promise<Task[]> => {
    const tasksCol = collection(db, 'tasks');
    const q = query(tasksCol, where("teamId", "==", teamId));
    const taskSnapshot = await getDocs(q);
    const tasks = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RawTask));
    const populatedTasks = await Promise.all(tasks.map(populateTask));
    return populatedTasks.filter((task): task is Task => task !== null);
}


export const addTask = async (taskData: Omit<Task, 'id' | 'team' | 'comments' | 'assignee' | 'createdAt'> & { teamId: string, assigneeId?: string }): Promise<string> => {
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

export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<void> => {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, { status });
}

// COMMENT FUNCTIONS
export const getComments = async (taskId: string): Promise<Comment[]> => {
    const commentsCol = collection(db, 'tasks', taskId, 'comments');
    const q = query(commentsCol);
    const commentSnapshot = await getDocs(q);
    
    const comments = await Promise.all(commentSnapshot.docs.map(async (doc) => {
        const commentData = doc.data();
        const author = await getUser(commentData.authorId);

        // Handle cases where author might be deleted
        if (!author) {
            return {
                 id: doc.id, 
                content: commentData.content,
                author: {
                    id: 'deleted-user',
                    name: 'Deleted User',
                    email: '',
                    avatar: '',
                    expertise: '',
                    currentWorkload: 0,
                },
                createdAt: (commentData.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as Comment;
        }

        return { 
            id: doc.id, 
            content: commentData.content,
            author: author,
            createdAt: (commentData.createdAt as Timestamp).toDate().toISOString()
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
