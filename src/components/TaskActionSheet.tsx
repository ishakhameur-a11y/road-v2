"use client";

import { Pencil, Trash2, Copy, Check } from "lucide-react";
import Sheet from "./Sheet";
import { TaskEvent, TaskStatus, STATUS_COLOR } from "@/lib/tasks";
import { Session, getSessionFor } from "@/lib/sessions";

function mtl(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "ص" : "م"}`;
}

const STATUS_OPTIONS: { s: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { s: "done", label: "منجزة", icon: <Check size={18} strokeWidth={3} />, color: "#1f9d6b" },
  { s: "postponed", label: "مؤجلة", icon: <span style={{ fontSize: 16 }}>⏳</span>, color: "#c98a3a" },
  { s: "missed", label: "فائتة", icon: <span style={{ fontSize: 16 }}>✕</span>, color: "#c1504c" },
];

export default function TaskActionSheet({
  event,
  sessions,
  onClose,
  onStatus,
  onEdit,
  onCopyTomorrow,
  onDelete,
}: {
  event: TaskEvent;
  sessions: Session[];
  onClose: () => void;
  onStatus: (s: TaskStatus) => void;
  onEdit: () => void;
  onCopyTomorrow: () => void;
  onDelete: () => void;
}) {
  const session = getSessionFor(event.start, sessions);

  return (
    <Sheet onClose={onClose}>
      <div className="mb-5 flex items-center gap-3">
        <span
          className="h-11 w-1.5 flex-shrink-0 rounded-full"
          style={{ backgroundColor: STATUS_COLOR[event.status] }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold">{event.title}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {mtl(event.start)} – {mtl(event.end)}
            {session && (
              <span className="mr-2" style={{ color: session.color }}>
                {session.emoji} {session.label}
              </span>
            )}
          </p>
        </div>
      </div>

      <p className="mb-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        غيّر الحالة
      </p>
      <div className="mb-5 flex justify-center gap-4">
        {STATUS_OPTIONS.map((o) => {
          const isCurrent = event.status === o.s;
          return (
            <button
              key={o.s}
              onClick={() => onStatus(o.s)}
              className="flex h-16 w-16 items-center justify-center rounded-2xl transition-transform"
              style={{
                background: isCurrent ? o.color : `${o.color}1a`,
                color: isCurrent ? "#fff" : o.color,
                transform: isCurrent ? "scale(1.08)" : "scale(1)",
                boxShadow: isCurrent ? `0 8px 20px ${o.color}55` : "none",
              }}
            >
              {o.icon}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          onClick={onEdit}
          className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
        >
          <Pencil size={17} color="var(--accent)" /> تعديل المهمة
        </button>
        <button
          onClick={onCopyTomorrow}
          className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
        >
          <Copy size={17} color="var(--accent)" /> نسخ لغد
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold"
          style={{ borderColor: "#c1504c40", backgroundColor: "#c1504c15", color: "#c1504c" }}
        >
          <Trash2 size={17} /> حذف المهمة
        </button>
      </div>
    </Sheet>
  );
}
