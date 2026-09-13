export type CoachmarkScreen =
  | "roster"
  | "game"
  | "admin-insights"
  | "admin-roster"
  | "admin-categories"
  | "admin-settings"
  | "admin-printables";

export const COACHMARKS_STORAGE_KEY = "kcc_coachmarks_seen";

export function getSeenCoachmarkScreens(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COACHMARKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function resetAllCoachmarks() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(COACHMARKS_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

export function markCoachmarkScreenSeen(screen: CoachmarkScreen) {
  if (typeof window !== "undefined") {
    try {
      const seen = getSeenCoachmarkScreens();
      if (!seen.includes(screen)) {
        localStorage.setItem(COACHMARKS_STORAGE_KEY, JSON.stringify([...seen, screen]));
      }
    } catch {
      // Ignore
    }
  }
}
