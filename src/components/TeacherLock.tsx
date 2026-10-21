import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, KeyRound, Lock, ShieldAlert, Sparkles, X } from "lucide-react";
import type { MathChallengeMode } from "@/lib/app-types";

interface TeacherLockProps {
  pin: string;
  scramblePinPad?: boolean;
  mathChallengeEnabled?: boolean;
  mathChallengeMode?: MathChallengeMode;
  onPinChange?: (newPin: string) => void;
  onUnlock: () => void;
  onCancel: () => void;
}

export function TeacherLock({
  pin,
  scramblePinPad = false,
  mathChallengeEnabled = true,
  mathChallengeMode = "multiplication",
  onPinChange,
  onUnlock,
  onCancel,
}: TeacherLockProps) {
  // Check local storage for custom PIN; default to 1234
  const [effectivePin, setEffectivePin] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("snickle_teacher_pin");
      if (stored && /^\d{4}$/.test(stored)) return stored;
    }
    return pin && /^\d{4}$/.test(pin) ? pin : "1234";
  });

  const [isCustomPinSet, setIsCustomPinSet] = useState(() => {
    if (typeof window !== "undefined") {
      const flag = localStorage.getItem("snickle_custom_pin_set");
      if (flag === "true") return true;
      const stored = localStorage.getItem("snickle_teacher_pin");
      if (stored && stored !== "1234") return true;
    }
    return pin ? pin !== "1234" : false;
  });

  const [defaultLoginCount, setDefaultLoginCount] = useState(() => {
    if (typeof window !== "undefined") {
      const val = parseInt(localStorage.getItem("snickle_default_pin_login_count") || "0", 10);
      return Number.isNaN(val) ? 0 : val;
    }
    return 0;
  });

  // Step management: math -> pin -> set-custom-pin
  const [step, setStep] = useState<"math" | "pin" | "set-custom-pin">(() =>
    mathChallengeEnabled ? "math" : "pin",
  );

  const [entry, setEntry] = useState("");
  const [error, setError] = useState("");
  const [promptFromThreeLogins, setPromptFromThreeLogins] = useState(false);

  // First-time banner reminder state
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Visual demonstration state for "Remind me later": 1 2 3 4 -> * * * *
  const [demoState, setDemoState] = useState<{
    active: boolean;
    digits: string[];
    asStars: boolean;
  }>({
    active: false,
    digits: [],
    asStars: false,
  });

  // New PIN input state when creating a custom PIN
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [customPinError, setCustomPinError] = useState("");

  // Math question numbers
  const [a] = useState(() => {
    if (mathChallengeMode === "addition") {
      return 7 + Math.floor(Math.random() * 12); // 7 to 18
    }
    return 6 + Math.floor(Math.random() * 7); // 6 to 12
  });

  const [b] = useState(() => {
    if (mathChallengeMode === "addition") {
      return 6 + Math.floor(Math.random() * 11); // 6 to 16
    }
    return 6 + Math.floor(Math.random() * 7); // 6 to 12
  });

  const mathResult = useMemo(() => {
    return mathChallengeMode === "addition" ? a + b : a * b;
  }, [a, b, mathChallengeMode]);

  const mathOptions = useMemo(() => {
    const correct = mathResult;
    const offset1 = correct + (correct > 20 ? 1 : 2);
    const offset2 = Math.max(1, correct - (correct > 25 ? 2 : 1));
    const opts = Array.from(new Set([correct, offset1, offset2]));
    while (opts.length < 3) {
      opts.push(correct + opts.length + 3);
    }
    // Safe Fisher-Yates shuffle
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [mathResult]);

  // Keypad keys: scrambled if enabled, else standard numpad
  const keypadKeys = useMemo(() => {
    if (scramblePinPad && step === "pin") {
      const keys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", ""];
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
      }
      return keys;
    }
    // Standard numpad layout
    return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
  }, [scramblePinPad, step]);

  const handleUnlockSuccess = useCallback(
    (enteredPin: string) => {
      // Check if using default 1234 PIN
      if (!isCustomPinSet && enteredPin === "1234") {
        const nextCount = defaultLoginCount + 1;
        setDefaultLoginCount(nextCount);
        if (typeof window !== "undefined") {
          localStorage.setItem("snickle_default_pin_login_count", String(nextCount));
        }

        // After 3 successful logins using default 1234 PIN, prompt custom PIN
        if (nextCount >= 3) {
          setPromptFromThreeLogins(true);
          setStep("set-custom-pin");
          return;
        }
      }
      onUnlock();
    },
    [isCustomPinSet, defaultLoginCount, onUnlock],
  );

  const submitPin = useCallback(
    (value: string) => {
      if (value === effectivePin) {
        handleUnlockSuccess(value);
      } else {
        setError("Wrong PIN. Try again!");
        setEntry("");
      }
    },
    [effectivePin, handleUnlockSuccess],
  );

  // Remind me later interaction: visually display 1 2 3 4 inside boxes momentarily, then fade to *
  const handleRemindMeLater = () => {
    setBannerDismissed(true);
    setDemoState({
      active: true,
      digits: ["1", "2", "3", "4"],
      asStars: false,
    });
    setEntry("1234");
    setError("");

    // Momentarily display numbers (1200ms) then fade into asterisks
    const t1 = setTimeout(() => {
      setDemoState({
        active: true,
        digits: ["*", "*", "*", "*"],
        asStars: true,
      });

      // Submit PIN smoothly after asterisk fade (650ms)
      const t2 = setTimeout(() => {
        handleUnlockSuccess("1234");
      }, 650);

      return () => clearTimeout(t2);
    }, 1200);

    return () => clearTimeout(t1);
  };

  // Physical keyboard listener for convenience on laptops/smartboard keypads
  useEffect(() => {
    if (step !== "pin" || demoState.active) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        setError("");
        setEntry((prev) => {
          const next = (prev + e.key).slice(0, 4);
          if (next.length === 4) {
            setTimeout(() => submitPin(next), 50);
          }
          return next;
        });
      } else if (e.key === "Backspace") {
        setError("");
        setEntry((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, demoState.active, submitPin]);

  // Handle saving new custom PIN
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomPinError("");
    if (!/^\d{4}$/.test(newPin)) {
      setCustomPinError("PIN must be exactly 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setCustomPinError("PIN confirmation does not match.");
      return;
    }

    setEffectivePin(newPin);
    setIsCustomPinSet(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("snickle_teacher_pin", newPin);
      localStorage.setItem("snickle_custom_pin_set", "true");
      localStorage.setItem("snickle_default_pin_login_count", "0");
    }
    onPinChange?.(newPin);
    onUnlock();
  };

  const handleSkipCustomPin = () => {
    if (typeof window !== "undefined") {
      // Reset count to give another grace period
      localStorage.setItem("snickle_default_pin_login_count", "0");
      setDefaultLoginCount(0);
    }
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="card-pop w-full max-w-sm p-5"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-11 place-items-center rounded-2xl border-2 border-ink bg-ink text-cream">
              <Lock className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold leading-tight">Teacher Lock</h2>
              <p className="text-[11px] text-inksoft font-medium">Classroom Security Gate</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="grid size-11 place-items-center rounded-full border-2 border-ink/10 bg-paper text-ink hover:bg-card-warm transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* STEP 1: MATH CHALLENGE */}
        {step === "math" && (
          <div>
            <div className="mb-3 rounded-2xl border-2 border-ink/10 bg-card-warm p-3">
              <p className="text-xs font-bold text-ink">Grown-ups verification</p>
              <p className="font-display text-base font-bold text-ink mt-0.5">
                What is {a} {mathChallengeMode === "addition" ? "+" : "×"} {b}?
              </p>
            </div>
            <div className="flex gap-2">
              {mathOptions.map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    if (o === mathResult) {
                      setError("");
                      setStep("pin");
                    } else {
                      setError("Try again! That's not quite right.");
                    }
                  }}
                  className="font-display grid h-14 flex-1 place-items-center rounded-2xl border-2 border-ink/10 bg-paper text-xl font-bold hover:border-honey hover:bg-honey/15 transition-all cursor-pointer"
                >
                  {o}
                </button>
              ))}
            </div>
            {error && <p className="mt-3 text-center text-xs font-bold text-coral">{error}</p>}
          </div>
        )}

        {/* STEP 2: PIN ENTRY */}
        {step === "pin" && (
          <div>
            {/* Task 4: First-time Onboarding Helper Banner */}
            {!isCustomPinSet && !bannerDismissed && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-2xl border-2 border-honey/40 bg-honey/15 p-3 text-ink shadow-[2px_2px_0_#3A2E28]"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="size-4 shrink-0 text-amber-600 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-ink leading-tight">
                      Set a secure PIN to protect settings.
                    </p>
                    <p className="text-inksoft text-[11px] mt-0.5 leading-snug">
                      Tip: Use your classroom number, street address, or school year!
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleRemindMeLater}
                    className="rounded-xl border border-ink/15 bg-paper px-2.5 py-1 text-xs font-bold text-ink hover:bg-card-warm transition-colors cursor-pointer"
                  >
                    Remind me later
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("set-custom-pin");
                      setPromptFromThreeLogins(false);
                    }}
                    className="rounded-xl border border-ink bg-ink px-2.5 py-1 text-xs font-bold text-cream hover:bg-ink/90 transition-colors cursor-pointer"
                  >
                    Set Custom PIN
                  </button>
                </div>
              </motion.div>
            )}

            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-inksoft">
                {demoState.active ? "Demonstrating default PIN:" : "Enter your 4-digit PIN"}
              </p>
              {scramblePinPad && (
                <span className="text-[10px] font-bold text-leaf uppercase tracking-wider bg-leaf/15 px-2 py-0.5 rounded-full border border-leaf/30">
                  Scrambled Pad
                </span>
              )}
            </div>

            {/* 4-Digit Passcode Boxes with Animated Display */}
            <div className="mb-3 flex gap-2">
              {[0, 1, 2, 3].map((i) => {
                let charToShow = "";
                if (demoState.active) {
                  charToShow = demoState.asStars ? "*" : (demoState.digits[i] ?? "");
                } else {
                  charToShow = entry[i] ? "*" : "";
                }

                return (
                  <div
                    key={i}
                    className={`font-display grid h-14 flex-1 place-items-center rounded-2xl border-2 text-2xl font-bold transition-all ${
                      demoState.active && !demoState.asStars
                        ? "border-honey bg-honey/30 text-ink scale-105 shadow-sm"
                        : entry[i]
                          ? "border-ink bg-paper text-ink"
                          : "border-ink/10 bg-card-warm text-inksoft"
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {charToShow && (
                        <motion.span
                          key={`${i}-${charToShow}-${demoState.asStars}`}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.7, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          {charToShow}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {keypadKeys.map((k, index) => (
                <button
                  key={k || `blank-${index}`}
                  disabled={demoState.active}
                  onClick={() => {
                    setError("");
                    if (k === "⌫") return setEntry((e) => e.slice(0, -1));
                    if (k === "") return;
                    const next = (entry + k).slice(0, 4);
                    setEntry(next);
                    if (next.length === 4) {
                      setTimeout(() => submitPin(next), 60);
                    }
                  }}
                  className={`font-display h-13 rounded-2xl border-2 border-ink/10 bg-paper text-xl font-bold transition-all hover:bg-card-warm active:scale-95 cursor-pointer ${
                    k === "" ? "invisible pointer-events-none" : ""
                  } ${demoState.active ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {k}
                </button>
              ))}
            </div>

            {error && <p className="mt-3 text-center text-xs font-bold text-coral">{error}</p>}
          </div>
        )}

        {/* STEP 3: ESTABLISH CUSTOM PIN (Auto-prompted after 3 logins or chosen by user) */}
        {step === "set-custom-pin" && (
          <form onSubmit={handleSaveNewPin} className="space-y-3.5">
            <div className="rounded-2xl border-2 border-honey/40 bg-honey/15 p-3">
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="size-4 text-amber-600" />
                <h3 className="font-display text-sm font-bold text-ink">
                  {promptFromThreeLogins
                    ? "Classroom Security Check"
                    : "Establish Your Teacher PIN"}
                </h3>
              </div>
              <p className="text-xs text-inksoft leading-relaxed">
                {promptFromThreeLogins
                  ? "You've unlocked Snickle 3 times using the default PIN (1234). Please establish a unique custom PIN for your classroom."
                  : "Set a secure 4-digit PIN to protect classroom settings and student records."}
              </p>
              <div className="mt-2 text-[11px] font-bold text-ink/80 flex items-center gap-1.5">
                <Sparkles className="size-3 text-honey shrink-0" />
                <span>Tip: Use your room number, street address, or school year!</span>
              </div>
            </div>

            <div>
              <label className="font-display text-xs font-bold text-ink mb-1 block">
                New 4-Digit PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={(e) => {
                  setCustomPinError("");
                  setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                }}
                placeholder="e.g. 4021"
                className="h-12 w-full rounded-2xl border-2 border-ink/10 bg-paper px-4 font-mono text-center text-xl font-bold tracking-widest outline-none focus:border-honey"
              />
            </div>

            <div>
              <label className="font-display text-xs font-bold text-ink mb-1 block">
                Confirm New PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => {
                  setCustomPinError("");
                  setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                }}
                placeholder="Re-enter 4 digits"
                className="h-12 w-full rounded-2xl border-2 border-ink/10 bg-paper px-4 font-mono text-center text-xl font-bold tracking-widest outline-none focus:border-honey"
              />
            </div>

            {customPinError && (
              <p className="text-center text-xs font-bold text-coral">{customPinError}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              {promptFromThreeLogins ? (
                <button
                  type="button"
                  onClick={handleSkipCustomPin}
                  className="rounded-xl border border-ink/15 bg-paper px-3 py-2 text-xs font-bold text-inksoft hover:text-ink hover:bg-card-warm transition-colors cursor-pointer"
                >
                  Keep 1234 for now
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep("pin")}
                  className="rounded-xl border border-ink/15 bg-paper px-3 py-2 text-xs font-bold text-inksoft hover:text-ink hover:bg-card-warm transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={newPin.length !== 4 || confirmPin.length !== 4}
                className="flex items-center gap-1.5 rounded-xl border-2 border-ink bg-ink px-4 py-2 font-display text-xs font-bold text-cream hover:bg-ink/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Check className="size-3.5" /> Save PIN & Unlock
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
