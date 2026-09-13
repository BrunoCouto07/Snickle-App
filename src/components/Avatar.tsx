import type { CustomWorld, Student } from "@/lib/app-types";
import { ACCESSORIES, DEFAULT_CUSTOM_WORLDS, THEMES } from "@/lib/defaults";

const RING: Record<string, string> = {
  sky: "bg-sky/25 border-sky/60 shadow-[0_0_0_2px_rgba(56,189,248,0.3)]",
  leaf: "bg-leaf/25 border-leaf/60 shadow-[0_0_0_2px_rgba(74,222,128,0.3)]",
  apricot: "bg-apricot/25 border-apricot/60 shadow-[0_0_0_2px_rgba(251,146,60,0.3)]",
  coral: "bg-coral/25 border-coral/60 shadow-[0_0_0_2px_rgba(248,113,113,0.3)]",
  honey: "bg-honey/25 border-honey/60 shadow-[0_0_0_2px_rgba(250,204,21,0.3)]",
};

export function Avatar({
  student,
  customWorlds,
  size = "md",
}: {
  student: Pick<Student, "theme" | "accessories"> &
    Partial<Pick<Student, "face" | "tint" | "photoUrl" | "customWorldId">>;
  customWorlds?: CustomWorld[];
  size?: "sm" | "md" | "lg";
}) {
  const worldsList = customWorlds ?? DEFAULT_CUSTOM_WORLDS;
  const customWorld = student.customWorldId
    ? worldsList.find((w) => w.id === student.customWorldId)
    : undefined;

  const theme = THEMES.find((t) => t.key === student.theme) ?? {
    key: "space" as const,
    emoji: "🚀",
    label: "Space",
    color: "sky",
  };

  const activeColor = customWorld?.color ?? student.tint ?? theme.color;
  const ring = RING[activeColor] ?? RING["sky"]!;
  const worldEmoji = customWorld?.emoji ?? theme.emoji;
  const worldLabel = customWorld?.label ?? theme.label;

  const dims =
    size === "lg" ? "size-28 text-6xl" : size === "sm" ? "size-10 text-xl" : "size-14 text-3xl";
  const badge = size === "lg" ? "text-2xl" : size === "sm" ? "text-[10px]" : "text-sm";
  const worldBadgeSize =
    size === "lg"
      ? "size-8 text-base -bottom-1 -left-1"
      : size === "sm"
        ? "size-4 text-[9px] -bottom-0.5 -left-0.5"
        : "size-6 text-xs -bottom-1 -left-1";

  return (
    <div className={`relative shrink-0 ${dims}`}>
      {/* Avatar Circle Frame */}
      <div
        className={`relative grid size-full place-items-center overflow-hidden rounded-full border-2 ${ring} ${
          dims.split(" ")[1] ?? ""
        }`}
      >
        {student.photoUrl ? (
          <img
            src={student.photoUrl}
            alt="Student avatar"
            className="size-full rounded-full object-cover"
          />
        ) : (
          <span aria-hidden>{student.face || theme.emoji}</span>
        )}
      </div>

      {/* Persistent World / Group Badge Indicator (Persists even when photo is uploaded) */}
      <div
        className={`absolute flex items-center justify-center rounded-full border-2 border-paper bg-card-warm shadow-xs ${worldBadgeSize}`}
        title={`World: ${worldLabel}`}
        aria-label={`World: ${worldLabel}`}
      >
        <span aria-hidden>{worldEmoji}</span>
      </div>

      {/* Accessories (Top right) */}
      <div className="absolute -top-1 -right-1 flex flex-col gap-0.5">
        {student.accessories.slice(0, 3).map((a) => (
          <span key={a} className={badge} aria-hidden>
            {ACCESSORIES.find((x) => x.id === a)?.emoji ?? a}
          </span>
        ))}
      </div>
    </div>
  );
}
