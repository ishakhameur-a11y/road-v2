"use client";

import { useState } from "react";
import Sheet from "./Sheet";
import { Session } from "@/lib/sessions";

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => i * 30);

function mtl(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "ص" : "م"}`;
}

export default function TaskFormSheet({
  title: sheetTitle,
  initialTitle = "",
  initialStart,
  initialEnd,
  onClose,
  onSave,
  saveLabel,
}: {
  title: string;
  initialTitle?: string;
  initialStart: number;
  initialEnd?: number;
  dateLabel: string;
  sessions: Session[];
  onClose: () => void;
  onSave: (title: string, start: number, end: number) => void;
  saveLabel: string;
}) {
  const [name, setName] = useState(initialTitle);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd ?? Math.min(initialStart + 60, 23 * 60 + 30));

  return (
    <Sheet onClose={onClose}>
      <h2 className="mb-5 text-center text-base font-bold">{sheetTitle}</h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ماذا تريد أن تنجز؟"
        className="mb-4 w-full rounded-2xl border px-4 py-3.5 text-[15px] outline-none"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
      />

      <div className="mb-5 grid grid-cols-2 gap-3">
        <select
          value={start}
          onChange={(e) => {
            const v = Number(e.target.value);
            setStart(v);
            if (end <= v) setEnd(Math.min(v + 60, 23 * 60 + 30));
          }}
          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
        >
          {TIME_OPTIONS.map((x) => (
            <option key={x} value={x}>
              {mtl(x)}
            </option>
          ))}
        </select>
        <select
          value={end}
          onChange={(e) => setEnd(Number(e.target.value))}
          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
        >
          {TIME_OPTIONS.filter((x) => x > start).map((x) => (
            <option key={x} value={x}>
              {mtl(x)}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => name.trim() && end > start && onSave(name.trim(), start, end)}
        disabled={!name.trim() || end <= start}
        className="w-full rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-40"
        style={{ backgroundColor: "var(--accent)" }}
      >
        {saveLabel}
      </button>
    </Sheet>
  );
}
