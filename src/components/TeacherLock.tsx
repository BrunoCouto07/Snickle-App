import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Lock, X } from "lucide-react";

export function TeacherLock({
  pin,
  onUnlock,
  onCancel,
}: {
  pin: string;
  onUnlock: () => void;
  onCancel: () => void;
}) {
  const [a] = useState(() => 6 + Math.floor(Math.random() * 7));
  const [b] = useState(() => 6 + Math.floor(Math.random() * 7));
  const [step, setStep] = useState<"math" | "pin">("math");
  const [entry, setEntry] = useState("");
  const [error, setError] = useState("");

  const options = useMemo(() => {
    const correct = a * b;
    // Since a and b are >= 6, correct is >= 36. These 3 will always be unique.
    const opts = [correct, correct + 1, correct - 2];

    // Safe Fisher-Yates shuffle (fixes crashes caused by .sort with Math.random)
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [a, b]);

  const shuffledPad = useMemo(() => {
    const keys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", ""];

    // True Fisher-Yates shuffle for all 12 buttons
    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    return keys;
  }, [step]); // Re-shuffle when step changes to 'pin'

  const submitPin = (value: string) => {
    if (value === pin) onUnlock();
    else {
      setError("Wrong PIN");
      setEntry("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="card-pop w-full max-w-sm p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-11 place-items-center rounded-2xl border-2 border-ink bg-ink text-cream">
              <Lock className="size-5" />
            </span>
            <h2 className="font-display text-xl font-bold">Teacher Lock</h2>
          </div>
          <button
            onClick={onCancel}
            className="grid size-11 place-items-center rounded-full border-2 border-ink/10"
          >
            <X className="size-5" />
          </button>
        </div>

        {step === "math" ? (
          <>
            <p className="mb-3 text-sm text-inksoft">Grown-ups only. What is {`${a} × ${b}`}?</p>
            <div className="flex gap-2">
              {options.map((o) => (
                <button
                  key={o}
                  onClick={() => (o === a * b ? setStep("pin") : setError("Try again"))}
                  className="font-display grid h-14 flex-1 place-items-center rounded-2xl border-2 border-ink/10 bg-card-warm text-xl font-bold"
                >
                  {o}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="mb-3 text-sm text-inksoft">Enter your 4-digit PIN</p>
            <div className="mb-3 flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="font-display grid h-14 flex-1 place-items-center rounded-2xl border-2 border-ink/10 bg-card-warm text-2xl"
                >
                  {entry[i] ? "*" : ""}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {shuffledPad.map((k, index) => (
                <button
                  key={k || `blank-${index}`} // Safe key for the empty space
                  onClick={() => {
                    setError("");
                    if (k === "⌫") return setEntry((e) => e.slice(0, -1));
                    if (k === "") return; // Do nothing for empty spots
                    const next = (entry + k).slice(0, 4);
                    setEntry(next);
                    if (next.length === 4) submitPin(next);
                  }}
                  className={`font-display h-14 rounded-2xl border-2 border-ink/10 bg-paper text-xl font-bold ${k === "" ? "invisible" : ""}`}
                >
                  {k}
                </button>
              ))}
            </div>
          </>
        )}
        {error && <p className="mt-3 text-center text-sm font-bold text-coral">{error}</p>}
      </motion.div>
    </div>
  );
}
