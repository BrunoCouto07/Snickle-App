import type { CustomWorld, Student } from "@/lib/app-types";
import { ACCESSORIES, DEFAULT_CUSTOM_WORLDS, THEMES } from "@/lib/defaults";
import {
  DEFAULT_FRAME_ID,
  DEFAULT_BACKGROUND_ID,
  DEFAULT_ADORNMENT_ID,
  getStoreItem,
} from "@/lib/store-items";

const RING: Record<string, string> = {
  sky: "border-sky/60 shadow-[0_0_0_2px_rgba(56,189,248,0.3)]",
  leaf: "border-leaf/60 shadow-[0_0_0_2px_rgba(74,222,128,0.3)]",
  apricot: "border-apricot/60 shadow-[0_0_0_2px_rgba(251,146,60,0.3)]",
  coral: "border-coral/60 shadow-[0_0_0_2px_rgba(248,113,113,0.3)]",
  honey: "border-honey/60 shadow-[0_0_0_2px_rgba(250,204,21,0.3)]",
};

export function Avatar({
  student,
  customWorlds,
  size = "md",
}: {
  student: Pick<Student, "theme"> &
    Partial<
      Pick<
        Student,
        | "accessories"
        | "face"
        | "tint"
        | "photoUrl"
        | "customWorldId"
        | "activeFrame"
        | "activeBackground"
        | "activeAdornment"
      >
    >;
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
  const fallbackRing = RING[activeColor] ?? RING["sky"]!;
  const worldEmoji = customWorld?.emoji ?? theme.emoji;
  const worldLabel = customWorld?.label ?? theme.label;

  // Resolve store items (defaults to regular Bronze frame, Parchment background, Clean adornment)
  const frameId = student.activeFrame || DEFAULT_FRAME_ID;
  const bgId = student.activeBackground || DEFAULT_BACKGROUND_ID;
  const adornmentId = student.activeAdornment || DEFAULT_ADORNMENT_ID;

  const frameItem = getStoreItem(frameId);
  const bgItem = getStoreItem(bgId);
  const adornmentItem = getStoreItem(adornmentId);

  const dims =
    size === "lg" ? "size-28 text-6xl" : size === "sm" ? "size-10 text-xl" : "size-14 text-3xl";
  const badge = size === "lg" ? "text-2xl" : size === "sm" ? "text-[10px]" : "text-sm";
  const worldBadgeSize =
    size === "lg"
      ? "size-8 text-base -bottom-1 -left-1"
      : size === "sm"
        ? "size-4 text-[9px] -bottom-0.5 -left-0.5"
        : "size-6 text-xs -bottom-1 -left-1";

  // Dynamic adornment size & positioning
  const adornmentSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-xs" : "text-lg";

  const getAdornmentPosClass = (pos?: string) => {
    switch (pos) {
      case "top":
        return "-top-3 left-1/2 -translate-x-1/2";
      case "top-left":
        return "-top-1 -left-1";
      case "top-right":
      default:
        return "-top-1 -right-1";
    }
  };

  return (
    <div className={`relative shrink-0 select-none ${dims}`}>
      {/* Outer Layer: Avatar Frame Border & Glow */}
      <div
        className={`relative grid size-full place-items-center overflow-hidden rounded-full border-3 transition-all ${
          frameItem?.frameBorderClass ?? "border-[#965a29]"
        } ${frameItem?.frameShadowClass ?? fallbackRing} ${dims.split(" ")[1] ?? ""}`}
      >
        {/* Background Surface (From Star Store or Theme fallback) */}
        <div
          className={`absolute inset-0 size-full ${bgItem?.bgClass ?? "bg-[#fdf6ec]"}`}
          style={bgItem?.bgStyle}
        />

        {/* Character Face / Avatar Photo */}
        <div className="relative z-10 grid size-full place-items-center">
          {student.photoUrl ? (
            <img
              src={student.photoUrl}
              alt="Student avatar"
              className="size-full rounded-full object-cover"
            />
          ) : (
            <span aria-hidden className="select-none drop-shadow-xs">
              {student.face || theme.emoji}
            </span>
          )}
        </div>
      </div>

      {/* Frame Gem / Adornment (Anchor to frame rim) */}
      {adornmentItem?.adornmentEmoji && (
        <div
          className={`absolute z-20 flex items-center justify-center pointer-events-none drop-shadow-md ${adornmentSize} ${getAdornmentPosClass(
            adornmentItem.adornmentPosition,
          )}`}
          title={adornmentItem.name}
          aria-hidden
        >
          {adornmentItem.adornmentEmoji}
        </div>
      )}

      {/* Persistent World / Group Badge Indicator */}
      <div
        className={`absolute z-20 flex items-center justify-center rounded-full border-2 border-paper bg-card-warm shadow-xs ${worldBadgeSize}`}
        title={`World: ${worldLabel}`}
        aria-label={`World: ${worldLabel}`}
      >
        <span aria-hidden>{worldEmoji}</span>
      </div>

      {/* Legacy Accessories (Fallback if student has legacy accessory items) */}
      {student.accessories && student.accessories.length > 0 && !adornmentItem?.adornmentEmoji && (
        <div className="absolute z-20 -top-1 -right-1 flex flex-col gap-0.5">
          {student.accessories.slice(0, 2).map((a) => (
            <span key={a} className={badge} aria-hidden>
              {ACCESSORIES.find((x) => x.id === a)?.emoji ?? a}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
