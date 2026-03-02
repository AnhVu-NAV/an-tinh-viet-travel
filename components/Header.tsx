"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/providers/AppContext";
import { Menu, X, Globe, DollarSign, User as UserIcon, LayoutDashboard, Flower, LogOut, ChevronDown } from "lucide-react";
import {Button} from "@/components/Button";
import Image from "next/image";

export default function Header() {
    const { language, setLanguage, currency, setCurrency, user, logout, t } = useApp();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const isActive = (path: string) =>
        pathname === path ? "text-primary font-bold" : "text-stone-500 hover:text-primary transition-colors";

    const canAccessDashboard = user?.role === "ADMIN" || user?.role === "SALE";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-sand-50/80 backdrop-blur-md border-b border-sand-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <Image
                            src="/logo.png" // đặt ảnh trong thư mục public
                            alt="An Tinh Viet Logo"
                            width={80}
                            height={80}
                            className="group-hover:rotate-45 transition-transform duration-500"
                        />
                        <span className="text-2xl font-serif font-bold text-earth-900 tracking-tight">An Tinh Viet</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex space-x-8">
                        <Link href="/" className={isActive("/")}>{t("nav.home")}</Link>
                        <Link href="/tours" className={isActive("/tours")}>{t("nav.tours")}</Link>
                        <Link href="/locations" className={isActive("/locations")}>{t("nav.locations")}</Link>
                        <Link href="/courses" className={isActive("/courses")}>{t("nav.courses")}</Link>
                        <Link href="/about" className={isActive("/about")}>{t("nav.about")}</Link>
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
                            className="text-stone-400 hover:text-primary flex items-center text-xs uppercase font-medium"
                        >
                            <Globe className="w-3 h-3 mr-1" /> {language}
                        </button>

                        <div className="h-4 w-px bg-sand-300" />

                        <button
                            onClick={() => setCurrency(currency === "VND" ? "USD" : "VND")}
                            className="text-stone-400 hover:text-primary flex items-center text-xs font-medium"
                        >
                            <DollarSign className="w-3 h-3 mr-1" /> {currency}
                        </button>

                        {user ? (
                            <div className="relative ml-4" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-2 bg-white border border-sand-200 rounded-full pl-1 pr-3 py-1 hover:shadow-md transition-shadow"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="text-earth-900 text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                                    <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sand-100 overflow-hidden animate-fade-in origin-top-right">
                                        <div className="px-4 py-3 border-b border-sand-100 bg-sand-50">
                                            <p className="text-xs text-stone-500 uppercase font-bold">{language === "vi" ? "Tài khoản" : "Account"}</p>
                                            <p className="text-sm font-bold text-earth-900 truncate">{user.email}</p>
                                        </div>
                                        <div className="p-1">
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center w-full px-4 py-2.5 text-sm text-stone-600 hover:bg-sand-100 rounded-xl transition-colors"
                                            >
                                                <UserIcon className="w-4 h-4 mr-3 text-primary" />
                                                {language === "vi" ? "Hồ sơ của tôi" : "My Profile"}
                                            </Link>

                                            {canAccessDashboard && (
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center w-full px-4 py-2.5 text-sm text-stone-600 hover:bg-sand-100 rounded-xl transition-colors"
                                                >
                                                    <LayoutDashboard className="w-4 h-4 mr-3 text-amber-500" />
                                                    {language === "vi" ? "Trang quản trị" : "Admin Dashboard"}
                                                </Link>
                                            )}

                                            <button
                                                onClick={() => { logout(); setIsProfileOpen(false); }}
                                                className="flex items-center w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <LogOut className="w-4 h-4 mr-3" />
                                                {language === "vi" ? "Đăng xuất" : "Logout"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="ml-2">
                                <Button variant="primary" size="sm">{t("nav.login")}</Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-earth-900">
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-sand-50 border-t border-sand-200 absolute w-full h-screen">
                    <div className="px-4 pt-4 pb-6 space-y-2 flex flex-col items-center text-lg">
                        <Link href="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-earth-900">{t("nav.home")}</Link>
                        <Link href="/tours" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-earth-900">{t("nav.tours")}</Link>
                        <Link href="/locations" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-earth-900">{t("nav.locations")}</Link>
                        <Link href="/courses" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-earth-900">{t("nav.courses")}</Link>

                        {user && (
                            <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-primary font-bold">
                                {language === "vi" ? "Hồ sơ của tôi" : "My Profile"}
                            </Link>
                        )}

                        {canAccessDashboard && (
                            <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-amber-600 font-bold">
                                Admin Dashboard
                            </Link>
                        )}

                        {!user ? (
                            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="mt-4 w-full">
                                <Button className="w-full">Login</Button>
                            </Link>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => { logout(); setIsMenuOpen(false); }}
                                className="mt-4 w-full border-red-200 text-red-500"
                            >
                                Logout
                            </Button>
                        )}

                        <div className="flex space-x-6 pt-8 mt-4 w-full justify-center">
                            <button onClick={() => setLanguage(language === "vi" ? "en" : "vi")} className="uppercase text-sm font-bold text-stone-500">{language}</button>
                            <button onClick={() => setCurrency(currency === "VND" ? "USD" : "VND")} className="uppercase text-sm font-bold text-stone-500">{currency}</button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}