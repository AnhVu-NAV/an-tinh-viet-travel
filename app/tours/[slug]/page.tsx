'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useApp } from '@/providers/AppContext';
import { Calendar, Users, MapPin, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/Button';

type Lang = 'vi' | 'en';

type Tour = {
    id: string;
    slug?: string;
    title: Record<Lang, string>;
    description: Record<Lang, string>;
    introduction: Record<Lang, string>;
    meaning: Record<Lang, string>;
    suitable_for: Record<Lang, string>;
    duration_days: number;
    level: 'light' | 'moderate' | 'deep';
    price_vnd: number;
    images: string[];
    locations: string[];
};

type Location = {
    id: string;
    region: string;
    type: string;
    name: Record<Lang, string>;
};

export default function TourDetailPage() {
    const params = useParams() as any;
    const id = params?.id ?? params?.slug ?? params?.tourId;

    const { language, convertPrice } = useApp();

    const [tour, setTour] = useState<Tour | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!id) return;

        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setError('');

                const res = await fetch(`/api/tours/${encodeURIComponent(id)}`, { cache: 'no-store' });
                if (!res.ok) throw new Error(`API /api/tours/${id} failed: ${res.status}`);

                const data = (await res.json()) as { tour: Tour; locations: Location[] };

                setTour(data.tour ?? null);
                setLocations(data.locations ?? []);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message ?? 'Failed to load tour detail');
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [id]);

    const mappedLocations = useMemo(() => {
        if (!tour) return [];
        return (tour.locations ?? [])
            .map((locId) => locations.find((l) => l.id === locId))
            .filter(Boolean) as Location[];
    }, [tour, locations]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center text-stone-400">
                {language === 'vi' ? 'Đang tải...' : 'Loading...'}
            </div>
        );
    }

    if (!loading && (error || !tour)) {
        return (
            <div className="min-h-screen bg-white p-20 text-center">
                <p className="text-stone-700 font-semibold">
                    {language === 'vi' ? 'Không tìm thấy tour' : 'Tour not found'}
                </p>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <Link href="/tours" className="inline-block mt-6 text-teal-700 underline">
                    {language === 'vi' ? 'Quay lại danh sách' : 'Back to list'}
                </Link>
            </div>
        );
    }
    if (!tour) {
        return (
            <div className="max-w-7xl mx-auto p-8">
                <p className="text-stone-500">Tour not found.</p>
            </div>
        );
    }
    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Hero Image */}
            <div className="h-[50vh] relative">
                <Image
                    src={tour.images?.[0] ?? '/placeholder.jpg'}
                    alt="Hero"
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 max-w-7xl mx-auto">
          <span className="bg-amber-400 text-teal-900 px-3 py-1 text-xs font-bold uppercase rounded mb-4 inline-block">
            {tour.level} Journey
          </span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
                        {tour.title?.[language as Lang]}
                    </h1>
                    <p className="text-teal-100 text-lg max-w-2xl">{tour.description?.[language as Lang]}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1 bg-white rounded-t-3xl p-8 shadow-sm">
                        {/* Info Bar */}
                        <div className="flex flex-wrap gap-6 border-b border-stone-100 pb-8 mb-8">
                            <div className="flex items-center text-stone-600">
                                <div className="p-2 bg-stone-100 rounded-full mr-3">
                                    <Calendar className="w-5 h-5 text-teal-800" />
                                </div>
                                <div>
                                    <p className="text-xs text-stone-400 uppercase">Duration</p>
                                    <p className="font-semibold">
                                        {tour.duration_days} {language === 'vi' ? 'Ngày' : 'Days'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center text-stone-600">
                                <div className="p-2 bg-stone-100 rounded-full mr-3">
                                    <Users className="w-5 h-5 text-teal-800" />
                                </div>
                                <div>
                                    <p className="text-xs text-stone-400 uppercase">Suitable For</p>
                                    <p className="font-semibold">{tour.suitable_for?.[language as Lang]}</p>
                                </div>
                            </div>
                        </div>

                        {/* Introduction & Meaning */}
                        <div className="mb-12 space-y-8 animate-fade-in">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-teal-900 mb-4">
                                    {language === 'vi' ? 'Giới thiệu' : 'Introduction'}
                                </h2>
                                <p className="text-stone-600 leading-relaxed text-lg">
                                    {tour.introduction?.[language as Lang]}
                                </p>
                            </div>

                            <div className="bg-sand-50 p-6 rounded-2xl border-l-4 border-amber-400">
                                <h3 className="text-lg font-bold text-teal-800 mb-2 flex items-center">
                                    <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
                                    {language === 'vi' ? 'Ý nghĩa hành trình' : 'Journey Meaning'}
                                </h3>
                                <p className="text-stone-700 italic font-medium text-lg">
                                    “{tour.meaning?.[language as Lang]}”
                                </p>
                            </div>
                        </div>

                        {/* Itinerary */}
                        <h2 className="text-2xl font-serif font-bold text-teal-900 mb-6">
                            {language === 'vi' ? 'Lịch Trình & Điểm Đến' : 'Itinerary & Locations'}
                        </h2>

                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-300 before:to-transparent">
                            {mappedLocations.map((loc) => (
                                <div
                                    key={loc.id}
                                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                                >
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-stone-100 group-[.is-active]:bg-teal-800 text-stone-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                        <MapPin className="w-4 h-4" />
                                    </div>

                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-stone-50 p-4 rounded-xl border border-stone-100 shadow-sm">
                                        <div className="flex items-center justify-between space-x-2 mb-1">
                                            <h3 className="font-bold text-stone-800">{loc.name?.[language as Lang]}</h3>
                                        </div>
                                        <div className="text-stone-500 text-sm">
                                            {loc.region} - <span className="text-teal-600 italic">{loc.type}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Gallery */}
                        <h2 className="text-2xl font-serif font-bold text-teal-900 mt-12 mb-6">Gallery</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative w-full h-48">
                                <Image
                                    src={tour.images?.[0] ?? '/placeholder.jpg'}
                                    alt="Gallery 1"
                                    fill
                                    sizes="50vw"
                                    className="rounded-lg object-cover"
                                />
                            </div>

                            {tour.images?.[1] ? (
                                <div className="relative w-full h-48">
                                    <Image
                                        src={tour.images[1]}
                                        alt="Gallery 2"
                                        fill
                                        sizes="50vw"
                                        className="rounded-lg object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="bg-stone-100 rounded-lg flex items-center justify-center text-stone-400">
                                    More coming soon
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Booking */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white p-6 rounded-2xl shadow-xl sticky top-24 border border-stone-100">
                            <div className="mb-6">
                                <p className="text-stone-500 text-sm">
                                    {language === 'vi' ? 'Giá từ' : 'Price starts from'}
                                </p>
                                <p className="text-3xl font-bold text-teal-800">{convertPrice(tour.price_vnd)}</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                                    <span className="text-sm text-stone-600">
                    {language === 'vi' ? 'Hướng dẫn viên chuyên nghiệp' : 'Professional Zen Guide'}
                  </span>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                                    <span className="text-sm text-stone-600">
                    {language === 'vi' ? 'Bao gồm vé tham quan' : 'Entrance fees included'}
                  </span>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                                    <span className="text-sm text-stone-600">
                    {language === 'vi' ? 'Bữa ăn chay thanh tịnh' : 'Vegetarian meals'}
                  </span>
                                </div>
                            </div>

                            <Link href={`/booking/${tour.slug ?? tour.id}`} className="block w-full">
                                <Button size="lg" className="w-full">
                                    {language === 'vi' ? 'Đặt Tour Ngay' : 'Book Now'}
                                </Button>
                            </Link>

                            <p className="text-xs text-center text-stone-400 mt-4">
                                {language === 'vi' ? 'Hoàn hủy miễn phí trước 7 ngày' : 'Free cancellation 7 days prior'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}