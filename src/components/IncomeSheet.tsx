"use client";

import { useState } from "react";
import Sheet from "./Sheet";

export default function IncomeSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (amount: number, note: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const num = Number(amount) || 0;

  return (
    <Sheet title="إضافة دخل" onClose={onClose}>
      <p className="mb-1.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        المبلغ (دينار) — يدخل الكاش تلقائيًا
      </p>
      <input
        autoFocus
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
        dir="ltr"
        className="mb-4 w-full rounded-2xl border-2 px-4 py-3.5 text-2xl font-extrabold outline-none"
        style={{ borderColor: "#1f9d6b40", backgroundColor: "var(--bg)", color: "#1f9d6b", textAlign: "right" }}
      />

      {num > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)" }}>
            <div className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
              متاح للصرف (+50%)
            </div>
            <div className="mt-1 text-base font-bold" style={{ color: "var(--accent)", direction: "ltr" }}>
              +{(num / 2).toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "#6b5fb515" }}>
            <div className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
              مخصص للاستثمار (+50%)
            </div>
            <div className="mt-1 text-base font-bold" style={{ color: "#6b5fb5", direction: "ltr" }}>
              +{(num / 2).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <p className="mb-1.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        ملاحظة (اختياري)
      </p>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="مثلاً: دخل الدوام الجزئي"
        className="mb-5 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
      />

      <button
        onClick={() => num > 0 && onSave(num, note.trim())}
        disabled={num <= 0}
        className="w-full rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-40"
        style={{ backgroundColor: "#1f9d6b" }}
      >
        إضافة الدخل
      </button>
    </Sheet>
  );
}
