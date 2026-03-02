"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { useApp } from "@/providers/AppContext";
import { Package, Clock, CheckCircle, XCircle, Star } from "lucide-react";

type Lang = "vi" | "en";

type Booking = {
    id: string;
    userId?: string | null;

    tourId: string;
    scheduleId?: string; // ✅ để cancel/trả slot (nếu API có)
    guests: number;
    totalPrice: number;
    currency: string;
    status: "PENDING" | "PAID" | "COMPLETED" | "CANCELLED";

    date: string; // booking created date: YYYY-MM-DD
    departureDate?: string; // ✅ optional: YYYY-MM-DD (nếu API trả schedule.startDate)
};

type TourLite = {
    id: string;
    title: Record<Lang, string>;
    images: string[];
};

type Review = {
    id: string;
    tourId: string;
    bookingId?: string | null;
    user: string;
    rating: number;
    comment: string;
    date: string; // YYYY-MM-DD
};

type MeProfileRes = {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string | null;
        role: "USER" | "ADMIN" | "SALE";
        active: boolean;
    };
    bookings: Booking[];
    tours: TourLite[];
    reviews: Review[];
};

export default function ProfileClient() {
    const router = useRouter();
    const { user, language, convertPrice } = useApp();

    const [activeTab, setActiveTab] = useState<"history" | "settings">("history");

    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [tours, setTours] = useState<TourLite[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);

    // Review Modal State
    const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; bookingId: string; tourId: string } | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    // Cancel state
    const [cancelingId, setCancelingId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) router.replace("/login");
    }, [user, router]);

    const reloadProfile = async () => {
        if (!user) return;

        const res = await fetch("/api/me/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({ userId: user.id, email: user.email, phone: user.phone ?? null }),
        });
        if (!res.ok) throw new Error(`profile load failed: ${res.status}`);
        const data = (await res.json()) as MeProfileRes;
        setBookings(data.bookings ?? []);
        setTours(data.tours ?? []);
        setReviews(data.reviews ?? []);
    };

    // load profile from DB
    useEffect(() => {
        if (!user) return;

        let alive = true;
        (async () => {
            try {
                setLoading(true);
                await reloadProfile();
            } catch (e) {
                console.error("Load profile error:", e);
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const userBookings = useMemo(
        () => [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [bookings]
    );

    const hasReviewed = (bookingId: string) => reviews.some((r) => r.bookingId === bookingId);

    const canCancel = (b: Booking) => b.status === "PAID" || b.status === "PENDING";

    const handleCancel = async (bookingId: string) => {
        if (!confirm(language === "vi" ? "Bạn chắc chắn muốn hủy đặt chỗ này?" : "Are you sure you want to cancel this booking?")) return;

        try {
            setCancelingId(bookingId);

            // optimistic
            setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" } : b)));

            const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                // rollback bằng reload
                await reloadProfile();
                alert(err?.message ?? (language === "vi" ? "Hủy thất bại" : "Cancel failed"));
                return;
            }

            // nếu muốn chắc chắn đồng bộ: reload (tuỳ bạn)
            await reloadProfile();
        } catch (e) {
            console.error("Cancel booking error:", e);
            await reloadProfile();
            alert(language === "vi" ? "Lỗi hệ thống" : "Server error");
        } finally {
            setCancelingId(null);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewModal || !user) return;

        const optimistic: Review = {
            id: "rv-" + Date.now(),
            tourId: reviewModal.tourId,
            bookingId: reviewModal.bookingId,
            user: user.name,
            rating,
            comment,
            date: new Date().toISOString().slice(0, 10),
        };

        // optimistic UI
        setReviews((prev) => [optimistic, ...prev]);
        setReviewModal(null);
        setComment("");
        setRating(5);

        const res = await fetch("/api/me/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                bookingId: optimistic.bookingId,
                tourId: optimistic.tourId,
                userName: optimistic.user,
                rating: optimistic.rating,
                comment: optimistic.comment,
            }),
        });

        if (!res.ok) {
            // rollback: reload profile
            try {
                await reloadProfile();
            } catch {}
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-sand-50 py-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-3xl shadow-sm border border-sand-200 p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold border-4 border-sand-100">
                        {user.name?.charAt(0) ?? "U"}
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-serif font-bold text-earth-900">{user.name}</h1>
                        <p className="text-stone-500">{user.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-sand-100 text-xs font-bold rounded-full text-stone-600 uppercase tracking-wider">
              {user.role}
            </span>
                    </div>

                    <div className="flex gap-3">
                        <Button variant={activeTab === "history" ? "primary" : "secondary"} onClick={() => setActiveTab("history")}>
                            {language === "vi" ? "Lịch sử đặt chỗ" : "Booking History"}
                        </Button>
                    </div>
                </div>

                {loading && <div className="text-stone-400">Loading profile...</div>}

                {/* Content */}
                {!loading && activeTab === "history" && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-serif font-bold text-earth-900 mb-4">
                            {language === "vi" ? "Chuyến đi của tôi" : "My Journeys"}
                        </h2>

                        {userBookings.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-sand-200">
                                <Package className="w-12 h-12 text-sand-300 mx-auto mb-4" />
                                <p className="text-stone-500 mb-4">
                                    {language === "vi" ? "Bạn chưa đặt chuyến đi nào." : "You have not booked any journeys yet."}
                                </p>
                                <Link href="/tours">
                                    <Button>{language === "vi" ? "Khám phá ngay" : "Explore Now"}</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {userBookings.map((booking) => {
                                    const tour = tours.find((t) => t.id === booking.tourId);
                                    const isCompleted = booking.status === "COMPLETED";
                                    const isReviewed = hasReviewed(booking.id);

                                    const displayDate = booking.departureDate ?? booking.date;

                                    return (
                                        <div
                                            key={booking.id}
                                            className="bg-white rounded-2xl p-6 shadow-sm border border-sand-100 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6"
                                        >
                                            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={tour?.images?.[0] ?? "/placeholder.jpg"} alt="" className="w-full h-full object-cover" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-earth-900">{tour?.title?.[language] ?? "Unknown Tour"}</h3>
                                                        <p className="text-sm text-stone-500">Booking ID: #{booking.id.split("-").pop()}</p>
                                                    </div>

                                                    <div
                                                        className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center ${
                                                            booking.status === "COMPLETED"
                                                                ? "bg-green-50 text-green-700 border-green-100"
                                                                : booking.status === "PENDING"
                                                                    ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                                                                    : booking.status === "PAID"
                                                                        ? "bg-blue-50 text-blue-700 border-blue-100"
                                                                        : "bg-red-50 text-red-700 border-red-100"
                                                        }`}
                                                    >
                                                        {booking.status === "COMPLETED" ? (
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                        ) : booking.status === "CANCELLED" ? (
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                        ) : (
                                                            <Clock className="w-3 h-3 mr-1" />
                                                        )}
                                                        {booking.status}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-stone-600 mb-4">
                                                    <div>
                            <span className="block text-xs text-stone-400 uppercase">
                              {language === "vi" ? "Ngày khởi hành" : "Departure"}
                            </span>
                                                        <span className="font-medium">{displayDate}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs text-stone-400 uppercase">{language === "vi" ? "Số khách" : "Guests"}</span>
                                                        <span className="font-medium">{booking.guests}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs text-stone-400 uppercase">{language === "vi" ? "Tổng tiền" : "Total"}</span>
                                                        <span className="font-medium text-primary">{convertPrice(booking.totalPrice)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3 border-t border-sand-50 pt-4">
                                                    {/* Nếu route tours/[slug] của bạn nhận id thì OK */}
                                                    <Link href={`/tours/${booking.tourId}`}>
                                                        <Button variant="ghost" size="sm">
                                                            {language === "vi" ? "Xem lại Tour" : "View Tour"}
                                                        </Button>
                                                    </Link>

                                                    {canCancel(booking) && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={cancelingId === booking.id}
                                                            onClick={() => handleCancel(booking.id)}
                                                        >
                                                            {cancelingId === booking.id
                                                                ? language === "vi"
                                                                    ? "Đang hủy..."
                                                                    : "Canceling..."
                                                                : language === "vi"
                                                                    ? "Hủy đặt chỗ"
                                                                    : "Cancel"}
                                                        </Button>
                                                    )}

                                                    {isCompleted && !isReviewed && (
                                                        <Button size="sm" onClick={() => setReviewModal({ isOpen: true, bookingId: booking.id, tourId: booking.tourId })}>
                                                            {language === "vi" ? "Đánh giá" : "Write Review"}
                                                        </Button>
                                                    )}

                                                    {isReviewed && (
                                                        <span className="text-sm text-stone-400 flex items-center px-4">
                              <Star className="w-4 h-4 mr-1 text-amber-400 fill-amber-400" />{" "}
                                                            {language === "vi" ? "Đã đánh giá" : "Reviewed"}
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 animate-slide-up">
                        <h3 className="text-2xl font-serif font-bold text-earth-900 mb-2">
                            {language === "vi" ? "Đánh giá chuyến đi" : "Rate your journey"}
                        </h3>
                        <p className="text-stone-500 mb-6">
                            {language === "vi" ? "Chia sẻ trải nghiệm của bạn để giúp cộng đồng." : "Share your experience to help the community."}
                        </p>

                        <form onSubmit={handleSubmitReview}>
                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`p-2 transition-transform hover:scale-110 ${
                                            star <= rating ? "text-amber-400 fill-amber-400" : "text-stone-200"
                                        }`}
                                    >
                                        <Star className={`w-8 h-8 ${star <= rating ? "fill-current" : ""}`} />
                                    </button>
                                ))}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-stone-700 mb-2">{language === "vi" ? "Nhận xét" : "Comments"}</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={language === "vi" ? "Bạn cảm thấy thế nào về chuyến đi..." : "How was your trip..."}
                                    className="w-full p-4 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50"
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button type="button" variant="ghost" onClick={() => setReviewModal(null)}>
                                    {language === "vi" ? "Hủy" : "Cancel"}
                                </Button>
                                <Button type="submit">{language === "vi" ? "Gửi đánh giá" : "Submit Review"}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}