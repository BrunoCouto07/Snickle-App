import type { AppState } from "./app-types";

export function getClassSubtitle(
  state: Pick<AppState, "teacherName" | "className" | "grade" | "schoolName">,
): string {
  let sub = `${state.teacherName || "Teacher"} · ${state.className || "Class"}`;
  if (state.grade && state.grade.trim()) {
    sub += ` (${state.grade.trim()})`;
  }
  if (state.schoolName && state.schoolName.trim()) {
    sub += ` · ${state.schoolName.trim()}`;
  }
  return sub;
}
