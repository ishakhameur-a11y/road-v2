"use client";

import { useState } from "react";
import Sheet from "./Sheet";
import { EXPENSE_CATEGORIES, ACCOUNTS, AccountId } from "@/lib/finance";

export default function ExpenseSheet({
  spendPool,
  visaBalance,
  onClose,
  onSave,
}: {
  spendPool: number;
  visaBalance: number;
  onClose: () => void;
  onSave: (amount: number, account: AccountId, category: string, note: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState<AccountId>("cash");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");
  const num = Number(amount) || 0;
  const isVisa = account === "visa";

  return (
    <Sheet title="إضافة مصروف" onClose={onClose}>
      <p className="mb-3 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        {isVisa ? (
          <>
            رصيد الفيزا الحالي:{" "}
            <span className="font-bold" style={{ color: "var(--accent)" }}>
              {visaBalance.toLocaleString()} $
            </span>
          </>
        ) : (
          <>
            المتاح للصرف حاليًا:{" "}
            <span className="font-bold" style={{ color: "var(--accent)" }}>
              {spendPool.toLocaleString()} د.ج
            </span>
          </>
        )}
      </p>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
        dir="ltr"
        className="mb-4 w-full rounded-2xl border-2 px-4 py-3.5 text-2xl font-extrabold outline-none"
        style={{ borderColor: "#c1504c40", backgroundColor: "var(--bg)", color: "#c1504c", textAlign: "right" }}
      />

      <p className="mb-1.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        من حساب
      </p>
      <div className="mb-4 flex gap-2">
        {ACCOUNTS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAccount(a.id)}
            className="flex-1 rounded-xl border py-2.5 text-sm font-semibold"
            style={{
              borderColor: account === a.id ? "var(--accent)" : "var(--border)",
              backgroundColor: account === a.id ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--bg)",
              color: account === a.id ? "var(--accent)" : "var(--text)",
            }}
          >
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      {isVisa && (
        <p className="mb-4 -mt-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
          هذا المصروف بالدولار، وما يأثر على "متاح للصرف" بالدينار.
        </p>
      )}

      <p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        الفئة
      </p>
      <div className="mb-5 grid grid-cols-4 gap-2">
        {EXPENSE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className="flex flex-col items-center gap-1 rounded-xl border py-2.5"
            style={{
              borderColor: category === cat.id ? "var(--accent)" : "var(--border)",
              backgroundColor: category === cat.id ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--bg)",
            }}
          >
            <span className="text-lg">{cat.icon}</span>
            <span className="text-[9px] font-semibold" style={{ color: category === cat.id ? "var(--accent)" : "var(--text-muted)" }}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="ملاحظة (اختياري)"
        className="mb-5 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
      />

      <button
        onClick={() => num > 0 && onSave(num, account, category, note.trim())}
        disabled={num <= 0}
        className="w-full rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-40"
        style={{ backgroundColor: "#c1504c" }}
      >
        إضافة المصروف
      </button>
    </Sheet>
  );
}
