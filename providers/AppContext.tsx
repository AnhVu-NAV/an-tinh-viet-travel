"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Language, Currency, User, Booking, Tour, Location, Course, Discount, Review } from "@/lib/types";
import { EXCHANGE_RATE } from "@/lib/constants";

type AppContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    currency: Currency;
    setCurrency: (curr: Currency) => void;

    user: User | null;
    authReady: boolean;
    sessionReady: boolean;

    login: (email: string, password: string) => Promise<User>;
    logout: () => void;

    tours: Tour[];
    locations: Location[];
    courses: Course[];
    discounts: Discount[];
    reviews: Review[];
    bookings: Booking[];

    addBooking: (booking: Omit<Booking, "id" | "date" | "status">) => Promise<void>;
    updateBookingStatus: (id: string, status: Booking["status"]) => void;
    addReview: (review: Review) => void;

    convertPrice: (priceVnd: number) => string;
    t: (key: string) => string;

    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const LS_KEYS = {
    user: "app_user",
    lang: "app_lang",
    curr: "app_curr",
};

const translations: Record<string, { vi: string; en: string }> = {
    "nav.home": { vi: "Trang chủ", en: "Home" },
    "nav.tours": { vi: "Hành trình", en: "Journeys" },
    "nav.locations": { vi: "Điểm đến", en: "Locations" },
    "nav.courses": { vi: "Khóa học", en: "Courses" },
    "nav.about": { vi: "Về An Tịnh", en: "Our Story" },
    "nav.login": { vi: "Đăng nhập", en: "Login" },
    "nav.admin": { vi: "Quản trị", en: "Admin" },
    "hero.title": { vi: "Tìm Về Sự An Yên", en: "Find Your Inner Peace" },
    "hero.subtitle": { vi: "Hành trình du lịch chữa lành Thân - Tâm - Trí", en: "A journey of healing Body - Mind - Spirit" },
    "btn.book": { vi: "Đặt Ngay", en: "Book Now" },
};

async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal, cache: "no-store" });
    if (!res.ok) throw new Error(`${url} failed: ${res.status}`);
    return res.json();
}

function safeParse<T>(raw: string | null): T | null {
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("vi");
    const [currency, setCurrencyState] = useState<Currency>("VND");

    const [user, setUserState] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);

    const [tours, setTours] = useState<Tour[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sessionReady, setSessionReady] = useState(false);

    const t = (key: string) => translations[key]?.[language] || key;

    const convertPrice = (priceVnd: number) => {
        if (currency === "VND") {
            return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(priceVnd);
        }
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(priceVnd / EXCHANGE_RATE);
    };

    // Hydrate localStorage
    useEffect(() => {
        const u = safeParse<User>(localStorage.getItem(LS_KEYS.user));
        const lang = (localStorage.getItem(LS_KEYS.lang) as Language | null) ?? null;
        const curr = (localStorage.getItem(LS_KEYS.curr) as Currency | null) ?? null;

        if (lang === "vi" || lang === "en") setLanguageState(lang);
        if (curr === "VND" || curr === "USD") setCurrencyState(curr);
        if (u?.id && u?.email) setUserState(u);

        setAuthReady(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(LS_KEYS.lang, lang);
    };

    const setCurrency = (curr: Currency) => {
        setCurrencyState(curr);
        localStorage.setItem(LS_KEYS.curr, curr);
    };

    const setUser = (u: User | null) => {
        setUserState(u);
        if (u) localStorage.setItem(LS_KEYS.user, JSON.stringify(u));
        else localStorage.removeItem(LS_KEYS.user);
    };

    // ✅ refresh nhận overrideUser để tránh stale state
    const refreshInternal = async (overrideUser?: User | null) => {
        setLoading(true);
        setError(null);
        const controller = new AbortController();

        const u = overrideUser ?? user;

        try {
            const [toursData, locationsData, coursesData, discountsData, reviewsData] = await Promise.all([
                fetchJSON<Tour[]>("/api/tours", controller.signal),
                fetchJSON<Location[]>("/api/locations", controller.signal),
                fetchJSON<Course[]>("/api/courses", controller.signal),
                fetchJSON<Discount[]>("/api/discounts", controller.signal),
                fetchJSON<Review[]>("/api/reviews", controller.signal),
            ]);

            setTours(toursData);
            setLocations(locationsData);
            setCourses(coursesData);
            setDiscounts(discountsData);
            setReviews(reviewsData);

            if (u?.id) {
                const res = await fetch("/api/me/profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    cache: "no-store",
                    body: JSON.stringify({ userId: u.id, email: u.email, phone: u.phone ?? null }),
                    signal: controller.signal,
                });
                const data = await res.json().catch(() => ({}));
                setBookings(data?.bookings ?? []);
            } else {
                setBookings([]);
            }
        } catch (e: any) {
            setError(e?.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const refresh = async () => refreshInternal();

    useEffect(() => {
        if (!authReady) return;

        const controller = new AbortController();

        (async () => {
            try {
                // load core data
                const [toursData, locationsData, coursesData] = await Promise.all([
                    fetchJSON<Tour[]>("/api/tours", controller.signal),
                    fetchJSON<Location[]>("/api/locations", controller.signal),
                    fetchJSON<Course[]>("/api/courses", controller.signal),
                ]);

                setTours(toursData);
                setLocations(locationsData);
                setCourses(coursesData);

                // ✅ nếu có user trong localStorage thì refresh bookings để “confirm”
                if (user?.id) {
                    await refreshInternal(user);
                }
            } catch (e: any) {
                if (e?.name !== "AbortError") setError(e?.message || "Failed to load data");
            } finally {
                setLoading(false);
                setSessionReady(true); // ✅ quan trọng
            }
        })();

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authReady]);

    // ✅ Login returns user để LoginPage redirect theo role
    const login = async (email: string, password: string) => {
        setError(null);

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message ?? "Login failed");

        const nextUser: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone ?? "",
            role: data.user.role,
            active: true,
        };

        setUser(nextUser);
        await refreshInternal(nextUser);
        return nextUser;
    };

    const logout = () => {
        setUser(null);
        setBookings([]);
    };

    const addBooking = async (payload: Omit<Booking, "id" | "date" | "status">) => {
        const res = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const newBooking = await res.json();
        setBookings((prev) => [newBooking, ...prev]);
    };

    const updateBookingStatus = (id: string, status: Booking["status"]) => {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    };

    const addReview = (review: Review) => {
        setReviews((prev) => [review, ...prev]);
    };

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            currency,
            setCurrency,
            user,
            authReady,
            sessionReady,
            login,
            logout,
            tours,
            locations,
            courses,
            discounts,
            reviews,
            bookings,
            addBooking,
            updateBookingStatus,
            addReview,
            convertPrice,
            t,
            loading,
            error,
            refresh,
        }),
        [language, currency, user, authReady, sessionReady, tours, locations, courses, discounts, reviews, bookings, loading, error]
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used within AppProvider");
    return ctx;
}