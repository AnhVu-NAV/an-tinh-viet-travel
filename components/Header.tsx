"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    Menu,
    X,
    ChevronDown,
    Globe,
    DollarSign,
    LogOut,
    User as UserIcon,
    LayoutDashboard,
} from "lucide-react";

import { useApp } from "@/providers/AppContext";

export function Header() {
    const pathname = usePathname();
    const {
        t,
        language,
        setLanguage,
        currency,
        setCurrency,
        user,
        logout,
    } = useApp();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement | null>(null);

    const isActive = (path: string) =>
        pathname === path
            ? "text-primary font-bold whitespace-nowrap"
            : "text-stone-500 hover:text-primary transition-colors whitespace-nowrap";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!profileRef.current) return;
            if (!profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const toggleLanguage = () => {
        setLanguage(language === "vi" ? "en" : "vi");
    };

    const toggleCurrency = () => {
        setCurrency(currency === "VND" ? "USD" : "VND");
    };

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-sand-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-20 gap-4">
                    <div className="lg:hidden shrink-0">
                        <button
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                            className="p-2 rounded-xl text-earth-900 hover:bg-sand-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                        </button>
                    </div>

                    <Link href="/" className="flex items-center space-x-2 group shrink-0">
                        <Image
                            src="/logo.png"
                            alt="An Tinh Viet Logo"
                            width={56}
                            height={56}
                            className="group-hover:rotate-6 transition-transform duration-300"
                        />
                        <span
                            className="text-xl lg:text-2xl font-serif font-bold text-earth-900 tracking-tight leading-none">
              An Tinh Viet
            </span>
                    </Link>

                    <nav
                        className="hidden lg:flex items-center gap-5 xl:gap-7 flex-1 justify-center whitespace-nowrap min-w-0">
                        <Link href="/" className={isActive("/")}>
                            {t("nav.home")}
                        </Link>
                        <Link href="/tours" className={isActive("/tours")}>
                            {t("nav.tours")}
                        </Link>
                        <Link href="/locations" className={isActive("/locations")}>
                            {t("nav.locations")}
                        </Link>
                        <Link href="/courses" className={isActive("/courses")}>
                            {t("nav.courses")}
                        </Link>
                        <Link href="/test-mental" className={isActive("/test-mental")}>
                            {t("nav.testMental")}
                        </Link>
                        <Link href="/about" className={isActive("/about")}>
                            {t("nav.about")}
                        </Link>
                    </nav>

                    <div className="hidden lg:flex items-center space-x-3 shrink-0">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1 text-sm text-stone-500 hover:text-primary transition-colors whitespace-nowrap"
                        >
                            <Globe className="w-4 h-4"/>
                            <span>{language.toUpperCase()}</span>
                        </button>

                        <span className="text-stone-300">|</span>

                        <button
                            onClick={toggleCurrency}
                            className="flex items-center gap-1 text-sm text-stone-500 hover:text-primary transition-colors whitespace-nowrap"
                        >
                            <DollarSign className="w-4 h-4"/>
                            <span>{currency}</span>
                        </button>

                        {!user ? (
                            <Link href="/login">
                                <button
                                    className="ml-1 px-5 py-2 rounded-full bg-primary text-white hover:opacity-90 transition-opacity font-medium whitespace-nowrap">
                                    {t("nav.login")}
                                </button>
                            </Link>
                        ) : (
                            <div className="relative ml-2 shrink-0" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen((prev) => !prev)}
                                    className="flex items-center gap-2 bg-white border border-sand-200 rounded-full pl-1 pr-2 py-1 hover:shadow-md transition-shadow max-w-[180px]"
                                >
                                    <div
                                        className="w-8 h-8 rounded-full bg-primary/90 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                                        {user.name?.charAt(0)?.toUpperCase() || "A"}
                                    </div>
                                    <span
                                        className="text-earth-900 text-sm font-medium max-w-[80px] xl:max-w-[110px] truncate">
                    {user.name}
                  </span>
                                    <ChevronDown className="w-4 h-4 text-stone-500 shrink-0"/>
                                </button>

                                {isProfileOpen && (
                                    <div
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sand-100 py-2 overflow-hidden">

                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-earth-900 hover:bg-sand-50 transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <UserIcon className="w-4 h-4"/>
                                            <span>{language === "vi" ? "Hồ sơ cá nhân" : "Profile"}</span>
                                        </Link>

                                        {user.role === "ADMIN" && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center w-full px-4 py-2.5 text-sm text-stone-600 hover:bg-sand-100 rounded-xl transition-colors"
                                            >
                                                <LayoutDashboard className="w-4 h-4 mr-3 text-amber-500"/>
                                                {language === "vi" ? "Trang quản trị" : "Admin Dashboard"}
                                            </Link>
                                        )}

                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                logout();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                        >
                                            <LogOut className="w-4 h-4"/>
                                            <span>{language === "vi" ? "Đăng xuất" : "Logout"}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="lg:hidden border-t border-sand-100 py-4 animate-fade-in">
                        <div className="flex flex-col space-y-1">
                            <Link
                                href="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="px-3 py-2 rounded-xl text-earth-900 hover:bg-sand-50"
                            >
                                {t("nav.home")}
                            </Link>
                            <Link
                                href="/tours"
                                onClick={() => setIsMenuOpen(false)}
                                className="px-3 py-2 rounded-xl text-earth-900 hover:bg-sand-50"
                            >
                                {t("nav.tours")}
                            </Link>
                            <Link
                                href="/locations"
                                onClick={() => setIsMenuOpen(false)}
                                className="px-3 py-2 rounded-xl text-earth-900 hover:bg-sand-50"
                            >
                                {t("nav.locations")}
                            </Link>
                            <Link
                                href="/courses"
                                onClick={() => setIsMenuOpen(false)}
                                className="px-3 py-2 rounded-xl text-earth-900 hover:bg-sand-50"
                            >
                                {t("nav.courses")}
                            </Link>
                            <Link
                                href="/test-mental"
                                onClick={() => setIsMenuOpen(false)}
                                className="px-3 py-2 rounded-xl text-earth-900 hover:bg-sand-50"
                            >
                                {t("nav.testMental")}
                            </Link>
                            <Link
                                href="/about"
                                onClick={() => setIsMenuOpen(false)}
                                className="px-3 py-2 rounded-xl text-earth-900 hover:bg-sand-50"
                            >
                                {t("nav.about")}
                            </Link>

                            <div className="h-px bg-sand-100 my-2"/>

                            <button
                                onClick={toggleLanguage}
                                className="px-3 py-2 rounded-xl text-left text-earth-900 hover:bg-sand-50"
                            >
                                {language === "vi" ? "Ngôn ngữ: Tiếng Việt" : "Language: English"}
                            </button>

                            <button
                                onClick={toggleCurrency}
                                className="px-3 py-2 rounded-xl text-left text-earth-900 hover:bg-sand-50"
                            >
                                {language === "vi" ? `Tiền tệ: ${currency}` : `Currency: ${currency}`}
                            </button>

                            {!user ? (
                                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                    <button
                                        className="mt-2 w-full px-4 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity">
                                        {t("nav.login")}
                                    </button>
                                </Link>
                            ) : (
                                <>
                                    {user.role === "ADMIN" && (
                                        <Link
                                            href="/admin"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="px-3 py-2 rounded-xl text-earth-900 hover:bg-sand-50"
                                        >
                                            {t("nav.admin")}
                                        </Link>
                                    )}

                                    <Link
                                        href="/profile"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="px-3 py-2 rounded-xl text-earth-900 hover:bg-sand-50"
                                    >
                                        {language === "vi" ? "Hồ sơ cá nhân" : "Profile"}
                                    </Link>

                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            logout();
                                        }}
                                        className="px-3 py-2 rounded-xl text-left text-red-600 hover:bg-red-50"
                                    >
                                        {language === "vi" ? "Đăng xuất" : "Logout"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}