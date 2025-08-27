
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
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const { user, register, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!authLoading && user) {
            router.push('/');
        }
    }, [user, authLoading, router]);
    
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRegistering(true);
        try {
            await register(name, email, password);
            toast({
                title: 'Đăng ký thành công',
                description: 'Bây giờ bạn có thể đăng nhập bằng tài khoản mới của mình.',
            });
            router.push('/login');
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Đăng ký thất bại',
                description: error.message,
            });
        } finally {
            setIsRegistering(false);
        }
    };
    
    if (authLoading || user) {
        return <div className="flex h-screen items-center justify-center">Đang tải...</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Card className="mx-auto max-w-sm">
                 <CardHeader className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <Logo className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold">TeamFlow</h1>
                    </div>
                    <CardTitle className="text-xl">Đăng ký</CardTitle>
                    <CardDescription>Nhập thông tin của bạn để tạo tài khoản</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="full-name">Họ và tên</Label>
                                <Input 
                                    id="full-name" 
                                    placeholder="Diana Prince" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required 
                                    disabled={isRegistering}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email"
                                    placeholder="diana@wonder.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                    disabled={isRegistering}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Mật khẩu</Label>
                                <Input 
                                    id="password" 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                    disabled={isRegistering}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isRegistering}>
                                {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isRegistering ? 'Đang tạo...' : 'Tạo tài khoản'}
                            </Button>
                        </div>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Đã có tài khoản?{" "}
                        <Link href="/login" className="underline">
                            Đăng nhập
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
