'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/providers/AppContext';
import { Button } from '@/components/Button';
import { Flower } from 'lucide-react';
import Image from "next/image";

export default function LoginPage() {
    const { login, language } = useApp();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError(language === 'vi' ? 'Vui lòng nhập đủ thông tin' : 'Please fill in all fields');
            return;
        }

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            setError(data?.message ?? 'Login failed');
            return;
        }

        // bạn đang có login(email, role)
        login(data.user.email, data.user.role);

        router.push(data.user.role === 'ADMIN' ? '/admin' : '/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-sand-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/logo.png"
                            alt="An Tinh Viet"
                            width={100}
                            height={60}
                            className="object-contain opacity-90"
                        />
                    </div>
                    <h2 className="mt-6 text-3xl font-serif font-bold text-earth-900">
                        {language === 'vi' ? 'Chào mừng trở lại' : 'Welcome back'}
                    </h2>
                    <p className="mt-2 text-sm text-stone-500">An Tinh Viet - Spiritual Travel</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="text-sm font-medium text-earth-900 ml-1">Email address</label>
                            <input
                                type="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-sand-200 placeholder-stone-400 text-earth-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm mt-1 bg-sand-50"
                                placeholder="Tài khoản"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-earth-900 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-sand-200 placeholder-stone-400 text-earth-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm mt-1 bg-sand-50"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <div className="space-y-4">
                        <Button type="submit" className="w-full justify-center py-3">
                            {language === 'vi' ? 'Đăng nhập' : 'Sign in'}
                        </Button>

                        <div className="text-center text-sm text-stone-500">
                            {language === 'vi' ? 'Chưa có tài khoản?' : "Don't have an account?"}{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/register')}
                                className="text-primary font-bold hover:underline"
                            >
                                {language === 'vi' ? 'Đăng ký' : 'Register'}
                            </button>
                        </div>
                    </div>

                    {/*<div className="text-center text-xs text-stone-400">*/}
                    {/*    <p>Admin: <b>admin@antinh.com</b> / <b>123456</b></p>*/}
                    {/*    <p>User: <b>user@antinh.com</b> / <b>123456</b></p>*/}
                    {/*</div>*/}
                </form>
            </div>
        </div>
    );
}