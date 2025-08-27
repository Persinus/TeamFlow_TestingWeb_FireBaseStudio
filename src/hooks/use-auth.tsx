

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/types';
import { MOCK_USERS, updateUser as apiUpdateUser } from '@/lib/data';

const adminUser = MOCK_USERS.find(u => u.email === 'admin@teamflow.com');
if (!adminUser) {
    throw new Error("Missing mock admin user");
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
    register: (name: string, email: string, pass:string) => Promise<void>;
    updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Simulate checking for a logged-in user from a previous session
        const storedUser = sessionStorage.getItem('mockUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // If no user in session, set default admin user for demo purposes
            sessionStorage.setItem('mockUser', JSON.stringify(adminUser));
            setUser(adminUser);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (loading) return; 

        const isAuthPage = pathname === '/login' || pathname === '/register';
        
        if (!user && !isAuthPage) {
            router.push('/login');
        } else if (user && isAuthPage) {
            router.push('/');
        }
    }, [user, loading, pathname, router]);

    const login = async (email: string, pass: string): Promise<void> => {
       setLoading(true);
       await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency

       const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

       if (foundUser && pass === 'Admin@1234') { // Using a generic password for mock
           setUser(foundUser);
           sessionStorage.setItem('mockUser', JSON.stringify(foundUser));
       } else {
           setLoading(false);
           throw new Error("Invalid credentials");
       }
    };

    const logout = async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUser(null);
        sessionStorage.removeItem('mockUser');
        router.push('/login');
    };

    const register = async (name: string, email: string, pass: string): Promise<void> => {
        // This is a mock, so we don't actually create a new user.
        // We just pretend it was successful.
        console.log(`Mock registration for: ${name}, ${email}`);
        await new Promise(resolve => setTimeout(resolve, 500));
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        sessionStorage.setItem('mockUser', JSON.stringify(updatedUser));
    };
    
    const value = { user, loading, login, logout, register, updateUser };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
