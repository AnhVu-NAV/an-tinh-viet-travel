"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, MessageCircleHeart, Package, Star, XCircle } from "lucide-react";

import { Button } from "@/components/Button";
import type { Booking, JourneyState, Review } from "@/lib/types";
import { useApp } from "@/providers/AppContext";

type Lang = "vi" | "en";

type TourLite = {
    id: string;
    title: Record<Lang, string>;
    images: string[];
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

function getJourneyStateLabel(state: JourneyState | undefined, language: Lang) {
    switch (state) {
        case "UPCOMING":
            return language === "vi" ? "Sắp khởi hành" : "Upcoming";
        case "IN_PROGRESS":
            return language === "vi" ? "Đang trong chuyến đi" : "In progress";
        case "FINISHED":
            return language === "vi" ? "Hành trình đã kết thúc" : "Journey finished";
        case "CANCELLED":
            return language === "vi" ? "Đã hủy" : "Cancelled";
        default:
            return language === "vi" ? "Chưa rõ trạng thái" : "Unknown";
    }
}

function getJourneyBadgeStyle(state: JourneyState | undefined) {
    switch (state) {
        case "IN_PROGRESS":
            return "border-amber-100 bg-amber-50 text-amber-700";
        case "FINISHED":
            return "border-green-100 bg-green-50 text-green-700";
        case "CANCELLED":
            return "border-red-100 bg-red-50 text-red-700";
        case "UPCOMING":
        default:
            return "border-blue-100 bg-blue-50 text-blue-700";
    }
}

export default function ProfileClient() {
    const router = useRouter();
    const { language, convertPrice, sessionReady, user } = useApp();

    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [tours, setTours] = useState<TourLite[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewModal, setReviewModal] = useState<{ bookingId: string; tourId: string } | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [cancelingId, setCancelingId] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionReady) return;
        if (!user) {
            router.replace("/login");
        }
    }, [router, sessionReady, user]);

    const reloadProfile = async () => {
        if (!user) return;

        const response = await fetch("/api/me/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({ userId: user.id, email: user.email, phone: user.phone ?? null }),
        });

        if (!response.ok) throw new Error(`profile load failed: ${response.status}`);
        const data = (await response.json()) as MeProfileRes;

        setBookings(data.bookings ?? []);
        setTours(data.tours ?? []);
        setReviews(data.reviews ?? []);
    };

    useEffect(() => {
        if (!user) return;

        let active = true;

        (async () => {
            try {
                setLoading(true);
                await reloadProfile();
            } catch (error) {
                console.error("Load profile error:", error);
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const userBookings = useMemo(
        () => [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [bookings]
    );

    const hasReviewed = (bookingId: string) => reviews.some((review) => review.bookingId === bookingId);
    const canCancel = (booking: Booking) => booking.status === "PAID" || booking.status === "PENDING";

    const handleCancel = async (bookingId: string) => {
        const confirmed = confirm(
            language === "vi" ? "Bạn chắc chắn muốn hủy đặt chỗ này?" : "Are you sure you want to cancel this booking?"
        );
        if (!confirmed) return;

        try {
            setCancelingId(bookingId);
            setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, status: "CANCELLED" } : booking)));

            const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                await reloadProfile();
                alert(error?.message ?? (language === "vi" ? "Hủy thất bại" : "Cancel failed"));
                return;
            }

            await reloadProfile();
        } catch (error) {
            console.error("Cancel booking error:", error);
            await reloadProfile();
            alert(language === "vi" ? "Lỗi hệ thống" : "Server error");
        } finally {
            setCancelingId(null);
        }
    };

    const handleSubmitReview = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!reviewModal || !user) return;

        const optimisticReview: Review = {
            id: `rv-${Date.now()}`,
            tourId: reviewModal.tourId,
            bookingId: reviewModal.bookingId,
            user: user.name,
            rating,
            comment,
            date: new Date().toISOString().slice(0, 10),
        };

        setReviews((prev) => [optimisticReview, ...prev]);
        setReviewModal(null);
        setComment("");
        setRating(5);

        const response = await fetch("/api/me/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                bookingId: optimisticReview.bookingId,
                tourId: optimisticReview.tourId,
                userName: optimisticReview.user,
                rating: optimisticReview.rating,
                comment: optimisticReview.comment,
            }),
        });

        if (!response.ok) {
            try {
                await reloadProfile();
            } catch {}
        } else {
            await reloadProfile();
        }
    };

    if (!sessionReady) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-sand-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm font-medium text-stone-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-sand-50 px-4 py-12 sm:px-6">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex flex-col items-center gap-6 rounded-3xl border border-sand-200 bg-white p-8 shadow-sm md:flex-row">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-sand-100 bg-primary text-3xl font-bold text-white">
                        {user.name?.charAt(0) ?? "U"}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-earth-900">{user.name}</h1>
                        <p className="text-stone-500">{user.email}</p>
                        <span className="mt-2 inline-block rounded-full bg-sand-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-stone-600">
                            {user.role}
                        </span>
                    </div>
                </div>

                {loading && <div className="text-stone-400">Loading profile...</div>}

                {!loading && (
                    <div className="space-y-6">
                        <h2 className="mb-4 text-2xl font-bold text-earth-900">
                            {language === "vi" ? "Chuyến đi của tôi" : "My Journeys"}
                        </h2>

                        {userBookings.length === 0 ? (
                            <div className="rounded-3xl border border-sand-200 bg-white py-12 text-center">
                                <Package className="mx-auto mb-4 h-12 w-12 text-sand-300" />
                                <p className="mb-4 text-stone-500">
                                    {language === "vi" ? "Bạn chưa đặt chuyến đi nào." : "You have not booked any journeys yet."}
                                </p>
                                <Link href="/tours">
                                    <Button>{language === "vi" ? "Khám phá ngay" : "Explore now"}</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {userBookings.map((booking) => {
                                    const tour = tours.find((item) => item.id === booking.tourId);
                                    const isReviewed = hasReviewed(booking.id);
                                    const canReview = booking.journeyState === "FINISHED" && !isReviewed;
                                    const displayDate = booking.departureDate ?? booking.date;
                                    const stateLabel = getJourneyStateLabel(booking.journeyState, language);

                                    return (
                                        <div
                                            key={booking.id}
                                            className="flex flex-col gap-6 rounded-2xl border border-sand-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:flex-row"
                                        >
                                            <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl md:w-48">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={tour?.images?.[0] ?? "/placeholder.jpg"} alt="" className="h-full w-full object-cover" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="mb-2 flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-earth-900">{tour?.title?.[language] ?? "Unknown Tour"}</h3>
                                                        <p className="text-sm text-stone-500">Booking ID: #{booking.id.split("-").pop()}</p>
                                                        <p className="mt-1 text-sm text-primary">{stateLabel}</p>
                                                    </div>

                                                    <div
                                                        className={`flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getJourneyBadgeStyle(
                                                            booking.journeyState
                                                        )}`}
                                                    >
                                                        {booking.journeyState === "FINISHED" ? (
                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                        ) : booking.journeyState === "CANCELLED" ? (
                                                            <XCircle className="mr-1 h-3 w-3" />
                                                        ) : (
                                                            <Clock className="mr-1 h-3 w-3" />
                                                        )}
                                                        {stateLabel}
                                                    </div>
                                                </div>

                                                <div className="mb-4 grid grid-cols-2 gap-4 text-sm text-stone-600 md:grid-cols-4">
                                                    <div>
                                                        <span className="block text-xs uppercase text-stone-400">
                                                            {language === "vi" ? "Ngày khởi hành" : "Departure"}
                                                        </span>
                                                        <span className="font-medium">{displayDate}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs uppercase text-stone-400">
                                                            {language === "vi" ? "Số khách" : "Guests"}
                                                        </span>
                                                        <span className="font-medium">{booking.guests}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs uppercase text-stone-400">
                                                            {language === "vi" ? "Thời lượng" : "Duration"}
                                                        </span>
                                                        <span className="font-medium">
                                                            {booking.durationDays ?? 1} {language === "vi" ? "ngày" : "days"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs uppercase text-stone-400">
                                                            {language === "vi" ? "Tổng tiền" : "Total"}
                                                        </span>
                                                        <span className="font-medium text-primary">{convertPrice(booking.totalPrice)}</span>
                                                    </div>
                                                </div>

                                                {booking.journeyState === "IN_PROGRESS" && (
                                                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                                        <MessageCircleHeart className="h-4 w-4" />
                                                        {language === "vi"
                                                            ? "Chatbot sẽ tự động hỏi thăm bạn trong suốt hành trình."
                                                            : "The chatbot will keep checking in with you during the journey."}
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap justify-end gap-3 border-t border-sand-50 pt-4">
                                                    <Link href={`/tours/${booking.tourId}`}>
                                                        <Button variant="ghost" size="sm">
                                                            {language === "vi" ? "Xem lại tour" : "View tour"}
                                                        </Button>
                                                    </Link>

                                                    {canCancel(booking) && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={cancelingId === booking.id}
                                                            onClick={() => void handleCancel(booking.id)}
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

                                                    {canReview && (
                                                        <Button size="sm" onClick={() => setReviewModal({ bookingId: booking.id, tourId: booking.tourId })}>
                                                            {language === "vi" ? "Đánh giá" : "Write review"}
                                                        </Button>
                                                    )}

                                                    {isReviewed && (
                                                        <span className="flex items-center px-4 text-sm text-stone-400">
                                                            <Star className="mr-1 h-4 w-4 fill-amber-400 text-amber-400" />
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

            {reviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
                        <h3 className="mb-2 text-2xl font-bold text-earth-900">
                            {language === "vi" ? "Đánh giá chuyến đi" : "Rate your journey"}
                        </h3>
                        <p className="mb-6 text-stone-500">
                            {language === "vi"
                                ? "Chia sẻ trải nghiệm của bạn để An Tịnh Việt chăm sóc tốt hơn ở những hành trình sau."
                                : "Share your experience so An Tinh Viet can care better on the next journeys."}
                        </p>

                        <form onSubmit={handleSubmitReview}>
                            <div className="mb-6 flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((starValue) => (
                                    <button
                                        key={starValue}
                                        type="button"
                                        onClick={() => setRating(starValue)}
                                        className={`p-2 transition-transform hover:scale-110 ${
                                            starValue <= rating ? "fill-amber-400 text-amber-400" : "text-stone-200"
                                        }`}
                                    >
                                        <Star className={`h-8 w-8 ${starValue <= rating ? "fill-current" : ""}`} />
                                    </button>
                                ))}
                            </div>

                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-bold text-stone-700">
                                    {language === "vi" ? "Nhận xét" : "Comments"}
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value)}
                                    placeholder={language === "vi" ? "Bạn cảm thấy thế nào về chuyến đi..." : "How was your trip..."}
                                    className="w-full rounded-xl border border-sand-200 bg-sand-50 p-4 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => setReviewModal(null)}>
                                    {language === "vi" ? "Hủy" : "Cancel"}
                                </Button>
                                <Button type="submit">{language === "vi" ? "Gửi đánh giá" : "Submit review"}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
