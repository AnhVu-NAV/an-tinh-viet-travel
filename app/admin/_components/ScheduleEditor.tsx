"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Plus, Trash2 } from "lucide-react";

type Row = {
    id?: string;         // có khi EDIT trả từ DB
    startDate: string;   // "YYYY-MM-DD"
    slots: number;
    slotsLeft?: number;
};

export default function ScheduleEditor({
                                           mode,
                                           tourId,
                                           schedules,
                                           onChange,
                                       }: {
    mode: "ADD" | "EDIT";
    tourId?: string;
    schedules: Row[];
    onChange: (next: Row[]) => void;
}) {
    const isEditOnline = mode === "EDIT" && !!tourId;

    const [startDate, setStartDate] = useState("");
    const [slots, setSlots] = useState<number>(20);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    const sorted = useMemo(() => {
        return [...(schedules ?? [])].sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));
    }, [schedules]);

    const addLocal = () => {
        setErr("");
        if (!startDate) return setErr("Missing start date");
        if (!slots || slots < 1) return setErr("Slots must be >= 1");

        // chống duplicate ngày
        if (sorted.some((x) => x.startDate === startDate)) {
            return setErr("This start date already exists");
        }

        onChange([...sorted, { startDate, slots, slotsLeft: slots }]);
        setStartDate("");
        setSlots(20);
    };

    const removeLocal = (idx: number) => {
        const next = sorted.filter((_, i) => i !== idx);
        onChange(next);
    };

    // EDIT mode: add/remove gọi API (optional)
    const addOnline = async () => {
        setErr("");
        if (!tourId) return;
        if (!startDate) return setErr("Missing start date");
        if (!slots || slots < 1) return setErr("Slots must be >= 1");

        try {
            setSaving(true);
            const res = await fetch(`/api/admin/tours/${encodeURIComponent(tourId)}/schedules`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ startDate, slots }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message ?? "Create schedule failed");

            // API trả schedule created -> push vào state
            onChange([...(sorted ?? []), data]);
            setStartDate("");
            setSlots(20);
        } catch (e: any) {
            setErr(e?.message ?? "Create schedule failed");
        } finally {
            setSaving(false);
        }
    };

    const removeOnline = async (row: Row) => {
        setErr("");
        if (!tourId || !row.id) return;

        try {
            setSaving(true);
            const res = await fetch(
                `/api/admin/tours/${encodeURIComponent(tourId)}/schedules/${encodeURIComponent(row.id)}`,
                { method: "DELETE" }
            );
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message ?? "Delete schedule failed");

            onChange(sorted.filter((x) => x.id !== row.id));
        } catch (e: any) {
            setErr(e?.message ?? "Delete schedule failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">
                        Start date
                    </label>
                    <input
                        type="date"
                        className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">
                        Slots
                    </label>
                    <input
                        type="number"
                        min={1}
                        className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50"
                        value={slots}
                        onChange={(e) => setSlots(parseInt(e.target.value || "0", 10))}
                    />
                </div>

                <div className="flex items-end">
                    <Button
                        type="button"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={isEditOnline ? addOnline : addLocal}
                        disabled={saving}
                    >
                        <Plus className="w-4 h-4" /> Add schedule
                    </Button>
                </div>
            </div>

            {err && <div className="text-sm text-red-500">{err}</div>}

            <div className="border border-sand-200 rounded-xl overflow-hidden">
                <div className="bg-sand-50 px-4 py-2 text-xs font-bold text-stone-500 uppercase tracking-wide">
                    Current schedules
                </div>

                {sorted.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-stone-500 italic">
                        No schedules yet. Add at least 1 start date.
                    </div>
                ) : (
                    <div className="divide-y divide-sand-100">
                        {sorted.map((row, idx) => (
                            <div key={row.id ?? `${row.startDate}-${idx}`} className="px-4 py-3 flex items-center justify-between">
                                <div className="text-sm">
                                    <div className="font-bold text-earth-900">{row.startDate}</div>
                                    <div className="text-xs text-stone-500">
                                        slots: {row.slots}
                                        {typeof row.slotsLeft === "number" ? ` • left: ${row.slotsLeft}` : ""}
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:bg-red-50"
                                    onClick={() => (isEditOnline ? removeOnline(row) : removeLocal(idx))}
                                    disabled={saving}
                                    title="Remove"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {mode === "ADD" && (
                <div className="text-xs text-stone-400">
                    * ADD mode: schedules are local only. They will be saved when you click “Save Changes”.
                </div>
            )}
        </div>
    );
}