"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/providers/AppContext";
import { Button } from "@/components/Button";
import Image from "next/image";

export default function RegisterPage() {
    const router = useRouter();
    const { language, login } = useApp();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState(""); // optional
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const n = name.trim();
        const em = email.trim();
        const pw = password.trim();
        const ph = phone.trim();

        if (!n || !em || !pw) {
            setError(language === "vi" ? "Vui lòng nhập đủ thông tin" : "Please fill in all required fields");
            return;
        }
        if (pw.length < 6) {
            setError(language === "vi" ? "Mật khẩu tối thiểu 6 ký tự" : "Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
                body: JSON.stringify({
                    name: n,
                    email: em,
                    phone: ph || null,
                    password: pw,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.message ?? (language === "vi" ? "Đăng ký thất bại" : "Register failed"));
                return;
            }

            // Optional: auto login ngay sau khi đăng ký
            // Nếu AppContext login(email, role) thì dùng:
            const user = data.user;
            if (user?.email && user?.role) login(user.email, user.role);

            router.push("/");
        } catch (e: any) {
            setError(e?.message ?? (language === "vi" ? "Lỗi hệ thống" : "Server error"));
        } finally {
            setLoading(false);
        }
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
                        {language === "vi" ? "Tạo tài khoản" : "Create account"}
                    </h2>
                    <p className="mt-2 text-sm text-stone-500">An Tinh Viet - Spiritual Travel</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="text-sm font-medium text-earth-900 ml-1">
                                {language === "vi" ? "Họ tên" : "Full name"}
                            </label>
                            <input
                                type="text"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-sand-200 placeholder-stone-400 text-earth-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm mt-1 bg-sand-50"
                                placeholder={language === "vi" ? "Tên của bạn" : "Your name"}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-earth-900 ml-1">
                                {language === "vi" ? "Số điện thoại (tuỳ chọn)" : "Phone (optional)"}
                            </label>
                            <input
                                type="tel"
                                className="appearance-none relative block w-full px-4 py-3 border border-sand-200 placeholder-stone-400 text-earth-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm mt-1 bg-sand-50"
                                placeholder={language === "vi" ? "SĐT" : "Phone"}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <p className="text-xs text-stone-400 mt-1 ml-1">
                                {language === "vi"
                                    ? "Nếu bạn đã từng book dạng guest, nhập SĐT để hệ thống tự liên kết booking."
                                    : "If you booked as guest before, enter phone to auto-link bookings."}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-earth-900 ml-1">Email</label>
                            <input
                                type="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-sand-200 placeholder-stone-400 text-earth-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm mt-1 bg-sand-50"
                                placeholder={language === "vi" ? "Email" : "Email"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-earth-900 ml-1">
                                {language === "vi" ? "Mật khẩu" : "Password"}
                            </label>
                            <input
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-sand-200 placeholder-stone-400 text-earth-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm mt-1 bg-sand-50"
                                placeholder={language === "vi" ? "Tối thiểu 6 ký tự" : "At least 6 characters"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <div className="space-y-3">
                        <Button type="submit" className="w-full justify-center py-3" disabled={loading}>
                            {loading ? (language === "vi" ? "Đang tạo..." : "Creating...") : language === "vi" ? "Đăng ký" : "Sign up"}
                        </Button>

                        <div className="text-center text-sm text-stone-500">
                            {language === "vi" ? "Đã có tài khoản?" : "Already have an account?"}{" "}
                            <Link href="/login" className="text-primary font-bold hover:underline">
                                {language === "vi" ? "Đăng nhập" : "Sign in"}
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}