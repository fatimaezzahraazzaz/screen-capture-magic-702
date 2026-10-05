// Local persistent "database" layer. Tables mirror the target PostgreSQL schema
// so this module can be swapped for a real backend without touching the UI.
import { useSyncExternalStore } from "react";
import { createSeed, SEED_VERSION } from "./seed";
import type { Database } from "./types";

const KEY = `as-report-assistant-db-v${SEED_VERSION}`;
const serverSnapshot = createSeed();
let state: Database | null = null;
const listeners = new Set<() => void>();

function load(): Database {
  if (state) return state;
  if (typeof window === "undefined") return serverSnapshot;
  try {
    const raw = window.localStorage.getItem(KEY);
    state = raw ? (JSON.parse(raw) as Database) : createSeed();
  } catch {
    state = createSeed();
  }
  return state;
}

export function getDb(): Database {
  return load();
}

export function updateDb(fn: (db: Database) => Database) {
  state = fn(load());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
  listeners.forEach((l) => l());
}

export function resetDb() {
  const session = load().session;
  updateDb(() => ({ ...createSeed(), session }));
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useDb<T>(selector: (db: Database) => T): T {
  const db = useSyncExternalStore(subscribe, load, () => serverSnapshot);
  return selector(db);
}

export const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
export const now = () => new Date().toISOString();
