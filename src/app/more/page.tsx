"use client";

import { useMemo, useRef, useState } from "react";
import { Flame, CheckCircle2, Download, Upload, Sun, Moon, Clock } from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useTheme } from "@/lib/theme-context";
import { TaskEvent, seedTasks } from "@/lib/tasks";
import { useSessions, Session, SESSION_COLOR_PRESETS } from "@/lib/sessions";
import { FinanceTx, seedFinanceTxs } from "@/lib/finance";

const DAYS_SHORT = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
const MONTHS = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function toKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function startOfWeekSat(d: Date) {
  const r = new Date(d);
  r.setDate(r.getDate() - ((d.getDay() + 1) % 7));
  return r;
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function mtl(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "ص" : "م"}`;
}
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => i * 30);

const BACKUP_KEYS = ["road_events", "road_finance_txs", "road_theme", "road_sessions"];

export default function MorePage() {
  const { theme, toggleTheme } = useTheme();
  const [events] = useLocalStorage<TaskEvent[]>("road_events", seedTasks());
  const [txs] = useLocalStorage<FinanceTx[]>("road_finance_txs", seedFinanceTxs());
  const [sessions, setSessions] = useSessions();
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  const tasksDone = events.filter((e) => e.status === "done").length;

  const weekly = useMemo(() => {
    const start = startOfWeekSat(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(start, i);
      const key = toKey(d);
      const dayEvents = events.filter((e) => e.dateKey === key);
      if (dayEvents.length === 0) return { pct: 0, day: d };
      const done = dayEvents.filter((e) => e.status === "done").length;
      return { pct: Math.round((done / dayEvents.length) * 100), day: d };
    });
  }, [events]);
  const avg = Math.round(weekly.reduce((s, v) => s + v.pct, 0) / 7);

  const financeTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      let m = now.getMonth() - 5 + i;
      let y = now.getFullYear();
      if (m < 0) {
        m += 12;
        y--;
      }
      const monthTxs = txs.filter((tx) => {
        const d = new Date(tx.date);
        return d.getFullYear() === y && d.getMonth() === m;
      });
      const income = monthTxs.filter((tx) => tx.type === "income").reduce((s, tx) => s + tx.amount, 0);
      const expense = monthTxs
        .filter((tx) => tx.type === "expense")
        .reduce((s, tx) => s + tx.amount, 0);
      return { label: MONTHS[m].slice(0, 3), income, expense };
    });
  }, [txs]);
  const maxFinance = Math.max(...financeTrend.map((d) => Math.max(d.income, d.expense)), 1);

  function updateSessionColor(id: Session["id"], color: string) {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, color } : s)));
  }

  function updateSession(id: Session["id"], field: "start" | "end", value: number) {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  function handleExport() {
    const data: Record<string, unknown> = {};
    BACKUP_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try {
          data[key] = JSON.parse(raw);
        } catch {
          data[key] = raw;
        }
      }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `road-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("تم تحميل النسخة الاحتياطية");
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        BACKUP_KEYS.forEach((key) => {
          if (parsed[key] !== undefined) localStorage.setItem(key, JSON.stringify(parsed[key]));
        });
        showToast("تم الاسترجاع، جاري إعادة التحميل...");
        setTimeout(() => window.location.reload(), 800);
      } catch {
        showToast("الملف غير صالح");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="relative px-5 pt-6 pb-8">
      <h1 className="mb-5 text-xl font-bold">المزيد</h1>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl border px-3 py-4 text-center"
          style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
        >
          <CheckCircle2 size={20} color="var(--accent)" className="mx-auto mb-1.5" />
          <div className="text-xl font-extrabold">{tasksDone}</div>
          <div className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
            مهمة منجزة (الكل)
          </div>
        </div>
        <div
          className="rounded-2xl border px-3 py-4 text-center"
          style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
        >
          <Flame size={20} color="var(--accent)" className="mx-auto mb-1.5" />
          <div className="text-xl font-extrabold">{avg}%</div>
          <div className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
            معدل الإنتاجية الأسبوعي
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div
        className="mb-5 rounded-2xl border p-4"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
      >
        <p className="mb-3 text-sm font-bold">إنتاجية هذا الأسبوع</p>
        <div className="flex h-24 items-end gap-2">
          {weekly.map((w, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[9px] font-semibold" style={{ color: w.pct >= 80 ? "var(--accent)" : "var(--text-muted)" }}>
                {w.pct}%
              </span>
              <div className="flex h-14 w-full items-end">
                <div
                  className="w-full rounded-md transition-all"
                  style={{
                    height: `${Math.max(w.pct, 3)}%`,
                    backgroundColor: w.pct > 0 ? "var(--accent)" : "var(--border)",
                    opacity: w.pct >= 80 ? 1 : 0.55,
                  }}
                />
              </div>
              <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                {DAYS_SHORT[w.day.getDay()]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Finance trend chart */}
      <div
        className="mb-5 rounded-2xl border p-4"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold">الدخل والمصروف — آخر 6 أشهر</p>
          <div className="flex gap-3">
            <span className="text-[9px] font-semibold" style={{ color: "#1f9d6b" }}>
              ● دخل
            </span>
            <span className="text-[9px] font-semibold" style={{ color: "#c1504c" }}>
              ● مصروف
            </span>
          </div>
        </div>
        <div className="flex items-end gap-2" style={{ height: 96, direction: "ltr" }}>
          {financeTrend.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-16 w-full items-end gap-1">
                <div
                  className="flex-1 rounded-t-md"
                  style={{
                    height: `${Math.max((d.income / maxFinance) * 100, d.income > 0 ? 4 : 1)}%`,
                    backgroundColor: "#1f9d6b",
                    opacity: i === 5 ? 1 : 0.5,
                  }}
                />
                <div
                  className="flex-1 rounded-t-md"
                  style={{
                    height: `${Math.max((d.expense / maxFinance) * 100, d.expense > 0 ? 4 : 1)}%`,
                    backgroundColor: "#c1504c",
                    opacity: i === 5 ? 1 : 0.5,
                  }}
                />
              </div>
              <span
                className="text-[9px]"
                style={{ color: i === 5 ? "var(--text)" : "var(--text-muted)", fontWeight: i === 5 ? 700 : 500 }}
              >
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div
        className="mb-5 flex items-center justify-between rounded-2xl border p-4"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
      >
        <div>
          <p className="text-sm font-semibold">المظهر</p>
          <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
            فاتح أو غامق
          </p>
        </div>
        <div className="flex rounded-full p-1" style={{ backgroundColor: "var(--bg)" }}>
          <button
            onClick={() => theme !== "light" && toggleTheme()}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold"
            style={{
              backgroundColor: theme === "light" ? "var(--accent)" : "transparent",
              color: theme === "light" ? "#fff" : "var(--text-muted)",
            }}
          >
            <Sun size={14} /> فاتح
          </button>
          <button
            onClick={() => theme !== "dark" && toggleTheme()}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold"
            style={{
              backgroundColor: theme === "dark" ? "var(--accent)" : "transparent",
              color: theme === "dark" ? "#fff" : "var(--text-muted)",
            }}
          >
            <Moon size={14} /> غامق
          </button>
        </div>
      </div>

      {/* Session times */}
      <div
        className="mb-5 rounded-2xl border p-4"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
      >
        <div className="mb-3 flex items-center gap-2">
          <Clock size={16} color="var(--accent)" />
          <p className="text-sm font-bold">أوقات السشنز</p>
        </div>
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-xl p-3" style={{ backgroundColor: `${s.color}12` }}>
              <p className="mb-2 text-xs font-bold" style={{ color: s.color }}>
                {s.label}
              </p>
              <div className="mb-2.5 grid grid-cols-2 gap-2">
                <select
                  value={s.start}
                  onChange={(e) => updateSession(s.id, "start", Number(e.target.value))}
                  className="rounded-lg border px-2 py-2 text-xs outline-none"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
                >
                  {TIME_OPTIONS.map((x) => (
                    <option key={x} value={x}>
                      {mtl(x)}
                    </option>
                  ))}
                </select>
                <select
                  value={s.end}
                  onChange={(e) => updateSession(s.id, "end", Number(e.target.value))}
                  className="rounded-lg border px-2 py-2 text-xs outline-none"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
                >
                  {TIME_OPTIONS.filter((x) => x > s.start).map((x) => (
                    <option key={x} value={x}>
                      {mtl(x)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                {SESSION_COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateSessionColor(s.id, c)}
                    className="h-6 w-6 flex-shrink-0 rounded-full"
                    style={{
                      backgroundColor: c,
                      boxShadow: s.color === c ? "0 0 0 2px var(--bg-elevated), 0 0 0 3.5px " + c : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backup */}
      <div
        className="rounded-2xl border p-4"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
      >
        <p className="mb-3 text-sm font-bold">النسخ الاحتياطي</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold"
            style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}
          >
            <Download size={16} /> تصدير نسخة احتياطية
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13.5px] font-semibold"
            style={{ borderColor: "var(--border)" }}
          >
            <Upload size={16} /> استرجاع نسخة احتياطية
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
        </div>
      </div>

      {toast && (
        <div
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 text-[12.5px]"
          style={{ backgroundColor: "var(--text)", color: "var(--bg)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
