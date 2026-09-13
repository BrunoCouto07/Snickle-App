import { motion } from "motion/react";

const COLORS = ["#FFC63F", "#FF6B69", "#6FBF8C", "#6EB4D8", "#FF9E5B"];

export function Confetti({ count = 40 }: { count?: number }) {
  const pieces = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i * 37) % 100,
    delay: (i % 10) * 0.06,
    color: COLORS[i % COLORS.length],
    rotate: (i * 47) % 360,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: 520, opacity: [0, 1, 1, 0], rotate: p.rotate }}
          transition={{ duration: 2.4, delay: p.delay, ease: "easeIn", repeat: Infinity }}
          style={{ left: `${p.x}%`, backgroundColor: p.color }}
          className="absolute top-0 size-2.5 rounded-[2px]"
        />
      ))}
    </div>
  );
}
