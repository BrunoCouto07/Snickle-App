import { motion } from "motion/react";
import { Timer } from "lucide-react";

export function InactivityModal({
  seconds,
  title,
  subtitle,
  onStay,
}: {
  seconds: number;
  title: string;
  subtitle: string;
  onStay: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onClick={onStay}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card-pop w-full max-w-sm p-6 text-center"
      >
        <div className="relative mx-auto mb-4 grid size-28 place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#FCEFD9" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#FF6B69"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={276}
              strokeDashoffset={276 * (1 - seconds / 30)}
            />
          </svg>
          <span className="font-display text-4xl font-bold">{seconds}</span>
        </div>
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <p className="font-hand mt-1 text-2xl text-inksoft">{subtitle}</p>
        <button
          onClick={onStay}
          className="font-display mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-ink text-lg font-bold text-cream shadow-[3px_3px_0_#FFC63F]"
        >
          <Timer className="size-5" /> I'm still here
        </button>
      </motion.div>
    </div>
  );
}
