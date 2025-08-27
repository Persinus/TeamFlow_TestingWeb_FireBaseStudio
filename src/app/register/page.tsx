"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { user, register } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);
    
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(name, username, password);
            toast({
                title: 'Registration Successful',
                description: 'You can now log in with your new account.',
            });
            router.push('/login');
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Registration Failed',
                description: error.message,
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Card className="mx-auto max-w-sm">
                 <CardHeader className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <Logo className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold">TeamFlow</h1>
                    </div>
                    <CardTitle className="text-xl">Sign Up</CardTitle>
                    <CardDescription>Enter your information to create an account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="full-name">Full Name</Label>
                                <Input 
                                    id="full-name" 
                                    placeholder="Diana Prince" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input 
                                    id="username" 
                                    placeholder="diana" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password" 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Create an account
                            </Button>
                        </div>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
