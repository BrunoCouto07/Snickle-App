import { useState } from "react";
import { motion } from "motion/react";
import { Camera, Check, Plus, ShieldCheck, Sparkles, Star, Trash2, X, Gift } from "lucide-react";
import type { CustomWorld, Student, ThemeKey } from "@/lib/app-types";
import { ACCESSORIES, COLOR_FILTERS, DEFAULT_CUSTOM_WORLDS, THEMES } from "@/lib/defaults";
import { AVATAR_FACES } from "@/lib/picture-library";
import {
  DEFAULT_ADORNMENT_ID,
  DEFAULT_BACKGROUND_ID,
  DEFAULT_FRAME_ID,
  STARTER_UNLOCKED_ITEMS,
  STORE_ITEMS,
  getStoreItem,
} from "@/lib/store-items";
import { Avatar } from "./Avatar";
import { LocalPhotoEditor } from "./LocalPhotoEditor";

const TINT_DOT: Record<string, string> = {
  honey: "bg-honey",
  coral: "bg-coral",
  leaf: "bg-leaf",
  sky: "bg-sky",
  apricot: "bg-apricot",
};

export function AvatarBuilder({
  initial,
  customWorlds,
  onAddCustomWorld,
  onSave,
  onCancel,
  onOpenStore,
  onAdjustStars,
}: {
  initial?: Student;
  customWorlds?: CustomWorld[];
  onAddCustomWorld?: (w: CustomWorld) => void;
  onSave: (s: Omit<Student, "id">) => void;
  onCancel: () => void;
  onOpenStore?: () => void;
  onAdjustStars?: (delta: number) => void;
}) {
  const allWorlds = customWorlds ?? DEFAULT_CUSTOM_WORLDS;
  const [name, setName] = useState(initial?.name ?? "");
  const [theme, setTheme] = useState<ThemeKey>(initial?.theme ?? "space");
  const [customWorldId, setCustomWorldId] = useState<string>(
    initial?.customWorldId ?? allWorlds[0]?.id ?? "",
  );
  const [accessories, setAccessories] = useState<string[]>(initial?.accessories ?? []);
  const [face, setFace] = useState<string>(initial?.face ?? "");
  const [tint, setTint] = useState<string>(initial?.tint ?? "");
  const [photoUrl, setPhotoUrl] = useState<string>(initial?.photoUrl ?? "");
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [creatingWorld, setCreatingWorld] = useState(false);
  const [newWorldName, setNewWorldName] = useState("");
  const [newWorldEmoji, setNewWorldEmoji] = useState("🌟");
  const [newWorldColor, setNewWorldColor] = useState("honey");

  // Store items
  const [activeFrame, setActiveFrame] = useState<string>(initial?.activeFrame || DEFAULT_FRAME_ID);
  const [activeBackground, setActiveBackground] = useState<string>(
    initial?.activeBackground || DEFAULT_BACKGROUND_ID,
  );
  const [activeAdornment, setActiveAdornment] = useState<string>(
    initial?.activeAdornment || DEFAULT_ADORNMENT_ID,
  );
  const [unlockedItems] = useState<string[]>(initial?.unlockedItems || STARTER_UNLOCKED_ITEMS);
  const [stars, setStars] = useState<number>(initial?.stars ?? 0);

  const toggle = (id: string) =>
    setAccessories((a) =>
      a.includes(id) ? a.filter((x) => x !== id) : a.length >= 3 ? a : [...a, id],
    );

  const handleCreateWorld = () => {
    if (!newWorldName.trim()) return;
    const newWorld: CustomWorld = {
      id: `world-${Date.now()}`,
      label: newWorldName.trim(),
      emoji: newWorldEmoji || "🌟",
      color: newWorldColor,
      frameStyle: "stars",
    };
    onAddCustomWorld?.(newWorld);
    setCustomWorldId(newWorld.id);
    setCreatingWorld(false);
    setNewWorldName("");
  };

  const handleAdjustStars = (delta: number) => {
    const next = Math.max(0, stars + delta);
    setStars(next);
    onAdjustStars?.(delta);
  };

  const save = () => {
    const base: Omit<Student, "id"> = {
      name: name.trim(),
      theme,
      accessories,
      stars,
      activeFrame,
      activeBackground,
      activeAdornment,
      unlockedItems,
      ...(face ? { face } : {}),
      ...(tint ? { tint } : {}),
      ...(customWorldId ? { customWorldId } : {}),
      ...(photoUrl ? { photoUrl } : {}),
    };
    onSave(base);
  };

  // Filter unlocked items for easy equipping
  const unlockedFrames = STORE_ITEMS.filter(
    (i) => i.category === "frame" && unlockedItems.includes(i.id),
  );
  const unlockedBackgrounds = STORE_ITEMS.filter(
    (i) => i.category === "background" && unlockedItems.includes(i.id),
  );
  const unlockedAdornments = STORE_ITEMS.filter(
    (i) => i.category === "adornment" && unlockedItems.includes(i.id),
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="card-pop my-auto max-h-[92vh] w-full max-w-lg overflow-y-auto p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">
            {initial ? "Edit avatar & style" : "Make your avatar"}
          </h2>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="grid size-11 place-items-center rounded-full border-2 border-ink/10 hover:bg-card-warm cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Live Avatar Preview and Name */}
        <div className="mb-4 flex items-center gap-4 rounded-2xl border-2 border-ink/10 bg-paper p-3">
          <Avatar
            student={{
              theme,
              accessories,
              activeFrame,
              activeBackground,
              activeAdornment,
              ...(face ? { face } : {}),
              ...(tint ? { tint } : {}),
              ...(customWorldId ? { customWorldId } : {}),
              ...(photoUrl ? { photoUrl } : {}),
            }}
            customWorlds={allWorlds}
            size="lg"
          />
          <div className="flex-1">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Student name"
              className="font-display h-12 w-full rounded-xl border-2 border-ink/10 bg-card-warm px-3 text-lg outline-none focus:border-honey"
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingPhoto(true)}
                className="flex items-center gap-1.5 rounded-lg border border-ink/20 bg-cream px-2.5 py-1 text-xs font-bold text-ink hover:bg-honey transition-colors cursor-pointer"
              >
                <Camera className="size-3.5" />
                {photoUrl ? "Change Photo" : "Upload Photo"}
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl("")}
                  className="flex items-center gap-1 rounded-lg border border-coral/30 bg-coral/10 px-2 py-1 text-xs font-bold text-coral hover:bg-coral/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="size-3" />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Star Token & Star Store Banner */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-honey/40 bg-honey/15 p-3">
          <div className="flex items-center gap-2">
            <Star className="size-5 fill-honey text-honey animate-pulse" />
            <div>
              <p className="font-display font-black text-sm text-ink">{stars} Star Tokens</p>
              <p className="text-[11px] font-semibold text-inksoft">Collect frames, bgs & gems</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Teacher +/- Quick Adjust */}
            <div className="flex items-center gap-1 bg-paper/80 border border-ink/15 rounded-xl px-1.5 py-0.5">
              <span className="text-[10px] font-bold text-inksoft">Teacher:</span>
              <button
                type="button"
                onClick={() => handleAdjustStars(-1)}
                disabled={stars <= 0}
                className="size-6 grid place-items-center rounded bg-card-warm font-bold text-xs hover:bg-honey disabled:opacity-30 cursor-pointer"
                title="Subtract 1 star"
              >
                -1
              </button>
              <button
                type="button"
                onClick={() => handleAdjustStars(1)}
                className="size-6 grid place-items-center rounded bg-card-warm font-bold text-xs hover:bg-honey cursor-pointer"
                title="Add 1 star"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => handleAdjustStars(5)}
                className="size-6 grid place-items-center rounded bg-card-warm font-bold text-xs hover:bg-honey cursor-pointer"
                title="Add 5 stars"
              >
                +5
              </button>
            </div>

            {onOpenStore && (
              <button
                type="button"
                onClick={onOpenStore}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-ink/20 bg-honey text-ink font-bold text-xs shadow-[2px_2px_0_#3A2E28] hover:bg-honey/85 transition-all cursor-pointer"
              >
                <Sparkles className="size-3.5" />
                <span>Star Store</span>
              </button>
            )}
          </div>
        </div>

        {/* Unlocked Avatar Frames */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-inksoft">
              Unlocked Frames ({unlockedFrames.length})
            </p>
            {onOpenStore && (
              <button
                type="button"
                onClick={onOpenStore}
                className="text-[11px] font-bold text-coral hover:underline cursor-pointer"
              >
                + More in Store
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {unlockedFrames.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFrame(f.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                  activeFrame === f.id
                    ? "border-coral bg-coral/15 text-ink shadow-[2px_2px_0_#FF6B69]"
                    : "border-ink/10 bg-card-warm hover:bg-paper"
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Unlocked Backgrounds */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-inksoft">
              Unlocked Backgrounds ({unlockedBackgrounds.length})
            </p>
            {onOpenStore && (
              <button
                type="button"
                onClick={onOpenStore}
                className="text-[11px] font-bold text-coral hover:underline cursor-pointer"
              >
                + More in Store
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {unlockedBackgrounds.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setActiveBackground(b.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                  activeBackground === b.id
                    ? "border-coral bg-coral/15 text-ink shadow-[2px_2px_0_#FF6B69]"
                    : "border-ink/10 bg-card-warm hover:bg-paper"
                }`}
              >
                <span>{b.icon}</span>
                <span>{b.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Unlocked Gems / Adornments */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-inksoft">
              Unlocked Gems & Crests ({unlockedAdornments.length})
            </p>
            {onOpenStore && (
              <button
                type="button"
                onClick={onOpenStore}
                className="text-[11px] font-bold text-coral hover:underline cursor-pointer"
              >
                + More in Store
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {unlockedAdornments.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setActiveAdornment(a.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                  activeAdornment === a.id
                    ? "border-coral bg-coral/15 text-ink shadow-[2px_2px_0_#FF6B69]"
                    : "border-ink/10 bg-card-warm hover:bg-paper"
                }`}
              >
                <span>{a.icon}</span>
                <span>{a.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* World / Team Selection */}
        <p className="font-display mb-2 text-sm font-bold uppercase text-inksoft">
          Class World / Group
        </p>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {allWorlds.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setCustomWorldId(w.id)}
              className={`flex items-center gap-2 rounded-xl border-2 p-2.5 text-left text-sm font-bold transition-all cursor-pointer ${
                customWorldId === w.id
                  ? "border-ink bg-honey text-ink shadow-[2px_2px_0_#3A2E28]"
                  : "border-ink/10 bg-card-warm hover:bg-paper"
              }`}
            >
              <span className="text-xl" aria-hidden>
                {w.emoji}
              </span>
              <span className="truncate">{w.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCreatingWorld(true)}
            className="flex items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink/20 p-2 text-xs font-bold text-inksoft hover:border-ink hover:text-ink cursor-pointer"
          >
            <Plus className="size-4" /> New Group
          </button>
        </div>

        {/* Character Faces */}
        {!photoUrl && (
          <>
            <p className="font-display mb-2 text-sm font-bold uppercase text-inksoft">
              Or pick an emoji character
            </p>
            <div className="mb-4 flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-xl border-2 border-ink/10 bg-card-warm p-2">
              {AVATAR_FACES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFace(f.emoji)}
                  title={f.label}
                  className={`grid size-10 place-items-center rounded-xl border-2 text-2xl cursor-pointer ${
                    face === f.emoji ? "border-coral bg-coral/15" : "border-transparent bg-paper"
                  }`}
                >
                  <span aria-hidden>{f.emoji}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <button
          disabled={!name.trim()}
          onClick={save}
          className="font-display mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-ink text-lg font-bold text-cream shadow-[3px_3px_0_#FFC63F] disabled:opacity-40 hover:opacity-95 cursor-pointer"
        >
          <Check className="size-5" /> Save Avatar & Style
        </button>
      </motion.div>

      {/* Local Photo Editor Modal */}
      {editingPhoto && (
        <LocalPhotoEditor
          initialPhotoUrl={photoUrl}
          onSave={(dataUrl) => {
            setPhotoUrl(dataUrl);
            setEditingPhoto(false);
          }}
          onCancel={() => setEditingPhoto(false)}
        />
      )}
    </div>
  );
}
