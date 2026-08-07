"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Trash2, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  FinanceTx,
  AccountId,
  ACCOUNTS,
  EXPENSE_CATEGORIES,
  computeState,
  seedFinanceTxs,
} from "@/lib/finance";
import IncomeSheet from "@/components/IncomeSheet";
import ExpenseSheet from "@/components/ExpenseSheet";
import TransferSheet from "@/components/TransferSheet";

function fmt(n: number): string {
  return Math.round(n).toLocaleString();
}

export default function FinancePage() {
  const [txs, setTxs] = useLocalStorage<FinanceTx[]>("road_finance_txs", seedFinanceTxs());
  const [sheet, setSheet] = useState<"income" | "expense" | "transfer" | null>(null);

  const state = useMemo(() => computeState(txs), [txs]);

  function addTx(tx: FinanceTx) {
    setTxs((prev) => [...prev, tx]);
    setSheet(null);
  }
  function deleteTx(id: string) {
    setTxs((prev) => prev.filter((t) => t.id !== id));
  }

  const sorted = [...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="px-5 pt-6 pb-8">
      <h1 className="mb-4 text-xl font-bold">المصروف</h1>

      {/* Accounts */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {ACCOUNTS.map((acc) => (
          <div
            key={acc.id}
            className="rounded-2xl border px-3 py-3.5 text-center"
            style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
          >
            <div className="mb-1 text-lg">{acc.icon}</div>
            <div className="text-[15px] font-extrabold" style={{ direction: "ltr" }}>
              {fmt(state[acc.id])}
              <span className="mr-1 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                {acc.currency === "DZD" ? "د.ج" : "$"}
              </span>
            </div>
            <div className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
              {acc.label}
            </div>
          </div>
        ))}
      </div>

      {/* Pools */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl border p-4"
          style={{ backgroundColor: "color-mix(in srgb, var(--accent) 10%, var(--bg-elevated))", borderColor: "var(--border)" }}
        >
          <p className="mb-1 text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
            💰 متاح للصرف
          </p>
          <p className="text-lg font-extrabold" style={{ color: "var(--accent)", direction: "ltr" }}>
            {fmt(state.spendPool)} د.ج
          </p>
        </div>
        <div className="rounded-2xl border p-4" style={{ backgroundColor: "#6b5fb515", borderColor: "var(--border)" }}>
          <p className="mb-1 text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
            📈 مخصص للاستثمار
          </p>
          <p className="text-lg font-extrabold" style={{ color: "#6b5fb5", direction: "ltr" }}>
            {fmt(state.investPool)} د.ج
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        <button
          onClick={() => setSheet("income")}
          className="flex flex-col items-center gap-1.5 rounded-2xl border py-3"
          style={{ borderColor: "#1f9d6b40", backgroundColor: "#1f9d6b15" }}
        >
          <ArrowDownLeft size={18} color="#1f9d6b" />
          <span className="text-xs font-bold" style={{ color: "#1f9d6b" }}>
            دخل
          </span>
        </button>
        <button
          onClick={() => setSheet("expense")}
          className="flex flex-col items-center gap-1.5 rounded-2xl border py-3"
          style={{ borderColor: "#c1504c40", backgroundColor: "#c1504c15" }}
        >
          <ArrowUpRight size={18} color="#c1504c" />
          <span className="text-xs font-bold" style={{ color: "#c1504c" }}>
            مصروف
          </span>
        </button>
        <button
          onClick={() => setSheet("transfer")}
          className="flex flex-col items-center gap-1.5 rounded-2xl border py-3"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
        >
          <ArrowLeftRight size={18} color="var(--accent)" />
          <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>
            تحويل
          </span>
        </button>
      </div>

      {/* Transactions */}
      <p className="mb-2.5 text-sm font-bold">المعاملات</p>
      {sorted.length === 0 ? (
        <div
          className="rounded-2xl border px-5 py-10 text-center"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            لا توجد معاملات بعد
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((tx) => {
            let icon = "💰";
            let title = "";
            let sub = tx.date;
            let amountLabel = "";
            let color = "var(--text)";

            if (tx.type === "income") {
              icon = "💰";
              title = tx.note || "دخل";
              amountLabel = `+${fmt(tx.amount)} د.ج`;
              color = "#1f9d6b";
            } else if (tx.type === "expense") {
              const cat = EXPENSE_CATEGORIES.find((c) => c.id === tx.category);
              const acc = ACCOUNTS.find((a) => a.id === tx.account)!;
              icon = cat?.icon || "💸";
              title = tx.note || cat?.label || "مصروف";
              sub = `${cat?.label} · ${acc.label} · ${tx.date}`;
              amountLabel = `-${fmt(tx.amount)} ${acc.currency === "DZD" ? "د.ج" : "$"}`;
              color = "#c1504c";
            } else {
              const fromAcc = ACCOUNTS.find((a) => a.id === tx.fromAccount)!;
              const toAcc = ACCOUNTS.find((a) => a.id === tx.toAccount)!;
              icon = "🔄";
              title = tx.note || `${fromAcc.label} ← ${toAcc.label}`;
              sub = `${fromAcc.icon} ${fmt(tx.fromAmount)} ${fromAcc.currency === "DZD" ? "د.ج" : "$"} ← ${toAcc.icon} ${fmt(tx.toAmount)} ${toAcc.currency === "DZD" ? "د.ج" : "$"}`;
              amountLabel = tx.isInvestment ? "استثمار" : "تحويل";
              color = "#6b5fb5";
            }

            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-2xl border px-3.5 py-3"
                style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
              >
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg"
                  style={{ backgroundColor: "var(--bg)" }}
                >
                  {icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{title}</p>
                  <p className="truncate text-[10.5px]" style={{ color: "var(--text-muted)" }}>
                    {sub}
                  </p>
                </div>
                <span className="flex-shrink-0 text-[13px] font-bold" style={{ color, direction: "ltr" }}>
                  {amountLabel}
                </span>
                <button onClick={() => deleteTx(tx.id)} className="flex-shrink-0 p-1 opacity-40">
                  <Trash2 size={14} color="var(--text-muted)" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {sheet === "income" && (
          <IncomeSheet
            onClose={() => setSheet(null)}
            onSave={(amount, note) =>
              addTx({ id: `f${Date.now()}`, type: "income", date: new Date().toISOString().slice(0, 10), amount, note })
            }
          />
        )}
        {sheet === "expense" && (
          <ExpenseSheet
            spendPool={state.spendPool}
            visaBalance={state.visa}
            onClose={() => setSheet(null)}
            onSave={(amount, account, category, note) =>
              addTx({ id: `f${Date.now()}`, type: "expense", date: new Date().toISOString().slice(0, 10), amount, account, category, note })
            }
          />
        )}
        {sheet === "transfer" && (
          <TransferSheet
            investPool={state.investPool}
            onClose={() => setSheet(null)}
            onSave={(from, to, fromAmount, toAmount, isInvestment, note) =>
              addTx({
                id: `f${Date.now()}`,
                type: "transfer",
                date: new Date().toISOString().slice(0, 10),
                fromAccount: from,
                toAccount: to,
                fromAmount,
                toAmount,
                isInvestment,
                note,
              })
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
