"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { TaskEvent, seedTasks } from "@/lib/tasks";
import { useSessions } from "@/lib/sessions";
import { FinanceTx, computeState, seedFinanceTxs } from "@/lib/finance";
import ThemeToggle from "@/components/ThemeToggle";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function mtl(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "ص" : "م"}`;
}

export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useLocalStorage<TaskEvent[]>("road_events", seedTasks());
  const [sessions] = useSessions();
  const [txs] = useLocalStorage<FinanceTx[]>("road_finance_txs", seedFinanceTxs());

  const todayEvents = events.filter((e) => e.dateKey === todayKey());
  const state = computeState(txs);

  function toggleDone(id: string) {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: e.status === "done" ? "pending" : "done" } : e))
    );
  }

  const totalToday = todayEvents.length;
  const doneToday = todayEvents.filter((e) => e.status === "done").length;

  return (
    <div className="px-5 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">الرئيسية</h1>
          {totalToday > 0 && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {doneToday} من {totalToday} منجزة اليوم
            </p>
          )}
        </div>
        <ThemeToggle />
      </header>

      {/* Sessions */}
      <div className="mb-5 flex flex-col gap-5">
        {sessions.map((s) => {
          const sessionEvents = todayEvents
            .filter((e) => e.start >= s.start && e.start < s.end)
            .sort((a, b) => a.start - b.start);
          if (sessionEvents.length === 0) return null;

          return (
            <div key={s.id}>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="text-base">{s.emoji}</span>
                <span className="text-sm font-bold" style={{ color: s.color }}>
                  {s.label}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {sessionEvents.map((e) => {
                    const done = e.status === "done";
                    return (
                      <motion.button
                        key={e.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => router.push("/tasks")}
                        className="flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-right"
                        style={{
                          backgroundColor: "var(--bg-elevated)",
                          borderColor: "var(--border)",
                          opacity: done ? 0.6 : 1,
                        }}
                      >
                        <span
                          onClick={(ev) => {
                            ev.stopPropagation();
                            toggleDone(e.id);
                          }}
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                          style={{
                            borderColor: done ? "#1f9d6b" : "var(--border)",
                            backgroundColor: done ? "#1f9d6b" : "transparent",
                          }}
                        >
                          {done && <Check size={15} color="#fff" strokeWidth={3} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className="block truncate text-[13.5px] font-semibold"
                            style={{
                              textDecoration: done ? "line-through" : "none",
                              color: done ? "var(--text-muted)" : "var(--text)",
                            }}
                          >
                            {e.title}
                          </span>
                          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                            {mtl(e.start)} – {mtl(e.end)}
                          </span>
                        </span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {totalToday === 0 && (
          <div
            className="rounded-2xl border px-5 py-8 text-center"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
          >
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              لا توجد مهام اليوم
            </p>
          </div>
        )}
      </div>

      {/* Finance summary */}
      <button
        onClick={() => router.push("/finance")}
        className="mb-6 w-full rounded-2xl border px-5 py-4 text-right"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
      >
        <p className="mb-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          💰 متاح للصرف
        </p>
        <p
          className="text-2xl font-extrabold"
          style={{ color: "var(--accent)", direction: "ltr", textAlign: "right" }}
        >
          {Math.round(state.spendPool).toLocaleString()} د.ج
        </p>
      </button>
    </div>
  );
}
