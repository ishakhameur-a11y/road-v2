"use client";

import { useLocalStorage } from "./useLocalStorage";

export interface Session {
  id: "morning" | "afternoon" | "evening";
  label: string;
  emoji: string;
  start: number; // minutes from midnight
  end: number;
  color: string;
}

export const DEFAULT_SESSIONS: Session[] = [
  { id: "morning", label: "سشن 1", emoji: "🌅", start: 8 * 60, end: 12 * 60, color: "#c98a3a" },
  { id: "afternoon", label: "سشن 2", emoji: "☀️", start: 13 * 60, end: 17 * 60, color: "#2f8f8f" },
  { id: "evening", label: "سشن 3", emoji: "🌙", start: 18 * 60, end: 22 * 60, color: "#6b5fb5" },
];

export const SESSION_LABELS: Record<Session["id"], string> = {
  morning: "سشن 1",
  afternoon: "سشن 2",
  evening: "سشن 3",
};

export const SESSION_COLOR_PRESETS = [
  "#c98a3a", // amber
  "#2f8f8f", // teal
  "#6b5fb5", // purple
  "#c1504c", // rose
  "#3b6ea5", // blue
  "#4a9d5f", // green
];

export function getSessionFor(minutes: number, sessions: Session[]): Session | null {
  return sessions.find((s) => minutes >= s.start && minutes < s.end) || null;
}

export function useSessions() {
  const [sessions, setSessions, loaded] = useLocalStorage<Session[]>("road_sessions", DEFAULT_SESSIONS);
  return [sessions, setSessions, loaded] as const;
}
