"use client";

import { TaskEvent, STATUS_COLOR } from "@/lib/tasks";

const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const CAL_LETTERS = ["سبت", "أحد", "اثن", "ثلا", "أرب", "خمي", "جمع"];

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
function getMonthGrid(y: number, m: number): Date[] {
  const first = new Date(y, m, 1);
  const startPad = (first.getDay() + 1) % 7;
  const start = addDays(first, -startPad);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
function mtl(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "ص" : "م"}`;
}

export default function MonthView({
  monthY,
  monthM,
  setMonth,
  selected,
  onSelect,
  events,
  onPickEvent,
}: {
  monthY: number;
  monthM: number;
  setMonth: (fn: (prev: { y: number; m: number }) => { y: number; m: number }) => void;
  selected: Date;
  onSelect: (d: Date) => void;
  events: TaskEvent[];
  onPickEvent: (e: TaskEvent) => void;
}) {
  const grid = getMonthGrid(monthY, monthM);
  const selKey = toKey(selected);
  const eventsByKey = new Map<string, TaskEvent[]>();
  events.forEach((e) => {
    const arr = eventsByKey.get(e.dateKey) ?? [];
    arr.push(e);
    eventsByKey.set(e.dateKey, arr);
  });
  const selEvents = [...(eventsByKey.get(selKey) ?? [])].sort((a, b) => a.start - b.start);

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <div className="flex items-center justify-between px-4 pt-3">
        <button
          onClick={() => setMonth(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))}
          className="flex h-8 w-8 items-center justify-center rounded-xl border"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
        >
          ›
        </button>
        <span className="text-[13px] font-bold">
          {MONTHS[monthM]} {monthY}
        </span>
        <button
          onClick={() => setMonth(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))}
          className="flex h-8 w-8 items-center justify-center rounded-xl border"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
        >
          ‹
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 border-b px-1 pb-1" style={{ borderColor: "var(--border)" }}>
        {CAL_LETTERS.map((d) => (
          <span key={d} className="text-center text-[10px]" style={{ color: "var(--text-muted)" }}>
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 px-1">
        {grid.map((d, i) => {
          const key = toKey(d);
          const inMonth = d.getMonth() === monthM;
          const isSel = isSameDay(d, selected);
          const isToday = isSameDay(d, new Date());
          const list = [...(eventsByKey.get(key) ?? [])].sort((a, b) => a.start - b.start);
          return (
            <button
              key={i}
              onClick={() => onSelect(d)}
              className="flex min-h-[62px] flex-col items-stretch gap-1 border-b px-0.5 py-1 text-start"
              style={{
                borderColor: "color-mix(in srgb, var(--border) 60%, transparent)",
                backgroundColor: isSel ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
                borderRadius: isSel ? 8 : 0,
                boxShadow: isSel ? "0 0 0 1px color-mix(in srgb, var(--accent) 40%, transparent) inset" : "none",
              }}
            >
              <span
                className="mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
                style={{
                  backgroundColor: isToday ? "var(--accent)" : "transparent",
                  fontWeight: isToday ? 700 : 400,
                  color: isToday ? "#fff" : inMonth ? "var(--text)" : "var(--text-muted)",
                  opacity: inMonth ? 1 : 0.4,
                }}
              >
                {d.getDate()}
              </span>
              {list.slice(0, 2).map((e) => (
                <span
                  key={e.id}
                  className="block truncate rounded px-1 text-[7.5px] font-semibold leading-tight text-white"
                  style={{ backgroundColor: STATUS_COLOR[e.status].startsWith("var") ? "var(--accent)" : STATUS_COLOR[e.status] }}
                >
                  {e.title}
                </span>
              ))}
              {list.length > 2 && (
                <span className="text-center text-[8px]" style={{ color: "var(--text-muted)" }}>
                  +{list.length - 2}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2 px-4">
        <h3 className="text-[13px] font-bold">
          {selected.getDate()} {MONTHS[selected.getMonth()]}
        </h3>
        {selEvents.length === 0 ? (
          <p className="py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            لا توجد مهام في هذا اليوم
          </p>
        ) : (
          selEvents.map((e) => (
            <button
              key={e.id}
              onClick={() => onPickEvent(e)}
              className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
            >
              <span
                className="h-9 w-1.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_COLOR[e.status].startsWith("var") ? "var(--accent)" : STATUS_COLOR[e.status] }}
              />
              <span className="min-w-0 flex-1">
                <span
                  className="block truncate text-[13px] font-semibold"
                  style={{ textDecoration: e.status === "done" ? "line-through" : "none" }}
                >
                  {e.title}
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {mtl(e.start)} – {mtl(e.end)}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
