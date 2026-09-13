import { useRef, useState } from "react";
import { Check, Cloud, Download, FileUp, ShieldCheck, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import type { AppState } from "@/lib/app-types";
import { exportAppState, importAppState } from "@/lib/backup";

export function SyncBackupModal({
  state,
  onRestore,
  onClose,
}: {
  state: AppState;
  onRestore: (newState: AppState) => void;
  onClose: () => void;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const success = exportAppState(state);
    if (success) {
      setIsError(false);
      setMsg(
        "Backup file downloaded successfully! All student profiles, choices, and settings are saved.",
      );
    } else {
      setIsError(true);
      setMsg("Failed to generate backup download.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importAppState(
      file,
      (imported) => {
        setIsError(false);
        setMsg(
          `Restored backup for "${imported.className}" (${imported.students.length} students)!`,
        );
        onRestore(imported);
      },
      (err) => {
        setIsError(true);
        setMsg(err);
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="card-pop w-full max-w-md p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="size-5 text-sky" />
            <h2 className="font-display text-xl font-bold">Classroom Backup & Sync</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full border-2 border-ink/10 hover:bg-card-warm"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Local Persistence Status */}
        <div className="mb-4 flex items-start gap-2.5 rounded-2xl border-2 border-leaf/30 bg-leaf/10 p-3 text-xs leading-relaxed text-leaf">
          <ShieldCheck className="size-5 shrink-0 text-leaf" />
          <div>
            <p className="font-bold">Offline Local Storage Active</p>
            <p className="opacity-90">
              Your classroom data is saved continuously in this device&apos;s browser. Download a
              backup to transfer data to another iPad/computer or save a safe copy.
            </p>
          </div>
        </div>

        {msg && (
          <div
            className={`mb-4 rounded-xl border p-3 text-xs font-bold ${
              isError
                ? "border-coral/40 bg-coral/10 text-coral"
                : "border-leaf/40 bg-leaf/10 text-leaf"
            }`}
          >
            {msg}
          </div>
        )}

        <div className="space-y-3">
          {/* Export button */}
          <button
            onClick={handleExport}
            className="font-display flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-ink bg-ink py-3.5 text-base font-bold text-cream shadow-[3px_3px_0_#FFC63F] hover:opacity-95"
          >
            <Download className="size-5" /> Download Class Backup (.json)
          </button>

          {/* Import / Restore button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="font-display flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink/15 bg-card-warm py-3 text-sm font-bold text-ink hover:bg-paper"
          >
            <Upload className="size-4 text-sky" /> Restore From Backup File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="mt-4 border-t border-ink/10 pt-3 text-center text-xs text-inksoft">
          <span>
            {state.students.length} students · {state.categories.length} categories ·{" "}
            {state.choices.length} logged choices
          </span>
        </div>
      </motion.div>
    </div>
  );
}
