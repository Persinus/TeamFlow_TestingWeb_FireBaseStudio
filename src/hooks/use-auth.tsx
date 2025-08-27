"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/types';

// Mock user data stored in localStorage for persistence across refreshes
const MOCK_USERS_DB_KEY = 'mock_users_db';
const CURRENT_USER_KEY = 'current_user_session';

const getMockUsers = (): User[] => {
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem(MOCK_USERS_DB_KEY);
    return users ? JSON.parse(users) : [];
};

const setMockUsers = (users: User[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(MOCK_USERS_DB_KEY, JSON.stringify(users));
};

// Initialize with a default admin user if it's the first time
if (typeof window !== 'undefined' && !localStorage.getItem(MOCK_USERS_DB_KEY)) {
    const initialUsers: User[] = [
        {
            id: 'user-admin',
            name: 'Admin',
            username: 'admin',
            password: 'Admin@1234', // In a real app, this would be a hashed password
            avatar: 'https://picsum.photos/seed/admin/40/40',
            expertise: 'System Administrator',
            currentWorkload: 0
        }
    ];
    setMockUsers(initialUsers);
}


interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, pass: string) => Promise<void>;
    logout: () => void;
    register: (name: string, username: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // This effect runs on mount to check for a logged-in user
        const checkUserSession = () => {
            const storedUser = localStorage.getItem(CURRENT_USER_KEY);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        };
        checkUserSession();
    }, []);

    useEffect(() => {
        // This effect handles redirection based on auth state
        if (!loading) {
            const isAuthPage = pathname === '/login' || pathname === '/register';
            if (!user && !isAuthPage) {
                router.push('/login');
            } else if (user && isAuthPage) {
                router.push('/');
            }
        }
    }, [user, loading, pathname, router]);

    const login = async (username: string, pass: string): Promise<void> => {
        const users = getMockUsers();
        const foundUser = users.find(u => u.username === username && u.password === pass);

        if (foundUser) {
            const userToStore = { ...foundUser };
            // @ts-ignore
            delete userToStore.password; // Don't store password in session
            setUser(userToStore);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
        } else {
            throw new Error('Invalid username or password');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(CURRENT_USER_KEY);
        router.push('/login');
    };

    const register = async (name: string, username: string, pass: string): Promise<void> => {
        const users = getMockUsers();
        if (users.find(u => u.username === username)) {
            throw new Error('Username already exists');
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            username,
            password: pass, // Again, password would be hashed
            avatar: `https://picsum.photos/seed/${username}/40/40`,
            expertise: 'New Member',
            currentWorkload: 0,
        };

        const updatedUsers = [...users, newUser];
        setMockUsers(updatedUsers);
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
