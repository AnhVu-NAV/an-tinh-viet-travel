"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp } from "@/providers/AppContext";
import { Button } from "@/components/Button";
import { Clock, Users, ArrowLeft, CheckCircle, ExternalLink } from "lucide-react";

type Lang = "vi" | "en";

type CourseDTO = {
    id: string;
    title: Record<Lang, string>;
    description: Record<Lang, string>;
    price_vnd: number;
    duration: string;
    group_link: string;
    image: string;
};

export default function CourseDetailPage() {
    const params = useParams() as any;
    const id = params?.id ?? params?.slug;

    const { language, convertPrice } = useApp();
    const [course, setCourse] = useState<CourseDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/courses/${encodeURIComponent(id)}`, { cache: "no-store" });
                if (!res.ok) {
                    if (!alive) return;
                    setCourse(null);
                    return;
                }
                const data = (await res.json()) as { course: CourseDTO };
                if (!alive) return;
                setCourse(data.course ?? null);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [id]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-sand-50 text-stone-400">Loading...</div>;
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sand-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-earth-900 mb-4">{language === "vi" ? "Không tìm thấy khóa học" : "Course not found"}</h2>
                    <Link href="/courses">
                        <Button>{language === "vi" ? "Quay lại danh sách" : "Back to Courses"}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sand-50 pb-20">
            {/* Hero */}
            <div className="relative h-[40vh] md:h-[50vh]">
                <img src={course.image} alt={course.title[language as Lang]} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40"></div>

                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-white text-center px-4 shadow-sm">
                        {course.title[language as Lang]}
                    </h1>
                </div>

                <div className="absolute top-6 left-6">
                    <Link
                        href="/courses"
                        className="text-white hover:text-primary-light transition-colors flex items-center bg-black/20 p-2 rounded-full backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-sand-100">
                    {/* Info Cards */}
                    <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-sand-100">
                        <div className="flex items-center bg-sand-50 px-4 py-2 rounded-xl text-stone-600">
                            <Clock className="w-5 h-5 mr-2 text-primary" />
                            <span className="font-medium">{course.duration}</span>
                        </div>
                        <div className="flex items-center bg-sand-50 px-4 py-2 rounded-xl text-stone-600">
                            <Users className="w-5 h-5 mr-2 text-primary" />
                            <span className="font-medium">Online / Offline Support</span>
                        </div>
                        <div className="ml-auto text-2xl font-bold text-primary">{convertPrice(course.price_vnd)}</div>
                    </div>

                    {/* Content */}
                    <div className="prose prose-stone max-w-none mb-10">
                        <h2 className="text-2xl font-serif font-bold text-earth-900 mb-4">{language === "vi" ? "Giới thiệu" : "Overview"}</h2>
                        <p className="text-lg text-stone-600 leading-relaxed mb-6">{course.description[language as Lang]}</p>

                        <h3 className="text-xl font-bold text-earth-900 mb-4">{language === "vi" ? "Bạn sẽ nhận được gì?" : "What you will gain"}</h3>
                        <ul className="space-y-3">
                            {[
                                language === "vi" ? "Kiến thức nền tảng về thiền định và chánh niệm." : "Foundational knowledge of meditation and mindfulness.",
                                language === "vi" ? "Phương pháp kiểm soát cảm xúc tiêu cực." : "Methods to control negative emotions.",
                                language === "vi" ? "Kết nối với cộng đồng những người cùng tần số." : "Connect with a community of like-minded people.",
                            ].map((item, i) => (
                                <li key={i} className="flex items-start text-stone-600">
                                    <CheckCircle className="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA */}
                    <div className="bg-teal-900 text-teal-50 p-8 rounded-2xl text-center">
                        <h3 className="text-xl font-bold mb-2">{language === "vi" ? "Sẵn sàng bắt đầu hành trình?" : "Ready to start your journey?"}</h3>
                        <p className="text-teal-200 mb-6 text-sm">{language === "vi" ? "Tham gia nhóm hỗ trợ để được tư vấn trực tiếp." : "Join our support group for direct consultation."}</p>
                        <a href={course.group_link} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-white text-teal-900 hover:bg-teal-50 border-none">
                                {language === "vi" ? "Tham gia Nhóm Ngay" : "Join Group Now"} <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}