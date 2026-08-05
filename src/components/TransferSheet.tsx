"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Sheet from "./Sheet";
import { ACCOUNTS, AccountId } from "@/lib/finance";

export default function TransferSheet({
  investPool,
  onClose,
  onSave,
}: {
  investPool: number;
  onClose: () => void;
  onSave: (from: AccountId, to: AccountId, fromAmount: number, toAmount: number, isInvestment: boolean, note: string) => void;
}) {
  const [from, setFrom] = useState<AccountId>("cash");
  const [to, setTo] = useState<AccountId>("bank");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isInvestment, setIsInvestment] = useState(true);
  const [note, setNote] = useState("");

  const fromAcc = ACCOUNTS.find((a) => a.id === from)!;
  const toAcc = ACCOUNTS.find((a) => a.id === to)!;
  const sameCurrency = fromAcc.currency === toAcc.currency;
  const fNum = Number(fromAmount) || 0;
  const tNum = sameCurrency ? fNum : Number(toAmount) || 0;

  function pickFrom(id: AccountId) {
    setFrom(id);
    if (id === to) setTo(ACCOUNTS.find((a) => a.id !== id)!.id);
  }
  function pickTo(id: AccountId) {
    setTo(id);
    if (id === from) setFrom(ACCOUNTS.find((a) => a.id !== id)!.id);
  }

  return (
    <Sheet title="تحويل بين الحسابات" onClose={onClose}>
      <p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        من حساب
      </p>
      <div className="mb-4 flex gap-2">
        {ACCOUNTS.map((a) => (
          <button
            key={a.id}
            onClick={() => pickFrom(a.id)}
            className="flex-1 rounded-xl border py-2.5 text-xs font-semibold"
            style={{
              borderColor: from === a.id ? "var(--accent)" : "var(--border)",
              backgroundColor: from === a.id ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--bg)",
              color: from === a.id ? "var(--accent)" : "var(--text)",
              opacity: to === a.id ? 0.3 : 1,
            }}
            disabled={to === a.id}
          >
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      <p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        إلى حساب
      </p>
      <div className="mb-4 flex gap-2">
        {ACCOUNTS.map((a) => (
          <button
            key={a.id}
            onClick={() => pickTo(a.id)}
            className="flex-1 rounded-xl border py-2.5 text-xs font-semibold"
            style={{
              borderColor: to === a.id ? "var(--accent)" : "var(--border)",
              backgroundColor: to === a.id ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--bg)",
              color: to === a.id ? "var(--accent)" : "var(--text)",
              opacity: from === a.id ? 0.3 : 1,
            }}
            disabled={from === a.id}
          >
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      <div className={sameCurrency ? "" : "grid grid-cols-2 gap-3"}>
        <div>
          <p className="mb-1.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            المبلغ الخارج ({fromAcc.currency === "DZD" ? "د.ج" : "$"})
          </p>
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            placeholder="0"
            dir="ltr"
            className="w-full rounded-xl border px-3 py-2.5 text-lg font-bold outline-none"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
          />
        </div>
        {!sameCurrency && (
          <div>
            <p className="mb-1.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              المبلغ الداخل ({toAcc.currency === "DZD" ? "د.ج" : "$"})
            </p>
            <input
              type="number"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              placeholder="0"
              dir="ltr"
              className="w-full rounded-xl border px-3 py-2.5 text-lg font-bold outline-none"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
            />
          </div>
        )}
      </div>

      <button
        onClick={() => setIsInvestment((v) => !v)}
        className="my-4 flex w-full items-center gap-3 rounded-xl border px-4 py-3"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
      >
        <span
          className="flex h-5 w-5 items-center justify-center rounded-md border-2"
          style={{
            borderColor: isInvestment ? "#6b5fb5" : "var(--border)",
            backgroundColor: isInvestment ? "#6b5fb5" : "transparent",
          }}
        >
          {isInvestment && <Check size={13} color="#fff" strokeWidth={3} />}
        </span>
        <span className="text-sm font-semibold">هذا التحويل من نصيب الاستثمار</span>
      </button>

      {isInvestment && (
        <p className="mb-4 text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
          رصيد الاستثمار الحالي {investPool.toLocaleString()} د.ج، بينقص {fNum.toLocaleString()} منه
        </p>
      )}

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="ملاحظة (اختياري)"
        className="mb-5 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
      />

      <button
        onClick={() => fNum > 0 && tNum > 0 && onSave(from, to, fNum, tNum, isInvestment, note.trim())}
        disabled={fNum <= 0 || tNum <= 0}
        className="w-full rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-40"
        style={{ backgroundColor: "var(--accent)" }}
      >
        تنفيذ التحويل
      </button>
    </Sheet>
  );
}
