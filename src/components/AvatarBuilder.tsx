import { useState } from "react";
import { motion } from "motion/react";
import { Camera, Check, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import type { CustomWorld, Student, ThemeKey } from "@/lib/app-types";
import { ACCESSORIES, COLOR_FILTERS, DEFAULT_CUSTOM_WORLDS, THEMES } from "@/lib/defaults";
import { AVATAR_FACES } from "@/lib/picture-library";
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
}: {
  initial?: Student;
  customWorlds?: CustomWorld[];
  onAddCustomWorld?: (w: CustomWorld) => void;
  onSave: (s: Omit<Student, "id" | "stars">) => void;
  onCancel: () => void;
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

  const save = () => {
    const base: Omit<Student, "id" | "stars"> = {
      name: name.trim(),
      theme,
      accessories,
      ...(face ? { face } : {}),
      ...(tint ? { tint } : {}),
      ...(customWorldId ? { customWorldId } : {}),
      ...(photoUrl ? { photoUrl } : {}),
    };
    onSave(base);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="card-pop max-h-[92vh] w-full max-w-lg overflow-y-auto p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">
            {initial ? "Edit avatar & world" : "Make your avatar"}
          </h2>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="grid size-11 place-items-center rounded-full border-2 border-ink/10 hover:bg-card-warm"
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
            {/* Quick photo trigger under name */}
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingPhoto(true)}
                className="flex items-center gap-1 rounded-lg border border-ink/15 bg-card-warm px-2.5 py-1 text-xs font-bold text-ink hover:bg-honey transition-colors"
              >
                <Camera className="size-3.5 text-coral" />
                <span>{photoUrl ? "Edit Photo" : "Add Student Photo"}</span>
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl("")}
                  className="flex items-center gap-1 rounded-lg border border-ink/15 bg-card-warm px-2 py-1 text-xs font-bold text-coral hover:bg-coral/15 transition-colors"
                  title="Remove student photo"
                >
                  <Trash2 className="size-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Photo COPPA/FERPA Compliance Reminder if photo exists or upload button clicked */}
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-leaf/30 bg-leaf/10 p-2.5 text-xs text-leaf">
          <ShieldCheck className="size-4 shrink-0" />
          <span>Photos stay 100% on this local device (COPPA & FERPA compliant).</span>
        </div>

        {/* Group / World Selection & Custom World Creation */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-display text-sm font-bold uppercase text-inksoft">
              Class World / Group Frame
            </p>
            <button
              type="button"
              onClick={() => setCreatingWorld(!creatingWorld)}
              className="flex items-center gap-1 text-xs font-bold text-honey hover:underline"
            >
              <Plus className="size-3.5" />
              <span>{creatingWorld ? "Cancel New Group" : "+ Custom Group"}</span>
            </button>
          </div>

          {creatingWorld && (
            <div className="mb-3 space-y-2.5 rounded-2xl border-2 border-honey/40 bg-honey/10 p-3">
              <p className="font-display text-xs font-bold uppercase text-ink">
                Create New World / Team
              </p>
              <div className="flex gap-2">
                <input
                  value={newWorldEmoji}
                  onChange={(e) => setNewWorldEmoji(e.target.value.slice(0, 2))}
                  className="size-10 rounded-xl border border-ink/20 bg-paper text-center text-xl outline-none"
                  placeholder="🚀"
                  title="Team Emoji"
                />
                <input
                  value={newWorldName}
                  onChange={(e) => setNewWorldName(e.target.value)}
                  placeholder="Group Name (e.g. Star Voyagers)"
                  className="h-10 flex-1 rounded-xl border border-ink/20 bg-paper px-3 text-sm outline-none focus:border-honey"
                />
                <button
                  type="button"
                  onClick={handleCreateWorld}
                  disabled={!newWorldName.trim()}
                  className="rounded-xl border border-ink bg-ink px-3 text-xs font-bold text-cream disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {allWorlds.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  setCustomWorldId(w.id);
                  // also sync fallback theme
                  const matchingTheme = THEMES.find(
                    (t) => t.label.toLowerCase() === w.label.toLowerCase(),
                  );
                  if (matchingTheme) setTheme(matchingTheme.key);
                }}
                className={`grid aspect-square place-items-center rounded-2xl border-2 p-1 text-center transition-all ${
                  customWorldId === w.id
                    ? "border-honey bg-honey/20 shadow-[2px_2px_0_#3A2E28]"
                    : "border-ink/10 bg-card-warm hover:border-ink/25"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {w.emoji}
                </span>
                <span className="font-display truncate max-w-full text-[10px] font-bold">
                  {w.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Character Face (used when no photo uploaded) */}
        {!photoUrl && (
          <>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-display text-sm font-bold uppercase text-inksoft">
                Character Face (When no photo)
              </p>
              {face && (
                <button onClick={() => setFace("")} className="text-xs font-bold text-coral">
                  Use world emoji
                </button>
              )}
            </div>
            <div className="mb-4 grid max-h-36 grid-cols-8 gap-2 overflow-y-auto rounded-2xl border-2 border-ink/10 bg-card-warm p-2">
              {AVATAR_FACES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFace(f.emoji)}
                  title={f.labels.en}
                  className={`grid aspect-square place-items-center rounded-xl border-2 text-2xl ${
                    face === f.emoji ? "border-coral bg-coral/15" : "border-transparent bg-paper"
                  }`}
                >
                  <span aria-hidden>{f.emoji}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Badge Frame Color */}
        <p className="font-display mb-2 text-sm font-bold uppercase text-inksoft">Frame Color</p>
        <div className="mb-4 flex gap-2">
          {COLOR_FILTERS.map((c) => (
            <button
              key={c}
              onClick={() => setTint(tint === c ? "" : c)}
              aria-label={`${c} color`}
              className={`size-10 rounded-full border-2 ${TINT_DOT[c]} ${
                tint === c ? "border-ink ring-2 ring-ink/30" : "border-ink/10"
              }`}
            />
          ))}
        </div>

        {/* Accessories */}
        <p className="font-display mb-2 text-sm font-bold uppercase text-inksoft">
          Add up to 3 accessories
        </p>
        <div className="mb-5 grid grid-cols-6 gap-2">
          {ACCESSORIES.map((a) => (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              title={a.label}
              className={`grid aspect-square place-items-center rounded-2xl border-2 text-2xl ${
                accessories.includes(a.id)
                  ? "border-coral bg-coral/15"
                  : "border-ink/10 bg-card-warm"
              }`}
            >
              <span aria-hidden>{a.emoji}</span>
            </button>
          ))}
        </div>

        <button
          disabled={!name.trim()}
          onClick={save}
          className="font-display flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-ink text-lg font-bold text-cream shadow-[3px_3px_0_#FFC63F] disabled:opacity-40 hover:opacity-95"
        >
          <Check className="size-5" /> Save Avatar & Frame
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
