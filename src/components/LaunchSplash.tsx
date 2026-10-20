import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, Star } from "lucide-react";

interface LaunchSplashProps {
  onComplete?: () => void;
  durationMs?: number;
}

export function LaunchSplash({ onComplete, durationMs = 1800 }: LaunchSplashProps) {
  const [visible, setVisible] = useState(true);

  const dismiss = useCallback(() => {
    setVisible(false);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dismiss();
    }, durationMs);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        dismiss();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKey);
    };
  }, [dismiss, durationMs]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="launch-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          onClick={dismiss}
          className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-[#FAF6EE] select-none cursor-pointer"
          role="dialog"
          aria-label="Welcome to Snickle"
        >
          {/* Background playful floating shapes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
            <motion.div
              animate={{ y: [0, -18, 0], rotate: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute top-12 left-10 text-4xl"
            >
              🎨
            </motion.div>
            <motion.div
              animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="absolute top-20 right-14 text-4xl"
            >
              🚀
            </motion.div>
            <motion.div
              animate={{ y: [0, -12, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
              className="absolute bottom-24 left-16 text-4xl"
            >
              🐾
            </motion.div>
            <motion.div
              animate={{ y: [0, 16, 0], rotate: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
              className="absolute bottom-20 right-20 text-4xl"
            >
              🌈
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
              className="absolute top-1/2 left-8 text-3xl"
            >
              🍎
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 2.1, ease: "easeInOut" }}
              className="absolute top-1/2 right-10 text-3xl"
            >
              ⚡
            </motion.div>
          </div>

          {/* Central Logo & Animation */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <motion.div
              initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: -4, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 18,
                delay: 0.05,
              }}
              className="relative mb-5 grid size-24 place-items-center rounded-3xl border-3 border-ink bg-honey shadow-[4px_4px_0_#3A2E28]"
            >
              <motion.div
                animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Star className="size-14 fill-ink text-ink" />
              </motion.div>
              <motion.div
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                className="absolute -top-2 -right-2 text-xl"
              >
                ✨
              </motion.div>
            </motion.div>

            {/* App Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <h1 className="font-display text-5xl font-black tracking-tight text-ink sm:text-6xl drop-shadow-xs">
                Snickle
              </h1>
              <p className="font-hand mt-1 text-2xl text-coral font-bold sm:text-3xl">
                empowering every learner&apos;s voice
              </p>
            </motion.div>

            {/* Friendly Subtitle / Features */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-4 flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-white/80 px-4 py-1.5 text-xs font-bold text-inksoft shadow-xs backdrop-blur-xs"
            >
              <Sparkles className="size-3.5 text-honey" />
              <span>Joyful choices · Star tokens · Class audio</span>
            </motion.div>

            {/* Quick Progress Bar (indicates the 1-2s transition) */}
            <div className="mt-8 w-44 h-2 rounded-full bg-ink/10 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: durationMs / 1000, ease: "linear" }}
                className="h-full bg-honey rounded-full"
              />
            </div>

            {/* Tap to skip hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
              className="mt-4 text-xs font-semibold text-inksoft"
            >
              Tap anywhere to skip
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
