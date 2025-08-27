
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/types';
import { verifyUserCredentials } from '@/app/actions';
import { MOCK_USERS } from '@/lib/mock-data';

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
       try {
            const foundUser = await verifyUserCredentials({ email, password: pass });
            if (foundUser) {
                setUser(foundUser);
                sessionStorage.setItem('mockUser', JSON.stringify(foundUser));
            } else {
                 throw new Error("Thông tin đăng nhập không hợp lệ");
            }
       } catch (error) {
            throw error;
       } finally {
            setLoading(false);
       }
    };

    const logout = async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUser(null);
        sessionStorage.removeItem('mockUser');
        router.push('/login');
    };

    const register = async (name: string, email: string, pass: string): Promise<void> => {
        // This is a mock. In a real app, this would create a new user in the database.
        // It should call a server action `createUser` which is not implemented yet.
        console.log(`Mock registration for: ${name}, ${email}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        // For now, we'll just throw an error to indicate it's not implemented
        throw new Error("Chức năng đăng ký chưa được triển khai đầy đủ.");
    };

    const updateUser = (updatedUser: User) => {
        setUser(prevUser => {
            if (!prevUser) return null;
            const newUser = {...prevUser, ...updatedUser};
            sessionStorage.setItem('mockUser', JSON.stringify(newUser));
            return newUser;
        });
    };
    
    const value = { user, loading, login, logout, register, updateUser };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth phải được sử dụng trong một AuthProvider');
    }
    return context;
};
