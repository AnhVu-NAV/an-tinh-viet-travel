"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Eye } from "lucide-react";
import { useApp } from "@/providers/AppContext";

type Lang = "vi" | "en";

type LocationDTO = {
    id: string;
    name: Record<Lang, string>;
    type: string;
    region: string;
    tags: string[];
    images: string;
};

export default function LocationsPage() {
    const { language } = useApp();

    const [locations, setLocations] = useState<LocationDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch("/api/locations", { cache: "no-store" });
                if (!res.ok) throw new Error(`API /api/locations failed: ${res.status}`);

                const data = await res.json();
                if (!alive) return;
                console.log(data);


                setLocations(Array.isArray(data) ? data : data.locations ?? []);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message ?? "Failed to load locations");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-stone-400">
                {language === "vi" ? "Đang tải..." : "Loading..."}
            </div>
        );
    }

    if (!loading && error) {
        return (
            <div className="min-h-screen p-20 text-center">
                <p className="text-red-500">{error}</p>
                <Link href="/" className="inline-block mt-6 underline text-teal-700">
                    Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 animate-slide-up">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-900 mb-4">
                        {language === "vi" ? "Điểm Đến Tâm Linh" : "Spiritual Destinations"}
                    </h1>
                    <p className="text-lg text-stone-500 max-w-2xl mx-auto">
                        {language === "vi"
                            ? "Khám phá những vùng đất thiêng liêng, nơi năng lượng đất trời giao hòa."
                            : "Discover sacred lands where earth and sky energies harmonize."}
                    </p>
                    <div className="w-24 h-1 bg-primary-light mx-auto mt-6 rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {locations.map((loc, index) => (
                        <div
                            key={loc.id}
                            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full animate-slide-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <Link href={`/locations/${loc.id}`} className="relative h-64 overflow-hidden block cursor-pointer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={loc.images}
                                    alt={loc.name[language]}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                <div className="absolute bottom-4 left-4">
                                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-earth-900 inline-flex items-center">
                                        <MapPin className="w-3 h-3 mr-1 text-primary" />
                                        {loc.region}
                                    </div>
                                </div>
                            </Link>

                            <div className="p-8 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <span className="text-xs font-medium text-primary uppercase tracking-wider">{loc.type}</span>

                                    <Link href={`/locations/${loc.id}`}>
                                        <h3 className="text-2xl font-serif font-bold text-earth-900 mt-2 mb-2 hover:text-primary transition-colors">
                                            {loc.name[language]}
                                        </h3>
                                    </Link>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {(loc.tags ?? []).map((tag) => (
                                            <span key={tag} className="text-xs text-stone-500 bg-sand-100 px-2 py-1 rounded-md">
                        {tag}
                      </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-sand-100 flex justify-between items-center">
                                    <Link
                                        href={`/locations/${loc.id}`}
                                        className="text-stone-500 hover:text-primary text-sm font-medium flex items-center transition-colors"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        {language === "vi" ? "Xem thông tin" : "View Info"}
                                    </Link>

                                    <Link
                                        href={`/tours?search=${encodeURIComponent(loc.name[language])}`}
                                        className="text-primary hover:text-primary-dark font-medium flex items-center transition-colors text-sm"
                                    >
                                        {language === "vi" ? "Các tour đi qua" : "Related Tours"}
                                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {locations.length === 0 && <div className="text-center text-stone-400 italic py-16">No locations.</div>}
            </div>
        </div>
    );
}