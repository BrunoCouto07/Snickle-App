import { useCallback, useEffect, useState } from "react";
import type { AppState, Category, Student } from "./app-types";
import { DEFAULT_STATE } from "./defaults";
import { applyTheme } from "./themes";

const KEY = "snickle-state-v1";

const OLD_DEFAULTS = ["Theo", "Amara", "Noor", "Milo", "Sofia"];

function migrateCategory(c: Category): Category {
  return {
    smart: false,
    usedOptionIds: [],
    pool: c.pool ?? "animals",
    ...c,
  };
}

function migrateStudents(students: Student[] | undefined): Student[] {
  if (!students || students.length === 0) return DEFAULT_STATE.students;
  const isLegacy = students.length === 5 && students.every((s) => OLD_DEFAULTS.includes(s.name));
  if (isLegacy) {
    return DEFAULT_STATE.students;
  }
  return students;
}

export function loadState(): AppState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const merged: AppState = { ...DEFAULT_STATE, ...parsed };
    return {
      ...merged,
      students: migrateStudents(merged.students),
      categories: (merged.categories ?? []).map(migrateCategory),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    applyTheme(loaded.uiTheme);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyTheme(state.uiTheme);
  }, [state.uiTheme, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
    setSyncing(true);
    const t = window.setTimeout(() => setSyncing(false), 700);
    return () => window.clearTimeout(t);
  }, [state, hydrated]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => fn(s)), []);

  return { state, update, hydrated, syncing };
}
