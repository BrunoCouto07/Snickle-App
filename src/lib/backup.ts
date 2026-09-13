import type { AppState } from "./app-types";

/**
 * Export current AppState to a downloadable JSON backup file.
 */
export function exportAppState(state: AppState) {
  try {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `snickle-backup-${state.className.replace(/\s+/g, "-").toLowerCase()}-${timestamp}.json`;
    const jsonString = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("Backup export failed:", err);
    return false;
  }
}

/**
 * Parse and validate an uploaded backup file.
 */
export function importAppState(
  file: File,
  onSuccess: (imported: AppState) => void,
  onError: (errMsg: string) => void,
) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result;
      if (typeof content !== "string") {
        onError("Could not read file content.");
        return;
      }
      const data = JSON.parse(content) as Partial<AppState>;
      if (!data || !Array.isArray(data.students) || !Array.isArray(data.categories)) {
        onError("Invalid backup format. Missing students or categories.");
        return;
      }
      onSuccess(data as AppState);
    } catch (err) {
      onError("Failed to parse JSON file. Please ensure it is a valid backup.");
    }
  };
  reader.onerror = () => onError("Error reading the selected file.");
  reader.readAsText(file);
}
