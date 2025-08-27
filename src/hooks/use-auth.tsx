
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import type { User } from '@/types';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

// Helper function to create a user profile in Firestore
const createUserProfile = async (firebaseUser: FirebaseUser, name: string) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    // Update Firebase Auth profile display name
    await updateProfile(firebaseUser, { displayName: name });

    // Create profile in Firestore only if it doesn't exist
    if (!userSnap.exists()) {
        const userProfile: Omit<User, 'id'> = {
            name,
            email: firebaseUser.email || '',
            avatar: `https://picsum.photos/seed/${firebaseUser.uid}/40/40`,
            expertise: name === 'Admin' ? 'Project Overlord' : 'New Member',
            currentWorkload: 0,
            createdAt: serverTimestamp(),
        };
        await setDoc(userRef, userProfile);
        return { id: firebaseUser.uid, ...userProfile } as User;
    }
    
    const userData = userSnap.data();
    // Special case to update Admin expertise if they were created with a different one
    if (name === 'Admin' && userData.expertise !== 'Project Overlord') {
        await updateDoc(userRef, { expertise: 'Project Overlord' });
        return { id: userSnap.id, ...userData, expertise: 'Project Overlord' } as User;
    }
    return { id: userSnap.id, ...userData } as User;
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
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        router.push('/login');
    };

    const register = async (name: string, email: string, pass: string): Promise<void> => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await createUserProfile(userCredential.user, name);
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
