"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import type { User } from '@/types';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Helper function to create a user profile in Firestore
const createUserProfile = async (firebaseUser: FirebaseUser, name: string) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userProfile: Omit<User, 'id' | 'password'> = {
        name,
        email: firebaseUser.email || '',
        avatar: `https://picsum.photos/seed/${firebaseUser.uid}/40/40`,
        expertise: 'New Member',
        currentWorkload: 0,
        createdAt: serverTimestamp(),
    };
    await setDoc(userRef, userProfile);
    return { id: firebaseUser.uid, ...userProfile } as User;
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
                    // Handle case where user exists in Auth but not Firestore
                    // This could happen if Firestore document creation failed during registration
                    setUser(null);
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
