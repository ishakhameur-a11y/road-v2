"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { TaskEvent, seedTasks } from "@/lib/tasks";
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

const RING_SIZE = 56;
const STROKE = 6;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useLocalStorage<TaskEvent[]>("road_events", seedTasks());
  const [txs] = useLocalStorage<FinanceTx[]>("road_finance_txs", seedFinanceTxs());
  const [tasksOpen, setTasksOpen] = useState(false);

  const todayEvents = events.filter((e) => e.dateKey === todayKey());
  const state = computeState(txs);

  function toggleDone(id: string) {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: e.status === "done" ? "pending" : "done" } : e))
    );
  }

  const totalToday = todayEvents.length;
  const doneToday = todayEvents.filter((e) => e.status === "done").length;
  const pct = totalToday > 0 ? Math.round((doneToday / totalToday) * 100) : 0;
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  return (
    <div className="px-5 pt-6">
      {/* Logo header */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)",
              borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)",
            }}
          >
            <span
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 19,
                color: "var(--accent)",
              }}
            >
              R
            </span>
          </div>
          <span className="text-lg font-extrabold tracking-tight">Road</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Finance summary */}
      <button
        onClick={() => router.push("/finance")}
        className="mb-4 w-full rounded-2xl border px-5 py-4 text-right"
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

      {/* Tasks collapsible card */}
      <div
        className="mb-6 overflow-hidden rounded-2xl border"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
      >
        <button
          onClick={() => setTasksOpen((o) => !o)}
          className="flex w-full items-center gap-4 px-4 py-4"
        >
          <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center">
            <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke="var(--border)"
                strokeWidth={STROKE}
                fill="none"
              />
              <motion.circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke="var(--accent)"
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeLinecap="round"
                initial={false}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute text-[13px] font-extrabold">{pct}%</span>
          </div>

          <div className="flex-1 text-right">
            <p className="text-sm font-bold">مهام اليوم</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {totalToday > 0 ? `${doneToday} من ${totalToday} منجزة` : "لا توجد مهام اليوم"}
            </p>
          </div>

          <motion.div animate={{ rotate: tasksOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} color="var(--text-muted)" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {tasksOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div
                className="flex flex-col gap-5 border-t px-4 pb-4 pt-4"
                style={{ borderColor: "var(--border)" }}
              >
                {totalToday === 0 ? (
                  <p className="py-2 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    لا توجد مهام اليوم
                  </p>
                ) : (
                  [...todayEvents]
                    .sort((a, b) => a.start - b.start)
                    .map((e) => {
                      const done = e.status === "done";
                      return (
                        <button
                          key={e.id}
                          onClick={() => router.push("/tasks")}
                          className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-right"
                          style={{
                            backgroundColor: "var(--bg)",
                            borderColor: "var(--border)",
                            opacity: done ? 0.6 : 1,
                          }}
                        >
                          <span
                            onClick={(ev) => {
                              ev.stopPropagation();
                              toggleDone(e.id);
                            }}
                            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                            style={{
                              borderColor: done ? "#1f9d6b" : "var(--border)",
                              backgroundColor: done ? "#1f9d6b" : "transparent",
                            }}
                          >
                            {done && <Check size={13} color="#fff" strokeWidth={3} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className="block truncate text-[13px] font-semibold"
                              style={{
                                textDecoration: done ? "line-through" : "none",
                                color: done ? "var(--text-muted)" : "var(--text)",
                              }}
                            >
                              {e.title}
                            </span>
                            <span className="text-[10.5px]" style={{ color: "var(--text-muted)" }}>
                              {mtl(e.start)} – {mtl(e.end)}
                            </span>
                          </span>
                        </button>
                      );
                    })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
