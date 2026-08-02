"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronRight, ChevronLeft, CalendarDays } from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  TaskEvent,
  TaskStatus,
  HOUR,
  layoutDay,
  seedTasks,
} from "@/lib/tasks";
import { useSessions } from "@/lib/sessions";
import EventBlock from "@/components/EventBlock";
import TaskFormSheet from "@/components/TaskFormSheet";
import TaskActionSheet from "@/components/TaskActionSheet";
import MonthView from "@/components/MonthView";

type ViewMode = "day" | "week" | "month";

const MONTHS = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const DAYS_SHORT = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

function toKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function startOfWeekSat(d: Date) {
  return addDays(d, -((d.getDay() + 1) % 7));
}
function fullDate(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function hourLabel(h: number) {
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh} ${h < 12 ? "ص" : "م"}`;
}

export default function TasksPage() {
  const [events, setEvents] = useLocalStorage<TaskEvent[]>("road_events", seedTasks());
  const [sessions] = useSessions();
  const [selected, setSelected] = useState(new Date());
  const [view, setView] = useState<ViewMode>("week");
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [addSheet, setAddSheet] = useState<{ start: number } | null>(null);
  const [editSheet, setEditSheet] = useState<TaskEvent | null>(null);
  const [actionSheet, setActionSheet] = useState<TaskEvent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const selKey = toKey(selected);
  const dayEvents = events.filter((e) => e.dateKey === selKey);
  const placed = layoutDay(dayEvents);
  const weekStart = startOfWeekSat(selected);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 7 * HOUR });
  }, []);

  function jumpToSession(start: number) {
    const hour = Math.max(start / 60 - 0.5, 0);
    scrollRef.current?.scrollTo({ top: hour * HOUR, behavior: "smooth" });
  }

  function addEvent(title: string, start: number, end: number) {
    setEvents((prev) => [...prev, { id: `e${Date.now()}`, dateKey: selKey, title, start, end, status: "pending" }]);
    setAddSheet(null);
  }
  function updateEvent(id: string, title: string, start: number, end: number) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, title, start, end } : e)));
    setEditSheet(null);
  }
  function setStatus(id: string, status: TaskStatus) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: e.status === status ? "pending" : status } : e)));
    setActionSheet(null);
  }
  function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setActionSheet(null);
  }
  function copyTomorrow(e: TaskEvent) {
    const [y, m, d] = e.dateKey.split("-").map(Number);
    const next = addDays(new Date(y, m - 1, d), 1);
    setEvents((prev) => [...prev, { ...e, id: `e${Date.now()}`, dateKey: toKey(next), status: "pending" }]);
    setActionSheet(null);
  }

  const nowMins = today.getHours() * 60 + today.getMinutes();
  const isToday = isSameDay(selected, today);

  return (
    <div className="relative flex h-[calc(100dvh-84px)] flex-col">
      {/* Header */}
      <header
        className="z-20 border-b px-4 pb-3 pt-4 backdrop-blur-md"
        style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--bg) 92%, transparent)" }}
      >
        <div className="relative mb-1 flex items-center justify-center">
          {/* View switcher - top left */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <button
              onClick={() => setViewMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
            >
              <CalendarDays size={18} color="var(--accent)" />
            </button>
            {viewMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setViewMenuOpen(false)} />
                <div
                  className="absolute top-11 left-0 z-40 w-28 overflow-hidden rounded-xl border"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
                >
                  {(
                    [
                      { id: "day" as const, label: "يوم" },
                      { id: "week" as const, label: "أسبوع" },
                      { id: "month" as const, label: "شهر" },
                    ]
                  ).map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setView(v.id);
                        setViewMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2.5 text-start text-sm font-semibold"
                      style={{
                        backgroundColor: view === v.id ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
                        color: view === v.id ? "var(--accent)" : "var(--text)",
                      }}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Center: date nav or month title */}
          {view !== "month" ? (
            <div className="flex items-center gap-3">
              <button onClick={() => setSelected((d) => addDays(d, view === "week" ? -7 : -1))} className="p-1">
                <ChevronRight size={20} color="var(--text-muted)" />
              </button>
              <div className="text-center">
                <h1 className="text-[15px] font-bold">
                  {view === "week" ? "هذا الأسبوع" : isToday ? "اليوم" : DAYS_SHORT[selected.getDay()]}
                </h1>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {view === "week"
                    ? `${weekDates[0].getDate()} – ${weekDates[6].getDate()} ${MONTHS[weekDates[6].getMonth()]}`
                    : fullDate(selected)}
                </p>
              </div>
              <button onClick={() => setSelected((d) => addDays(d, view === "week" ? 7 : 1))} className="p-1">
                <ChevronLeft size={20} color="var(--text-muted)" />
              </button>
            </div>
          ) : (
            <h1 className="text-[15px] font-bold">عرض الشهر</h1>
          )}

          {/* Add button - top right */}
          <button
            onClick={() => setAddSheet({ start: Math.min((today.getHours() + 1) * 60, 22 * 60) })}
            className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-white"
            style={{
              backgroundColor: "var(--accent)",
              boxShadow: "0 4px 12px color-mix(in srgb, var(--accent) 35%, transparent)",
            }}
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      {/* Timeline / Month */}
      {view === "month" ? (
        <MonthView
          monthY={monthAnchor.y}
          monthM={monthAnchor.m}
          setMonth={setMonthAnchor}
          selected={selected}
          onSelect={(d) => setSelected(d)}
          events={events}
          onPickEvent={(e) => setActionSheet(e)}
        />
      ) : (
        <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
          {view === "week" && (
            <div
              className="sticky top-0 z-10 flex border-b backdrop-blur-md"
              style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--bg) 92%, transparent)" }}
            >
              <div style={{ width: 44, flexShrink: 0 }} />
              {weekDates.map((d) => {
                const isSel = isSameDay(d, selected);
                const isTdy = isSameDay(d, today);
                return (
                  <button
                    key={toKey(d)}
                    onClick={() => setSelected(d)}
                    className="flex flex-1 flex-col items-center gap-0.5 py-1.5"
                  >
                    <span className="whitespace-nowrap text-[8px]" style={{ color: "var(--text-muted)" }}>
                      {DAYS_SHORT[d.getDay()]}
                    </span>
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor: isTdy ? "var(--accent)" : "transparent",
                        color: isTdy ? "#fff" : isSel ? "var(--accent)" : "var(--text)",
                        boxShadow: isSel && !isTdy ? "0 0 0 1px var(--accent) inset" : "none",
                      }}
                    >
                      {d.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ position: "relative", height: 24 * HOUR + 20, display: "flex" }}>
            <div style={{ position: "relative", width: 44, flexShrink: 0 }}>
              {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => (
                <span
                  key={h}
                  style={{ position: "absolute", right: 4, top: h * HOUR - 6, fontSize: 9, color: "var(--text-muted)" }}
                >
                  {hourLabel(h)}
                </span>
              ))}
            </div>

            {(view === "week" ? weekDates : [selected]).map((day) => {
              const dKey = toKey(day);
              const columnEvents = view === "week" ? events.filter((e) => e.dateKey === dKey) : dayEvents;
              const columnPlaced = view === "week" ? layoutDay(columnEvents) : placed;
              const isDayToday = isSameDay(day, today);

              return (
                <div
                  key={dKey}
                  className="relative flex-1"
                  onClick={(ev) => {
                    const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
                    const y = ev.clientY - rect.top;
                    const slot = Math.min(Math.max(Math.round((y / HOUR) * 2) / 2, 0), 23.5);
                    if (view === "week") setSelected(day);
                    setAddSheet({ start: Math.round(slot * 60) });
                  }}
                >
                  {/* Hour rows */}
                  {Array.from({ length: 24 }, (_, i) => {
                    const session = sessions.find((s) => i * 60 >= s.start && i * 60 < s.end);
                    return (
                      <div
                        key={i}
                        style={{
                          position: "absolute",
                          insetInline: 4,
                          top: i * HOUR + 2,
                          height: HOUR - 4,
                          borderRadius: 10,
                          background: session ? `${session.color}12` : "var(--bg-elevated)",
                          border: `1px solid ${session ? `${session.color}25` : "var(--border)"}`,
                        }}
                      />
                    );
                  })}

                  {/* Session color bands only (no label) — the tint difference is enough */}

                  {/* Current time indicator */}
                  {isDayToday && (
                    <div
                      style={{
                        position: "absolute",
                        insetInline: 4,
                        top: (nowMins / 60) * HOUR,
                        zIndex: 6,
                        display: "flex",
                        alignItems: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <span style={{ height: 8, width: 8, borderRadius: "50%", background: "var(--accent)", marginInlineStart: -3 }} />
                      <span style={{ height: 1.5, flex: 1, background: "var(--accent)" }} />
                    </div>
                  )}

                  {columnPlaced.map(({ event: e, col, total }) => (
                    <EventBlock
                      key={e.id}
                      event={e}
                      sessions={sessions}
                      top={(e.start / 60) * HOUR}
                      height={Math.max(((e.end - e.start) / 60) * HOUR - 2, 22)}
                      rightPct={col * (100 / total)}
                      widthPct={100 / total}
                      onClick={() => setActionSheet(e)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
          <div style={{ height: 40 }} />
        </div>
      )}

      {/* Sheets */}
      <AnimatePresence>
        {addSheet && (
          <TaskFormSheet
            title="مهمة جديدة"
            initialStart={addSheet.start}
            dateLabel={fullDate(selected)}
            sessions={sessions}
            onClose={() => setAddSheet(null)}
            onSave={addEvent}
            saveLabel="حفظ المهمة"
          />
        )}
        {editSheet && (
          <TaskFormSheet
            title="تعديل المهمة"
            initialTitle={editSheet.title}
            initialStart={editSheet.start}
            initialEnd={editSheet.end}
            dateLabel={fullDate(selected)}
            sessions={sessions}
            onClose={() => setEditSheet(null)}
            onSave={(title, start, end) => updateEvent(editSheet.id, title, start, end)}
            saveLabel="حفظ التعديلات"
          />
        )}
        {actionSheet && (
          <TaskActionSheet
            event={actionSheet}
            sessions={sessions}
            onClose={() => setActionSheet(null)}
            onStatus={(s) => setStatus(actionSheet.id, s)}
            onEdit={() => {
              setEditSheet(actionSheet);
              setActionSheet(null);
            }}
            onCopyTomorrow={() => copyTomorrow(actionSheet)}
            onDelete={() => deleteEvent(actionSheet.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
