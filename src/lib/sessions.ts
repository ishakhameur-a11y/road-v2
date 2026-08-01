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
  { id: "morning", label: "صباحي", emoji: "🌅", start: 8 * 60, end: 12 * 60, color: "#c98a3a" },
  { id: "afternoon", label: "ظهيرة", emoji: "☀️", start: 13 * 60, end: 17 * 60, color: "#2f8f8f" },
  { id: "evening", label: "مسائي", emoji: "🌙", start: 18 * 60, end: 22 * 60, color: "#6b5fb5" },
];

export function getSessionFor(minutes: number, sessions: Session[]): Session | null {
  return sessions.find((s) => minutes >= s.start && minutes < s.end) || null;
}

export function useSessions() {
  const [sessions, setSessions, loaded] = useLocalStorage<Session[]>("road_sessions", DEFAULT_SESSIONS);
  return [sessions, setSessions, loaded] as const;
}
