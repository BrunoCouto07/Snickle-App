import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Palette, Plus, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { AppState, CustomWorld, Student } from "@/lib/app-types";
import { DEFAULT_CUSTOM_WORLDS, THEMES } from "@/lib/defaults";
import { UI_TEXT } from "@/lib/speech";
import { getClassSubtitle } from "@/lib/class-info";
import { Avatar } from "./Avatar";

type ColumnOption = 2 | 3 | 4;

const GRID_CLASSES: Record<ColumnOption, string> = {
  2: "grid grid-cols-1 sm:grid-cols-2 gap-3.5",
  3: "grid grid-cols-2 sm:grid-cols-3 gap-3.5",
  4: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5",
};

export function StudentRoster({
  state,
  onSelect,
  onAdd,
  onEditStudent,
  onOpenStore,
}: {
  state: AppState;
  onSelect: (s: Student) => void;
  onAdd: () => void;
  onEditStudent?: (s: Student) => void;
  onOpenStore?: (s: Student) => void;
}) {
  const t = UI_TEXT[state.lang];
  const [columns, setColumns] = useState<ColumnOption>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("snickle_roster_cols");
      if (saved === "2" || saved === "3" || saved === "4") {
        return Number(saved) as ColumnOption;
      }
    }
    return 4;
  });

  const changeColumns = (col: ColumnOption) => {
    setColumns(col);
    try {
      localStorage.setItem("snickle_roster_cols", String(col));
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <div className="card-pop p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink/10 pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold">{t.whoPlaying}</h2>
          <p className="font-hand text-lg text-inksoft">{getClassSubtitle(state)}</p>
        </div>

        {/* Dynamic Column Toggle */}
        <div className="flex items-center gap-1.5 rounded-2xl border-2 border-ink/10 bg-paper p-1 shadow-sm">
          <span className="hidden px-2 text-xs font-bold text-inksoft sm:inline">Grid:</span>
          {([2, 3, 4] as const).map((c) => (
            <button
              key={c}
              onClick={() => changeColumns(c)}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                columns === c
                  ? "border border-ink/15 bg-honey text-ink shadow-[2px_2px_0_#3A2E28]"
                  : "text-inksoft hover:bg-cream hover:text-ink"
              }`}
              title={`${c} Columns`}
              aria-label={`Switch to ${c} columns`}
            >
              {c} cols
            </button>
          ))}
        </div>
      </div>

      <div className={GRID_CLASSES[columns]}>
        {state.students.map((s) => (
          <StudentCard
            key={s.id}
            student={s}
            customWorlds={state.customWorlds}
            onSelect={onSelect}
            onEdit={onEditStudent}
            onOpenStore={onOpenStore}
          />
        ))}

        <button
          onClick={onAdd}
          className="grid min-h-44 place-items-center rounded-2xl border-2 border-dashed border-ink/25 p-4 text-inksoft transition-colors hover:border-ink/50 hover:bg-paper/40"
        >
          <span className="grid size-14 place-items-center rounded-full bg-card-warm shadow-sm">
            <Plus className="size-6" />
          </span>
          <span className="font-display mt-2 font-bold">{t.addStudent}</span>
        </button>
      </div>
    </div>
  );
}

function StudentCard({
  student,
  customWorlds,
  onSelect,
  onEdit,
  onOpenStore,
}: {
  student: Student;
  customWorlds?: CustomWorld[];
  onSelect: (s: Student) => void;
  onEdit?: (s: Student) => void;
  onOpenStore?: (s: Student) => void;
}) {
  const [showQuickAction, setShowQuickAction] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerStartPos = useRef<{ x: number; y: number } | null>(null);
  const suppressClickUntil = useRef<number>(0);

  const worldsList = customWorlds ?? DEFAULT_CUSTOM_WORLDS;
  const currentWorld = student.customWorldId
    ? worldsList.find((w) => w.id === student.customWorldId)
    : undefined;
  const worldLabel = currentWorld?.label ?? THEMES.find((x) => x.key === student.theme)?.label;

  const triggerShowMenu = () => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    setShowQuickAction(true);
    // Menu persists for 5 seconds once it displays
    persistTimer.current = setTimeout(() => {
      setShowQuickAction(false);
      persistTimer.current = null;
    }, 5000);
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    // Hover activation for mouse pointers
    if (e.pointerType === "mouse") {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(() => {
        triggerShowMenu();
      }, 650);
    }
  };

  const handlePointerLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // Notice: quick action stays visible for its 5s persist duration
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartPos.current = { x: e.clientX, y: e.clientY };
    if (longPressTimer.current) clearTimeout(longPressTimer.current);

    // 450ms long-tap detection
    longPressTimer.current = setTimeout(() => {
      suppressClickUntil.current = Date.now() + 800;
      triggerShowMenu();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(40);
        } catch {
          // Ignore vibration failure
        }
      }
    }, 450);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartPos.current) return;
    const dx = e.clientX - pointerStartPos.current.x;
    const dy = e.clientY - pointerStartPos.current.y;
    // Cancel long tap if user is dragging/scrolling (moved > 10px)
    if (Math.hypot(dx, dy) > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleCardClick = () => {
    // If long tap just triggered, suppress card click so the user can click edit or store
    if (Date.now() < suppressClickUntil.current) {
      return;
    }
    onSelect(student);
  };

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      if (persistTimer.current) clearTimeout(persistTimer.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -3 }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={handleCardClick}
      onContextMenu={(e) => {
        if (showQuickAction || Date.now() < suppressClickUntil.current) {
          e.preventDefault();
        }
      }}
      className="group relative grid cursor-pointer place-items-center rounded-2xl border-2 border-ink/10 bg-card-warm p-4 select-none transition-shadow hover:shadow-md"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(student);
        }
      }}
    >
      {/* 5-Second Persistent Hover & Long-Tap Quick Action Menu (Store + Edit) */}
      <AnimatePresence>
        {showQuickAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 right-2 z-30 flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            {/* Quick Star Store Button */}
            {onOpenStore && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickAction(false);
                  if (persistTimer.current) clearTimeout(persistTimer.current);
                  onOpenStore(student);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                className="flex items-center gap-1 rounded-full border-2 border-ink bg-honey px-2.5 py-1 text-xs font-black text-ink shadow-[2px_2px_0_#3A2E28] hover:bg-honey/85 active:scale-95 transition-all cursor-pointer"
                title="Star Token Store"
                aria-label={`Open Star Store for ${student.name}`}
              >
                <Star className="size-3.5 fill-ink text-ink" />
                <span>Store</span>
              </button>
            )}

            {/* Quick Edit Avatar Button */}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickAction(false);
                  if (persistTimer.current) clearTimeout(persistTimer.current);
                  onEdit(student);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                className="flex items-center gap-1 rounded-full border-2 border-ink bg-paper px-2.5 py-1 text-xs font-bold text-ink shadow-[2px_2px_0_#3A2E28] hover:bg-honey active:scale-95 transition-all cursor-pointer"
                title="Customize Student Avatar"
                aria-label={`Customize avatar for ${student.name}`}
              >
                <Palette className="size-3 text-coral shrink-0" />
                <span>Edit</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Avatar student={student} customWorlds={customWorlds} size="lg" />
      <span className="font-display mt-2 truncate max-w-full text-lg font-bold">
        {student.name}
      </span>

      {/* World Tag & Interactive Star Token Counter */}
      <div className="flex items-center justify-between w-full mt-1.5 px-1">
        <span className="text-xs font-bold text-inksoft truncate max-w-[90px]">{worldLabel}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenStore?.(student);
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-ink/15 bg-paper hover:bg-honey text-xs font-black text-ink shadow-[1px_1px_0_#3A2E28] transition-all cursor-pointer"
          title="Open Star Token Store"
        >
          <Star className="size-3 fill-honey text-honey" />
          <span>{student.stars}</span>
        </button>
      </div>
    </motion.div>
  );
}
