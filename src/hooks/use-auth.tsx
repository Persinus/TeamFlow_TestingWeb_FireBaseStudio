
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import type { User } from '@/types';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, collection, writeBatch, getDocs, query } from 'firebase/firestore';

// Helper function to create a user profile in Firestore
const createUserProfile = async (firebaseUser: FirebaseUser, name: string): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    // Update Firebase Auth profile display name
    await updateProfile(firebaseUser, { displayName: name });

    // Create profile in Firestore only if it doesn't exist
    if (!userSnap.exists()) {
        const userProfileData: Omit<User, 'id' | 'createdAt'> = {
            name,
            email: firebaseUser.email || '',
            avatar: `https://picsum.photos/seed/${firebaseUser.uid}/200/200`,
            expertise: 'New Member', // Default expertise
            currentWorkload: 0,
        };
        await setDoc(userRef, { 
            ...userProfileData,
            createdAt: serverTimestamp(),
        });
        return { id: firebaseUser.uid, ...userProfileData } as User;
    }
    
    const userData = userSnap.data();
    return { id: userSnap.id, ...userData } as User;
};

// One-time function to create initial data if it doesn't exist
const seedInitialData = async (adminUserId: string) => {
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);

    // Only seed if there's only the admin user
    if (usersSnapshot.docs.length > 1) {
        console.log('Database already has users. Skipping seed.');
        return;
    }
    
    console.log('No users found besides admin. Seeding initial data...');
    const batch = writeBatch(db);

    // Create more users
    const usersToCreate = [
        { id: 'user-bruce', name: 'Bruce Wayne', expertise: 'Frontend Development' },
        { id: 'user-clark', name: 'Clark Kent', expertise: 'Backend Development' },
        { id: 'user-diana', name: 'Diana Prince', expertise: 'UI/UX Design' },
        { id: 'user-barry', name: 'Barry Allen', expertise: 'DevOps & Infrastructure' },
    ];

    for (const userData of usersToCreate) {
        const userRef = doc(db, 'users', userData.id);
        batch.set(userRef, {
            name: userData.name,
            email: `${userData.name.split(' ')[0].toLowerCase()}@teamflow.com`,
            avatar: `https://picsum.photos/seed/${userData.id}/200/200`,
            expertise: userData.expertise,
            currentWorkload: 0,
            createdAt: serverTimestamp(),
        });
    }

    // Create teams
    const teamsToCreate = [
        { 
            id: 'team-frontend', 
            name: 'Frontend Wizards', 
            members: [{ id: adminUserId, role: 'leader' }, { id: 'user-diana', role: 'member' }] 
        },
        { 
            id: 'team-backend', 
            name: 'Backend Brigade', 
            members: [{ id: 'user-clark', role: 'leader' }, { id: 'user-bruce', role: 'member' }] 
        },
        { 
            id: 'team-infra', 
            name: 'Infra Avengers', 
            members: [{ id: 'user-barry', role: 'leader' }] 
        },
    ];

     for (const teamData of teamsToCreate) {
        const teamRef = doc(db, 'teams', teamData.id);
        batch.set(teamRef, {
            name: teamData.name,
            members: teamData.members,
            createdAt: serverTimestamp()
        });
    }

    // Create tasks
    const tasksToCreate = [
      { title: 'Design new dashboard layout', description: 'Create mockups and prototypes for the v2 dashboard.', status: 'todo', teamId: 'team-frontend', assigneeId: 'user-diana' },
      { title: 'Implement user authentication API', description: 'Set up JWT-based authentication endpoints.', status: 'in-progress', teamId: 'team-backend', assigneeId: 'user-clark' },
      { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment.', status: 'done', teamId: 'team-infra', assigneeId: 'user-barry' },
      { title: 'Develop landing page components', description: 'Build reusable React components for the new marketing site.', status: 'in-progress', teamId: 'team-frontend', assigneeId: adminUserId },
      { title: 'Refactor database schema', description: 'Optimize Firestore queries and data structures.', status: 'todo', teamId: 'team-backend', assigneeId: 'user-bruce' },
      { title: 'User profile page design', description: 'Design the user settings and profile page.', status: 'backlog', teamId: 'team-frontend' },
    ];

    for (const taskData of tasksToCreate) {
        const taskRef = doc(collection(db, 'tasks'));
        batch.set(taskRef, {
            ...taskData,
            createdAt: serverTimestamp()
        });
    }

    await batch.commit();
    console.log('Initial data seeded successfully!');
};


interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
    register: (name: string, email: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUser({ id: userSnap.id, ...userSnap.data() } as User);
                } else {
                    // This case handles users who completed auth but not profile creation
                    // (e.g. first-time registration)
                    const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
                    const newUser = await createUserProfile(firebaseUser, name);
                    setUser(newUser);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!loading) {
            const isAuthPage = pathname === '/login' || pathname === '/register';
            if (!user && !isAuthPage) {
                router.push('/login');
            } else if (user && isAuthPage) {
                router.push('/');
            }
        }
    }, [user, loading, pathname, router]);

    const login = async (email: string, pass: string): Promise<void> => {
       await signInWithEmailAndPassword(auth, email, pass);
       // After login, the onAuthStateChanged listener will handle setting the user state
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        setUser(null); // Clear user state immediately
        router.push('/login');
    };

    const register = async (name: string, email: string, pass: string): Promise<void> => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newUser = await createUserProfile(userCredential.user, name);
        // Special case for the first user (admin) to seed data
        if (email.toLowerCase() === 'admin@teamflow.com') {
            await updateDoc(doc(db, 'users', newUser.id), { expertise: 'Project Overlord' });
            await seedInitialData(newUser.id);
        }
        // onAuthStateChanged will set the user state and trigger redirect
    };

    const value = { user, loading, login, logout, register };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
