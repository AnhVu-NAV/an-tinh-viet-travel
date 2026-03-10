"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Check, Tag, Info } from "lucide-react";
import { useApp } from "@/providers/AppContext";

type Lang = "vi" | "en";

type TourApi = {
    id: string;
    title: Record<Lang, string>;
    price_vnd: number;
    schedule: { id: string; startDate: string; slots: number; slotsLeft: number }[];
    images: string[];
};

export default function BookingPage() {
    const router = useRouter();
    const params = useParams<{ tourSlug: string }>();
    const tourId = params.tourSlug; // bạn đang dùng slug nhưng API tour của bạn đọc id/slug đều được

    const { language, convertPrice, user } = useApp();

    const [loadingTour, setLoadingTour] = useState(true);
    const [tour, setTour] = useState<TourApi | null>(null);

    const [step, setStep] = useState(1);
    const [selectedSchedule, setSelectedSchedule] = useState<string>("");
    const [guests, setGuests] = useState(1);

    // contact info (schema Booking có contactName/contactEmail/contactPhone)
    const [contactName, setContactName] = useState(user?.name ?? "");
    const [contactEmail, setContactEmail] = useState(user?.email ?? "");
    const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
    const [emailSent, setEmailSent] = useState<boolean | null>(null);

    // discount
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
    const [discountError, setDiscountError] = useState("");
    const [discountLoading, setDiscountLoading] = useState(false);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoadingTour(true);
                const res = await fetch(`/api/tours/${encodeURIComponent(tourId)}`, { cache: "no-store" });
                if (!res.ok) throw new Error("Tour not found");
                const data = await res.json();
                if (!alive) return;

                setTour(data.tour);
            } catch {
                if (alive) setTour(null);
            } finally {
                if (alive) setLoadingTour(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [tourId]);

    useEffect(() => {
        if (!user) return;

        setContactName((prev) => prev || user.name || "");
        setContactEmail((prev) => prev || user.email || "");
        setContactPhone((prev) => prev || user.phone || "");
        console.log("booking payload received");
        console.log("contactEmail:", user.email);
    }, [user]);

    const totalPrice = useMemo(() => {
        const price = Number(tour?.price_vnd ?? 0);
        return price * Number(guests);
    }, [tour?.price_vnd, guests]);

    const discountAmount = useMemo(() => {
        const percent = appliedDiscount ? Number(appliedDiscount.percent) : 0;
        if (!Number.isFinite(totalPrice) || !Number.isFinite(percent)) return 0;
        return Math.round((totalPrice * percent) / 100);
    }, [totalPrice, appliedDiscount]);

    const finalPrice = useMemo(() => Math.max(0, totalPrice - discountAmount), [totalPrice, discountAmount]);

    const handleApplyDiscount = async () => {
        const code = discountCode.trim().toUpperCase();
        if (!code) return;

        setDiscountLoading(true);
        setDiscountError("");

        try {
            const res = await fetch("/api/discounts/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });

            const data = await res.json();
            if (!res.ok || !data?.ok) {
                setAppliedDiscount(null);
                setDiscountError(language === "vi" ? "Mã không hợp lệ / hết hạn" : "Invalid / expired code");
                return;
            }

            setAppliedDiscount({ code: data.discount.code, percent: Number(data.discount.percent) });
            setDiscountError("");
        } catch {
            setAppliedDiscount(null);
            setDiscountError(language === "vi" ? "Lỗi hệ thống" : "Server error");
        } finally {
            setDiscountLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!tour) return;

        if (!selectedSchedule) {
            alert(language === "vi" ? "Vui lòng chọn lịch khởi hành" : "Please select a schedule");
            return;
        }

        const finalContactName = (user?.name || contactName || "").trim();
        const finalContactEmail = (user?.email || contactEmail || "").trim();
        const finalContactPhone = (user?.phone || contactPhone || "").trim();

        if (!finalContactName) {
            alert(language === "vi" ? "Vui lòng nhập họ tên" : "Please enter your name");
            return;
        }

        if (!finalContactEmail) {
            alert(language === "vi" ? "Vui lòng nhập email" : "Please enter email");
            return;
        }

        if (!finalContactPhone) {
            alert(language === "vi" ? "Vui lòng nhập số điện thoại" : "Please enter phone number");
            return;
        }

        const payload = {
            tourId: tour.id,
            scheduleId: selectedSchedule,
            guests,
            currency: "VND",
            discountCode: appliedDiscount?.code ?? null,

            userId: user?.id ?? null,

            contactName: finalContactName,
            contactEmail: finalContactEmail,
            contactPhone: finalContactPhone,
        };

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                alert(data?.message ?? (language === "vi" ? "Đặt tour thất bại" : "Booking failed"));
                return;
            }

            setEmailSent(Boolean(data?.emailSent));
            setStep(3);
        } catch (error) {
            console.error("Booking error:", error);
            alert(language === "vi" ? "Lỗi hệ thống" : "Server error");
        }
    };

    if (loadingTour) return <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-500 text-sm font-medium">
                {language === 'vi' ? 'Đang tải...' : 'Loading...'}
            </p>
        </div>
    </div>;
    if (!tour) return <div className="p-20 text-center">Tour not found</div>;

    return (
        <div className="min-h-screen bg-sand-50 py-12">
            <div className="max-w-2xl mx-auto px-4">

                {/* Progress */}
                <div className="flex justify-between mb-8 px-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                                    step >= s ? "bg-primary text-white shadow-md" : "bg-sand-200 text-stone-400"
                                }`}
                            >
                                {step > s ? <Check className="w-5 h-5" /> : s}
                            </div>
                            <span className="text-xs mt-2 text-stone-500 font-medium">
                {s === 1 ? (language === "vi" ? "Chọn lịch" : "Select")
                    : s === 2 ? (language === "vi" ? "Thanh toán" : "Payment")
                        : (language === "vi" ? "Hoàn tất" : "Done")}
              </span>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8 border border-sand-100">
                    <h2 className="text-2xl font-serif font-bold text-earth-900 mb-2">{tour.title[language]}</h2>
                    <p className="text-stone-500 text-sm mb-6 flex items-center">
                        <Info className="w-4 h-4 mr-1" />
                        {language === "vi" ? "Vui lòng kiểm tra kỹ thông tin trước khi đặt." : "Please review information carefully."}
                    </p>

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <label className="block text-sm font-bold text-earth-900 mb-3">
                                    {language === "vi" ? "Chọn ngày khởi hành" : "Select Departure Date"}
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {tour.schedule.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => setSelectedSchedule(s.id)}
                                            className={`p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${
                                                selectedSchedule === s.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-sand-200 hover:border-primary/50"
                                            }`}
                                        >
                                            <span className="font-semibold text-earth-900">{s.startDate}</span>
                                            <span className="text-xs bg-sand-100 text-stone-600 px-2 py-1 rounded-full">
                        {s.slotsLeft} {language === "vi" ? "chỗ" : "slots"}
                      </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-earth-900 mb-3">{language === "vi" ? "Số khách" : "Number of Guests"}</label>
                                <div className="flex items-center space-x-4">
                                    <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-10 h-10 rounded-full border border-sand-300 hover:bg-sand-100 flex items-center justify-center text-xl font-bold text-earth-900">-</button>
                                    <span className="text-xl font-bold w-8 text-center">{guests}</span>
                                    <button onClick={() => setGuests(Math.min(10, guests + 1))} className="w-10 h-10 rounded-full border border-sand-300 hover:bg-sand-100 flex items-center justify-center text-xl font-bold text-earth-900">+</button>
                                </div>
                            </div>

                            <div className="flex justify-between items-end pt-6 border-t border-sand-100">
                                <div>
                                    <p className="text-xs text-stone-500 uppercase tracking-wide">Total Estimate</p>
                                    <p className="text-2xl font-bold text-primary">{convertPrice(totalPrice)}</p>
                                </div>
                                <Button onClick={() => selectedSchedule && setStep(2)} disabled={!selectedSchedule}>
                                    {language === "vi" ? "Tiếp tục" : "Continue"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            {/* contact fields (theo ảnh UI bạn gửi) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-earth-900 mb-2">{language === "vi" ? "Họ tên" : "Name"}</label>
                                    <input value={contactName} onChange={(e) => setContactName(e.target.value)}
                                           className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-earth-900 mb-2">Email</label>
                                    <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                                           className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-earth-900 mb-2">{language === "vi" ? "SĐT" : "Phone"}</label>
                                    <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                                           className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" />
                                </div>
                            </div>

                            {/* Discount Section */}
                            <div>
                                <label className="block text-sm font-bold text-earth-900 mb-2">{language === "vi" ? "Mã giảm giá" : "Discount Code"}</label>
                                <div className="flex space-x-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                        <input
                                            type="text"
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                            className="w-full pl-9 p-2.5 border border-sand-200 rounded-xl focus:ring-primary focus:border-primary uppercase"
                                            placeholder="ENTER CODE"
                                            disabled={!!appliedDiscount}
                                        />
                                    </div>
                                    <Button variant="secondary" size="sm" onClick={handleApplyDiscount} disabled={!!appliedDiscount || discountLoading}>
                                        {language === "vi" ? "Áp dụng" : "Apply"}
                                    </Button>
                                </div>
                                {discountError && <p className="text-red-500 text-xs mt-1 ml-1">{discountError}</p>}
                                {appliedDiscount && (
                                    <div className="mt-2 text-primary text-sm flex items-center bg-primary/10 p-2 rounded-lg">
                                        <Check className="w-4 h-4 mr-1" />
                                        Code <b>{appliedDiscount.code}</b> applied (-{appliedDiscount.percent}%)
                                        <button
                                            type="button"
                                            onClick={() => { setAppliedDiscount(null); setDiscountCode(""); }}
                                            className="ml-auto text-xs text-stone-500 hover:text-red-500 underline"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-sand-50 p-6 rounded-2xl border border-sand-100">
                                <h4 className="font-bold mb-4 text-earth-900 border-b border-sand-200 pb-2">Payment Summary</h4>

                                <div className="flex justify-between text-sm mb-2 text-stone-600">
                                    <span>Tour Fee ({guests} pax)</span>
                                    <span>{convertPrice(totalPrice)}</span>
                                </div>

                                {appliedDiscount && (
                                    <div className="flex justify-between text-sm mb-2 text-primary">
                                        <span>Discount ({appliedDiscount.percent}%)</span>
                                        <span>- {convertPrice(discountAmount)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t border-sand-200 text-earth-900">
                                    <span>Final Total</span>
                                    <span>{convertPrice(finalPrice)}</span>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                                <Button onClick={handleBooking} className="flex-1 shadow-lg shadow-primary/20">
                                    {language === "vi" ? "Thanh toán (DB)" : "Pay Now (DB)"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <div className="text-center py-10 animate-slide-up">
                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-earth-900 mb-2">Booking Confirmed!</h3>
                            <p className="text-stone-500 mb-8 max-w-xs mx-auto">
                                {language === "vi" ? "Cảm ơn bạn đã lựa chọn An Tịnh Việt." : "Thank you for choosing An Tinh Viet."}
                            </p>

                            {emailSent === true && (
                                <p className="text-green-600 text-sm mb-4">
                                    {language === "vi"
                                        ? "Email xác nhận đã được gửi thành công."
                                        : "Confirmation email was sent successfully."}
                                </p>
                            )}

                            {emailSent === false && (
                                <p className="text-amber-600 text-sm mb-4">
                                    {language === "vi"
                                        ? "Đặt chỗ thành công nhưng gửi email xác nhận chưa thành công."
                                        : "Booking was created, but confirmation email was not sent successfully."}
                                </p>
                            )}

                            <Button onClick={() => router.push("/")} size="lg">Return Home</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}