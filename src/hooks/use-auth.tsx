
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/types';
import { verifyUserCredentials, createUser } from '@/app/actions';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
    register: (name: string, email: string, pass:string) => Promise<void>;
    updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkUser = () => {
            try {
                const storedUser = sessionStorage.getItem('teamflow-user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to parse user from session storage", error);
                sessionStorage.removeItem('teamflow-user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
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
            const foundUser = await verifyUserCredentials({ email, matKhau: pass });
            if (foundUser) {
                setUser(foundUser);
                sessionStorage.setItem('teamflow-user', JSON.stringify(foundUser));
                router.push('/');
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
        sessionStorage.removeItem('teamflow-user');
        router.push('/login');
    };

    const register = async (name: string, email: string, pass: string): Promise<void> => {
        setLoading(true);
        try {
            await createUser({ hoTen: name, email, matKhau: pass });
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = (updatedUser: Partial<User>) => {
        setUser(prevUser => {
            if (!prevUser) return null;
            const newUser = {...prevUser, ...updatedUser};
            sessionStorage.setItem('teamflow-user', JSON.stringify(newUser));
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
