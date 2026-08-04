"use client";

import { TaskEvent, STATUS_COLOR } from "@/lib/tasks";
import { Session, getSessionFor } from "@/lib/sessions";

export default function EventBlock({
  event: e,
  sessions,
  top,
  height,
  rightPct,
  widthPct,
  onClick,
}: {
  event: TaskEvent;
  sessions: Session[];
  top: number;
  height: number;
  rightPct: number;
  widthPct: number;
  onClick: () => void;
}) {
  const color = STATUS_COLOR[e.status];
  const session = getSessionFor(e.start, sessions);

  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        top,
        height,
        insetInlineEnd: `calc(${rightPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
        borderRadius: 10,
        overflow: "hidden",
        textAlign: "start",
        cursor: "pointer",
        border: "none",
        zIndex: 5,
        background: e.status === "done" ? `${color}cc` : color,
        boxShadow: session ? `0 2px 8px ${session.color}30` : "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ padding: "5px 8px", height: "100%", overflow: "hidden" }}>
        <span
          style={{
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.3,
            textDecoration: e.status === "done" ? "line-through" : "none",
            opacity: e.status === "done" ? 0.85 : 1,
          }}
        >
          {e.title}
        </span>
      </div>
    </button>
  );
}
