"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Language, Currency, User, Booking, Tour, Location, Course, Discount, Review } from "@/lib/types";
import { EXCHANGE_RATE } from "@/lib/constants"; // giữ exchange rate thôi (hoặc đưa vào env/config)

type AppContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    currency: Currency;
    setCurrency: (curr: Currency) => void;

    user: User | null;
    login: (email: string, role?: User["role"]) => void;
    logout: () => void;

    tours: Tour[];
    locations: Location[];
    courses: Course[];
    discounts: Discount[];
    reviews: Review[];
    bookings: Booking[];

    addBooking: (booking: Booking) => void;
    updateBookingStatus: (id: string, status: Booking["status"]) => void;
    addReview: (review: Review) => void;

    convertPrice: (priceVnd: number) => string;
    t: (key: string) => string;

    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

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

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("vi");
    const [currency, setCurrency] = useState<Currency>("VND");

    // Auth mock tạm (DB auth làm sau)
    const [user, setUser] = useState<User | null>(null);

    const [tours, setTours] = useState<Tour[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const t = (key: string) => translations[key]?.[language] || key;

    const convertPrice = (priceVnd: number) => {
        if (currency === "VND") {
            return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(priceVnd);
        }
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(priceVnd / EXCHANGE_RATE);
    };

    const refresh = async () => {
        setLoading(true);
        setError(null);
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

            // booking: chỉ fetch khi có user (và bạn có endpoint my)
            if (user) {
                const myBookings = await fetchJSON<Booking[]>("/api/bookings/my", controller.signal);
                setBookings(myBookings);
            } else {
                setBookings([]);
            }

        } catch (e: any) {
            setError(e?.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // Load data từ DB khi app mount
    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const [toursData, locationsData, coursesData] = await Promise.all([
                    fetchJSON<Tour[]>("/api/tours", controller.signal),
                    fetchJSON<Location[]>("/api/locations", controller.signal),
                    fetchJSON<Course[]>("/api/courses", controller.signal),
                ]);
                setTours(toursData);
                setLocations(locationsData);
                setCourses(coursesData);
            } catch (e: any) {
                if (e?.name !== "AbortError") setError(e?.message || "Failed to load data");
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

    const login = async (email: string, role: User["role"] = "USER") => {
        setUser({ id: "temp", name: email.split("@")[0], email, role, active: true });
        await refresh();
    };
    const logout = async () => {
        setUser(null);
        setBookings([]);
    };

    const addBooking = async (payload: Omit<Booking,"id"|"date"|"status">) => {
        const res = await fetch("/api/bookings", { method:"POST", body: JSON.stringify(payload) });
        const newBooking = await res.json();
        setBookings(prev => [newBooking, ...prev]);
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
        [language, currency, user, tours, locations, courses, discounts, reviews, bookings, loading, error]
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used within AppProvider");
    return ctx;
}