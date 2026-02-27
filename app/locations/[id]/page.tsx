"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp } from "@/providers/AppContext";
import { Button } from "@/components/Button";
import { MapPin, ArrowLeft, Tag } from "lucide-react";

type Lang = "vi" | "en";

type LocationDTO = {
    id: string;
    name: Record<Lang, string>;
    type: string;
    region: string;
    tags: string[];
    image: string;
    description: Record<Lang, string> | null;
    introduction: Record<Lang, string> | null;
    history: Record<Lang, string> | null;
    significance: Record<Lang, string> | null;
};

type TourMiniDTO = {
    id: string;
    slug: string | null;
    title: Record<Lang, string>;
    price_vnd: number;
    duration_days: number;
    images: string[];
};

export default function LocationDetailPage() {
    const params = useParams() as any;
    const id = params?.id ?? params?.slug;

    const { language, convertPrice } = useApp();

    const [location, setLocation] = useState<LocationDTO | null>(null);
    const [relatedTours, setRelatedTours] = useState<TourMiniDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`/api/locations/${encodeURIComponent(id)}`, { cache: "no-store" });
                if (!res.ok) throw new Error(`API /api/locations/${id} failed: ${res.status}`);

                const data = await res.json();
                if (!alive) return;

                setLocation(data.location ?? null);
                setRelatedTours(data.relatedTours ?? []);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message ?? "Failed to load location detail");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-stone-400">
                {language === "vi" ? "Đang tải..." : "Loading..."}
            </div>
        );
    }

    if (!loading && (error || !location)) {
        return (
            <div className="min-h-screen bg-white p-20 text-center">
                <p className="text-stone-700 font-semibold">{language === "vi" ? "Không tìm thấy địa điểm" : "Location not found"}</p>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <Link href="/locations" className="inline-block mt-6 text-teal-700 underline">
                    {language === "vi" ? "Quay lại danh sách" : "Back to list"}
                </Link>
            </div>
        );
    }
    if (!location) {
        return (
            <div className="max-w-7xl mx-auto p-8">
                <p className="text-stone-500">Location not found.</p>
            </div>
        );
    }
    return (

        <div className="min-h-screen bg-sand-50 pb-20">
            {/* Hero */}
            <div className="relative h-[60vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={location.image ?? "/placeholder.jpg"} alt={location.name[language]} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 max-w-7xl mx-auto">
                    <div className="mb-4">
                        <Link href="/locations" className="text-white/80 hover:text-white text-sm flex items-center mb-4 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" /> {language === "vi" ? "Tất cả địa điểm" : "All Locations"}
                        </Link>

                        <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {location.type}
            </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">{location.name[language]}</h1>

                    <div className="flex items-center text-white/90 text-lg">
                        <MapPin className="w-5 h-5 mr-2" /> {location.region}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-serif font-bold text-earth-900 mb-6">
                            {language === "vi" ? "Về địa điểm này" : "About this place"}
                        </h2>

                        <p className="text-lg text-stone-600 leading-relaxed mb-8">
                            {location.description ? location.description[language] : language === "vi" ? "Mô tả đang được cập nhật." : "Description coming soon."}
                        </p>

                        <div className="flex flex-wrap gap-3 mb-12">
                            {(location.tags ?? []).map((tag) => (
                                <span key={tag} className="flex items-center bg-white px-3 py-1.5 rounded-lg text-stone-500 border border-sand-200 text-sm">
                  <Tag className="w-3 h-3 mr-2 text-primary" /> {tag}
                </span>
                            ))}
                        </div>

                        {location.introduction && (
                            <div className="mb-8">
                                <h3 className="text-xl font-serif font-bold text-earth-900 mb-3">
                                    {language === "vi" ? "Giới thiệu chung" : "Introduction"}
                                </h3>
                                <p className="text-stone-600 leading-relaxed">{location.introduction[language]}</p>
                            </div>
                        )}

                        {location.history && (
                            <div className="mb-8">
                                <h3 className="text-xl font-serif font-bold text-earth-900 mb-3">
                                    {language === "vi" ? "Lịch sử hình thành" : "History"}
                                </h3>
                                <p className="text-stone-600 leading-relaxed">{location.history[language]}</p>
                            </div>
                        )}

                        {location.significance && (
                            <div className="mb-12 bg-sand-50 p-6 rounded-2xl border-l-4 border-amber-400">
                                <h3 className="text-lg font-bold text-earth-900 mb-2">
                                    {language === "vi" ? "Ý nghĩa văn hóa & Tâm linh" : "Cultural & Spiritual Significance"}
                                </h3>
                                <p className="text-stone-700 italic">{location.significance[language]}</p>
                            </div>
                        )}

                        <div className="border-t border-sand-200 pt-12">
                            <h2 className="text-2xl font-serif font-bold text-earth-900 mb-8">
                                {language === "vi" ? "Hành trình đi qua đây" : "Journeys passing through here"}
                            </h2>

                            {relatedTours.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {relatedTours.map((tour) => (
                                        <Link
                                            href={`/tours/${tour.slug ?? tour.id}`}
                                            key={tour.id}
                                            className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all border border-sand-100 flex gap-4"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={tour.images?.[0] ?? "/placeholder.jpg"} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0" />
                                            <div className="flex flex-col justify-between py-1">
                                                <div>
                                                    <h3 className="font-bold text-earth-900 group-hover:text-primary line-clamp-2">{tour.title[language]}</h3>
                                                    <p className="text-xs text-stone-500 mt-1">
                                                        {tour.duration_days} {language === "vi" ? "Ngày" : "Days"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center text-sm font-bold text-primary mt-2">{convertPrice(tour.price_vnd)}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-stone-500 italic">
                                    {language === "vi" ? "Hiện chưa có tour nào đi qua địa điểm này." : "No tours currently listed for this location."}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-sand-100 sticky top-24">
                            <h3 className="font-bold text-earth-900 mb-4">{language === "vi" ? "Thư viện ảnh" : "Gallery"}</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={location.image ?? "/placeholder.jpg"} className="w-full h-32 object-cover rounded-xl col-span-2" alt="" />
                                <div className="w-full h-24 bg-sand-100 rounded-xl flex items-center justify-center text-stone-300">Image 2</div>
                                <div className="w-full h-24 bg-sand-100 rounded-xl flex items-center justify-center text-stone-300">Image 3</div>
                            </div>

                            <div className="pt-6">
                                <Link href="/locations" className="block">
                                    <Button variant="outline" className="w-full">
                                        {language === "vi" ? "Quay lại" : "Back"}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}