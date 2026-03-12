"use client";

import Link from "next/link";
import { useApp } from "@/providers/AppContext";

export default function Footer() {
    const { language } = useApp();

    return (
        <footer className="bg-teal-900 text-teal-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-2xl font-serif font-bold text-white mb-4">
                            An Tịnh Việt
                        </h2>
                        <p className="max-w-xs text-sm opacity-80">
                            {language === "vi"
                                ? "Du lịch chữa lành & trải nghiệm. Kết nối lại thân, tâm, trí qua di sản Việt Nam."
                                : "Healing & Experience Tourism. Reconnecting Body, Mind, and Spirit through Vietnam's heritage."}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-4">
                            {language === "vi" ? "Truy cập nhanh" : "Quick Links"}
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/tours" className="hover:text-amber-400">
                                    {language === "vi" ? "Tour" : "Tours"}
                                </Link>
                            </li>
                            <li>
                                <Link href="/courses" className="hover:text-amber-400">
                                    {language === "vi" ? "Khóa học thiền" : "Meditation Courses"}
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-amber-400">
                                    {language === "vi" ? "Về chúng tôi" : "About Us"}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-4">
                            {language === "vi" ? "Liên hệ" : "Contact"}
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>{language === "vi" ? "Thạch Thất, Hà Nội, Việt Nam" : "Thach That, Hanoi, Vietnam"}</li>
                            <li>antinhviet.contact@gmail.com</li>
                            <li>+84 969 843 804</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-teal-800 mt-12 pt-8 text-center text-xs opacity-60">
                    {language === "vi"
                        ? "© 2026 An Tịnh Việt. Bảo lưu mọi quyền."
                        : "© 2026 An Tinh Viet. All rights reserved."}
                </div>
            </div>
        </footer>
    );
}