export type TaskStatus = "pending" | "done" | "postponed" | "missed";

export interface TaskEvent {
  id: string;
  dateKey: string; // YYYY-M-D
  title: string;
  start: number; // minutes from midnight
  end: number;
  status: TaskStatus;
}

export const STATUS_COLOR: Record<TaskStatus, string> = {
  pending: "var(--accent)",
  done: "#1f9d6b",
  postponed: "#c98a3a",
  missed: "#c1504c",
};

export function statusLabel(s: TaskStatus): string {
  switch (s) {
    case "done":
      return "منجزة";
    case "postponed":
      return "مؤجلة";
    case "missed":
      return "فائتة";
    default:
      return "قيد الانتظار";
  }
}

export const HOUR = 56;

export interface PlacedEvent {
  event: TaskEvent;
  col: number;
  total: number;
}

export function layoutDay(events: TaskEvent[]): PlacedEvent[] {
  const sorted = [...events].sort((a, b) => a.start - b.start || b.end - a.end);
  const colEnds: number[] = [];
  const placed = sorted.map((e) => {
    let col = colEnds.findIndex((end) => end <= e.start);
    if (col === -1) {
      col = colEnds.length;
      colEnds.push(e.end);
    } else {
      colEnds[col] = e.end;
    }
    return { event: e, col };
  });
  return placed.map((p) => ({ ...p, total: colEnds.length }));
}

function keyOf(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function seedTasks(): TaskEvent[] {
  const today = new Date();
  const addD = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };
  return [
    { id: "e1", dateKey: keyOf(today), title: "مراجعة خطة المشروع الأسبوعية", start: 9 * 60, end: 9 * 60 + 30, status: "done" },
    { id: "e2", dateKey: keyOf(today), title: "اجتماع فريق التصميم", start: 10 * 60 + 30, end: 11 * 60 + 30, status: "pending" },
    { id: "e3", dateKey: keyOf(today), title: "متابعة رسائل العمل", start: 14 * 60, end: 14 * 60 + 30, status: "pending" },
    { id: "e4", dateKey: keyOf(today), title: "غداء مع الفريق", start: 15 * 60, end: 16 * 60, status: "pending" },
    { id: "e5", dateKey: keyOf(today), title: "تمارين رياضية", start: 18 * 60 + 30, end: 19 * 60 + 30, status: "pending" },
    { id: "e6", dateKey: keyOf(today), title: "قراءة قبل النوم", start: 21 * 60, end: 21 * 60 + 30, status: "pending" },
    { id: "e7", dateKey: keyOf(addD(1)), title: "مكالمة مع العميل", start: 10 * 60, end: 11 * 60, status: "pending" },
    { id: "e8", dateKey: keyOf(addD(-1)), title: "موعد طبيب الأسنان", start: 16 * 60 + 30, end: 17 * 60 + 30, status: "missed" },
  ];
}
