"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { EXCHANGE_RATE } from "@/lib/constants";
import type {
    Booking,
    Course,
    Currency,
    Discount,
    JourneyCarePrompt,
    Language,
    Location,
    Review,
    Tour,
    User,
} from "@/lib/types";

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
    journeyCarePrompts: JourneyCarePrompt[];
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
    "nav.testMental": { vi: "Khảo Sát Tinh Thần", en: "Mental Health Test" },
    "nav.login": { vi: "Đăng nhập", en: "Login" },
    "nav.admin": { vi: "Quản trị", en: "Admin" },
    "hero.title": { vi: "Tìm Về Sự An Yên", en: "Find Your Inner Peace" },
    "hero.subtitle": { vi: "Hành trình du lịch chữa lành Thân - Tâm - Trí", en: "A journey of healing Body - Mind - Spirit" },
    "btn.book": { vi: "Đặt Ngay", en: "Book Now" },
};

async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, { signal, cache: "no-store" });
    if (!response.ok) throw new Error(`${url} failed: ${response.status}`);
    return response.json();
}

function safeParse<T>(raw: string | null): T | null {
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
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
    const [journeyCarePrompts, setJourneyCarePrompts] = useState<JourneyCarePrompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sessionReady, setSessionReady] = useState(false);

    const t = (key: string) => translations[key]?.[language] || key;

    const convertPrice = (priceVnd: number) => {
        if (currency === "VND") {
            return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(priceVnd);
        }
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(priceVnd / EXCHANGE_RATE);
    };

    useEffect(() => {
        const hydratedUser = safeParse<User>(localStorage.getItem(LS_KEYS.user));
        const lang = localStorage.getItem(LS_KEYS.lang) as Language | null;
        const curr = localStorage.getItem(LS_KEYS.curr) as Currency | null;

        if (lang === "vi" || lang === "en") setLanguageState(lang);
        if (curr === "VND" || curr === "USD") setCurrencyState(curr);
        if (hydratedUser?.id && hydratedUser?.email) setUserState(hydratedUser);

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

    const setUser = (value: User | null) => {
        setUserState(value);
        if (value) localStorage.setItem(LS_KEYS.user, JSON.stringify(value));
        else localStorage.removeItem(LS_KEYS.user);
    };

    const refreshInternal = async (overrideUser?: User | null) => {
        setLoading(true);
        setError(null);

        const currentUser = overrideUser ?? user;
        const controller = new AbortController();

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

            if (currentUser?.id) {
                const response = await fetch("/api/me/profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    cache: "no-store",
                    body: JSON.stringify({
                        userId: currentUser.id,
                        email: currentUser.email,
                        phone: currentUser.phone ?? null,
                    }),
                    signal: controller.signal,
                });
                const data = await response.json().catch(() => ({}));
                setBookings(data?.bookings ?? []);
                setJourneyCarePrompts(data?.journeyCarePrompts ?? []);
            } else {
                setBookings([]);
                setJourneyCarePrompts([]);
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Failed to load data"));
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
                const [toursData, locationsData, coursesData] = await Promise.all([
                    fetchJSON<Tour[]>("/api/tours", controller.signal),
                    fetchJSON<Location[]>("/api/locations", controller.signal),
                    fetchJSON<Course[]>("/api/courses", controller.signal),
                ]);

                setTours(toursData);
                setLocations(locationsData);
                setCourses(coursesData);

                if (user?.id) {
                    await refreshInternal(user);
                }

                void fetch("/api/journey-care/process", {
                    method: "POST",
                    cache: "no-store",
                }).catch(() => undefined);
            } catch (err: unknown) {
                if (!(err instanceof Error && err.name === "AbortError")) {
                    setError(getErrorMessage(err, "Failed to load data"));
                }
            } finally {
                setLoading(false);
                setSessionReady(true);
            }
        })();

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authReady]);

    const login = async (email: string, password: string) => {
        setError(null);

        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.message ?? "Login failed");

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
        setJourneyCarePrompts([]);
    };

    const addBooking = async (payload: Omit<Booking, "id" | "date" | "status">) => {
        await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        await refreshInternal(user);
    };

    const updateBookingStatus = (id: string, status: Booking["status"]) => {
        setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
    };

    const addReview = (review: Review) => {
        setReviews((prev) => [review, ...prev]);
    };

    const value = {
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
        journeyCarePrompts,
        addBooking,
        updateBookingStatus,
        addReview,
        convertPrice,
        t,
        loading,
        error,
        refresh,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within AppProvider");
    return context;
}
