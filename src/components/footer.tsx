
"use client"

import React from 'react';
import { Logo } from './icons';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container mx-auto py-6 px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Logo className="h-6 w-6 text-primary" />
                        <span className="font-semibold">TeamFlow</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} TeamFlow. Đã đăng ký bản quyền.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Link href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
