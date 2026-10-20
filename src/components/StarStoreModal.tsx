import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Gift,
  Lock,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Star,
  X,
  ShieldAlert,
} from "lucide-react";
import type { CustomWorld, Student } from "@/lib/app-types";
import {
  DEFAULT_ADORNMENT_ID,
  DEFAULT_BACKGROUND_ID,
  DEFAULT_FRAME_ID,
  STARTER_UNLOCKED_ITEMS,
  STORE_ITEMS,
  STORE_TIERS,
  type StoreCategory,
  type StoreItem,
} from "@/lib/store-items";
import { Avatar } from "./Avatar";
import { playAudio, speak } from "@/lib/speech";

interface Props {
  student: Student;
  customWorlds?: CustomWorld[];
  teacherPin: string;
  onUpdateStudent: (updated: Student) => void;
  onClose: () => void;
}

export function StarStoreModal({
  student,
  customWorlds,
  teacherPin,
  onUpdateStudent,
  onClose,
}: Props) {
  const [activeTab, setActiveTab] = useState<StoreCategory>("frame");
  const [tierFilter, setTierFilter] = useState<string>("all");

  // Track preview state
  const [previewFrame, setPreviewFrame] = useState<string>(student.activeFrame || DEFAULT_FRAME_ID);
  const [previewBg, setPreviewBg] = useState<string>(
    student.activeBackground || DEFAULT_BACKGROUND_ID,
  );
  const [previewAdornment, setPreviewAdornment] = useState<string>(
    student.activeAdornment || DEFAULT_ADORNMENT_ID,
  );

  // Success / celebration toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Teacher Gift PIN Bypass Modal state
  const [giftTargetItem, setGiftTargetItem] = useState<StoreItem | null>(null);
  const [mathA, setMathA] = useState(() => Math.floor(Math.random() * 6) + 4);
  const [mathB, setMathB] = useState(() => Math.floor(Math.random() * 6) + 3);
  const [mathAnswer, setMathAnswer] = useState<string>("");
  const [mathError, setMathError] = useState(false);
  const [gateStep, setGateStep] = useState<"math" | "pin">("math");
  const [pinEntry, setPinEntry] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);

  // Teacher quick star adjustment drawer/state
  const [showTeacherStarAdjust, setShowTeacherStarAdjust] = useState(false);

  const unlocked = useMemo(() => {
    return new Set(student.unlockedItems || STARTER_UNLOCKED_ITEMS);
  }, [student.unlockedItems]);

  const categoryItems = useMemo(() => {
    return STORE_ITEMS.filter((item) => {
      if (item.category !== activeTab) return false;
      if (tierFilter !== "all" && item.tier !== tierFilter) return false;
      return true;
    });
  }, [activeTab, tierFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const resetPreview = () => {
    setPreviewFrame(student.activeFrame || DEFAULT_FRAME_ID);
    setPreviewBg(student.activeBackground || DEFAULT_BACKGROUND_ID);
    setPreviewAdornment(student.activeAdornment || DEFAULT_ADORNMENT_ID);
  };

  const isPreviewingDifferent =
    previewFrame !== (student.activeFrame || DEFAULT_FRAME_ID) ||
    previewBg !== (student.activeBackground || DEFAULT_BACKGROUND_ID) ||
    previewAdornment !== (student.activeAdornment || DEFAULT_ADORNMENT_ID);

  // Purchase item using stars
  const handlePurchase = (item: StoreItem) => {
    if (student.stars < item.cost) return;

    const newUnlocked = Array.from(
      new Set([...(student.unlockedItems || STARTER_UNLOCKED_ITEMS), item.id]),
    );
    const updated: Student = {
      ...student,
      stars: student.stars - item.cost,
      unlockedItems: newUnlocked,
      // Automatically equip newly bought item
      ...(item.category === "frame" ? { activeFrame: item.id } : {}),
      ...(item.category === "background" ? { activeBackground: item.id } : {}),
      ...(item.category === "adornment" ? { activeAdornment: item.id } : {}),
    };

    if (item.category === "frame") setPreviewFrame(item.id);
    if (item.category === "background") setPreviewBg(item.id);
    if (item.category === "adornment") setPreviewAdornment(item.id);

    onUpdateStudent(updated);
    playAudio("/sounds/star.mp3");
    speak(`Unlocked ${item.name}!`, "en");
    showToast(`⭐ Unlocked and equipped ${item.name}!`);
  };

  // Equip already owned item
  const handleEquip = (item: StoreItem) => {
    const updated: Student = {
      ...student,
      ...(item.category === "frame" ? { activeFrame: item.id } : {}),
      ...(item.category === "background" ? { activeBackground: item.id } : {}),
      ...(item.category === "adornment" ? { activeAdornment: item.id } : {}),
    };

    if (item.category === "frame") setPreviewFrame(item.id);
    if (item.category === "background") setPreviewBg(item.id);
    if (item.category === "adornment") setPreviewAdornment(item.id);

    onUpdateStudent(updated);
    showToast(`✓ Equipped ${item.name}`);
  };

  // Preview an item on avatar
  const handleItemClick = (item: StoreItem) => {
    if (item.category === "frame") setPreviewFrame(item.id);
    if (item.category === "background") setPreviewBg(item.id);
    if (item.category === "adornment") setPreviewAdornment(item.id);
  };

  // Start Teacher Gift Bypass flow
  const startTeacherGift = (item: StoreItem) => {
    setGiftTargetItem(item);
    setMathA(Math.floor(Math.random() * 6) + 4);
    setMathB(Math.floor(Math.random() * 6) + 3);
    setMathAnswer("");
    setMathError(false);
    setGateStep("math");
    setPinEntry("");
    setPinError(null);
  };

  const submitMathGate = () => {
    if (parseInt(mathAnswer.trim(), 10) === mathA * mathB) {
      setMathError(false);
      setGateStep("pin");
    } else {
      setMathError(true);
      setMathAnswer("");
    }
  };

  const submitPinGate = () => {
    if (pinEntry === teacherPin) {
      if (giftTargetItem) {
        const newUnlocked = Array.from(
          new Set([...(student.unlockedItems || STARTER_UNLOCKED_ITEMS), giftTargetItem.id]),
        );
        const updated: Student = {
          ...student,
          unlockedItems: newUnlocked,
          ...(giftTargetItem.category === "frame" ? { activeFrame: giftTargetItem.id } : {}),
          ...(giftTargetItem.category === "background"
            ? { activeBackground: giftTargetItem.id }
            : {}),
          ...(giftTargetItem.category === "adornment"
            ? { activeAdornment: giftTargetItem.id }
            : {}),
        };

        if (giftTargetItem.category === "frame") setPreviewFrame(giftTargetItem.id);
        if (giftTargetItem.category === "background") setPreviewBg(giftTargetItem.id);
        if (giftTargetItem.category === "adornment") setPreviewAdornment(giftTargetItem.id);

        onUpdateStudent(updated);
        showToast(`🎁 Teacher gifted ${giftTargetItem.name}!`);
      }
      setGiftTargetItem(null);
    } else {
      setPinError("Incorrect PIN");
      setPinEntry("");
    }
  };

  // Manual Star Adjustment
  const adjustStars = (delta: number) => {
    const newCount = Math.max(0, student.stars + delta);
    onUpdateStudent({ ...student, stars: newCount });
    showToast(`${delta > 0 ? `+${delta}` : delta} Star Tokens (${newCount} total)`);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="card-pop my-auto w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden bg-cream border-2 border-ink shadow-2xl rounded-3xl"
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-ink/10 bg-card-warm/80 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl border-2 border-honey/40 bg-honey text-ink shadow-[2px_2px_0_#3A2E28]">
              <Sparkles className="size-6" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                Star Token Store
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-inksoft">
                Customize <span className="text-ink font-bold">{student.name}</span> with frames,
                bgs & gems
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Star Token Balance Pill */}
            <div className="flex items-center gap-1.5 rounded-full border-2 border-ink/15 bg-paper px-3 py-1.5 shadow-[2px_2px_0_#3A2E28]">
              <Star className="size-4 sm:size-5 fill-honey text-honey animate-pulse" />
              <span className="font-display font-black text-sm sm:text-base text-ink">
                {student.stars}
              </span>
              <span className="text-xs font-bold text-inksoft hidden sm:inline">Stars</span>
            </div>

            {/* Teacher Manual Star Modifier Button */}
            <button
              onClick={() => setShowTeacherStarAdjust(!showTeacherStarAdjust)}
              className="flex items-center gap-1 rounded-full border-2 border-leaf/40 bg-leaf/15 px-2.5 py-1.5 text-xs font-bold text-leaf hover:bg-leaf/25 transition-colors cursor-pointer"
              title="Teacher: Modify Star Tokens"
            >
              <Gift className="size-3.5" />
              <span className="hidden sm:inline">Teacher +/-</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close Star Store"
              className="grid size-10 place-items-center rounded-full border-2 border-ink/10 bg-paper hover:bg-card-warm transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Teacher Quick Star Adjustment Strip */}
        <AnimatePresence>
          {showTeacherStarAdjust && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b-2 border-leaf/20 bg-leaf/10 px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-bold text-leaf overflow-hidden"
            >
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="size-4" />
                Teacher Controls: Add or remove stars for {student.name}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => adjustStars(-1)}
                  disabled={student.stars <= 0}
                  className="px-2.5 py-1 rounded-lg bg-paper border border-ink/15 text-ink hover:bg-honey transition-colors disabled:opacity-40 cursor-pointer"
                >
                  -1
                </button>
                <button
                  onClick={() => adjustStars(1)}
                  className="px-2.5 py-1 rounded-lg bg-paper border border-ink/15 text-ink hover:bg-honey transition-colors cursor-pointer"
                >
                  +1 ★
                </button>
                <button
                  onClick={() => adjustStars(5)}
                  className="px-2.5 py-1 rounded-lg bg-paper border border-ink/15 text-ink hover:bg-honey transition-colors cursor-pointer"
                >
                  +5 ★
                </button>
                <button
                  onClick={() => adjustStars(10)}
                  className="px-2.5 py-1 rounded-lg bg-paper border border-ink/15 text-ink hover:bg-honey transition-colors cursor-pointer"
                >
                  +10 ★
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-honey text-ink font-bold text-xs sm:text-sm px-4 py-2 text-center border-b-2 border-ink/20"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Body: Left Live Preview + Right Store Catalog */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] flex-1 overflow-hidden">
          {/* Left Column: Live Avatar Preview Stage */}
          <div className="border-b-2 md:border-b-0 md:border-r-2 border-ink/10 bg-paper/50 p-4 sm:p-5 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-inksoft uppercase tracking-wider mb-3">
              Live Avatar Preview
            </span>

            <div className="my-2 p-2">
              <Avatar
                student={{
                  ...student,
                  activeFrame: previewFrame,
                  activeBackground: previewBg,
                  activeAdornment: previewAdornment,
                }}
                customWorlds={customWorlds}
                size="lg"
              />
            </div>

            <div className="font-display font-bold text-lg text-ink mt-2">{student.name}</div>

            {/* Currently previewed breakdown */}
            <div className="w-full mt-3 rounded-2xl border border-ink/10 bg-card-warm/50 p-2.5 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-inksoft font-medium">Frame:</span>
                <span className="font-bold text-ink truncate max-w-[140px]">
                  {STORE_ITEMS.find((x) => x.id === previewFrame)?.name || "Bronze Rim"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-inksoft font-medium">Background:</span>
                <span className="font-bold text-ink truncate max-w-[140px]">
                  {STORE_ITEMS.find((x) => x.id === previewBg)?.name || "Parchment"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-inksoft font-medium">Gem / Crest:</span>
                <span className="font-bold text-ink truncate max-w-[140px]">
                  {STORE_ITEMS.find((x) => x.id === previewAdornment)?.name || "Clean (None)"}
                </span>
              </div>
            </div>

            {isPreviewingDifferent && (
              <button
                onClick={resetPreview}
                className="mt-3 flex items-center gap-1.5 text-xs font-bold text-inksoft hover:text-ink transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3" />
                Reset Preview
              </button>
            )}
          </div>

          {/* Right Column: Store Category Tabs & Grid */}
          <div className="flex flex-col flex-1 overflow-hidden p-4 sm:p-5">
            {/* Category Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b-2 border-ink/10 pb-3">
              <div className="flex items-center gap-1.5 rounded-2xl border-2 border-ink/10 bg-paper p-1 shadow-sm">
                {(
                  [
                    { key: "frame", label: "Frames", icon: "🖼️", count: 14 },
                    { key: "background", label: "Backgrounds", icon: "🎨", count: 14 },
                    { key: "adornment", label: "Gems & Crests", icon: "💎", count: 14 },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setTierFilter("all");
                    }}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      activeTab === tab.key
                        ? "border border-ink/15 bg-honey text-ink shadow-[2px_2px_0_#3A2E28]"
                        : "text-inksoft hover:bg-cream hover:text-ink"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span className="text-[11px] opacity-75 font-mono">({tab.count})</span>
                  </button>
                ))}
              </div>

              {/* Tier Filter Buttons */}
              <div className="flex items-center gap-1 text-xs">
                {["all", "common", "rare", "epic", "elite"].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tier)}
                    className={`rounded-lg px-2 py-1 text-xs font-bold capitalize transition-colors cursor-pointer ${
                      tierFilter === tier ? "bg-ink text-cream" : "text-inksoft hover:bg-paper"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Store Items Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoryItems.map((item) => {
                const isOwned = unlocked.has(item.id);
                const isEquipped =
                  (item.category === "frame" &&
                    (student.activeFrame || DEFAULT_FRAME_ID) === item.id) ||
                  (item.category === "background" &&
                    (student.activeBackground || DEFAULT_BACKGROUND_ID) === item.id) ||
                  (item.category === "adornment" &&
                    (student.activeAdornment || DEFAULT_ADORNMENT_ID) === item.id);
                const isPreviewed =
                  (item.category === "frame" && previewFrame === item.id) ||
                  (item.category === "background" && previewBg === item.id) ||
                  (item.category === "adornment" && previewAdornment === item.id);
                const canAfford = student.stars >= item.cost;
                const tierMeta = STORE_TIERS[item.tier];

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`relative flex flex-col justify-between rounded-2xl border-2 p-3.5 transition-all cursor-pointer select-none ${
                      isPreviewed
                        ? "border-coral bg-coral/10 shadow-[2px_2px_0_#FF6B69]"
                        : isEquipped
                          ? "border-leaf bg-leaf/10 shadow-[2px_2px_0_#6FBF8C]"
                          : "border-ink/10 bg-paper hover:border-ink/30 hover:shadow-sm"
                    }`}
                  >
                    {/* Item Top Info */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <h4 className="font-display font-bold text-sm text-ink leading-tight">
                              {item.name}
                            </h4>
                            <span
                              className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold border mt-0.5 ${tierMeta.badgeClass}`}
                            >
                              {tierMeta.label}
                            </span>
                          </div>
                        </div>

                        {/* Cost Display */}
                        <div className="shrink-0 flex items-center gap-1 font-display font-black text-xs text-ink bg-card-warm px-2 py-0.5 rounded-full border border-ink/10">
                          {item.cost === 0 ? (
                            <span className="text-leaf">Free</span>
                          ) : (
                            <>
                              <Star className="size-3 fill-honey text-honey" />
                              <span>{item.cost}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-inksoft leading-snug line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="mt-3 pt-2.5 border-t border-ink/10 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-inksoft">
                        {isPreviewed && !isEquipped ? "👀 Previewing" : ""}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isEquipped ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-leaf text-cream font-bold text-xs shadow-xs">
                            <Check className="size-3.5" /> Equipped
                          </span>
                        ) : isOwned ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEquip(item);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-ink text-cream font-bold text-xs hover:bg-ink/80 transition-colors shadow-xs cursor-pointer"
                          >
                            Equip
                          </button>
                        ) : (
                          <>
                            {canAfford ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePurchase(item);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-honey text-ink border border-ink/20 font-bold text-xs hover:bg-honey/80 transition-colors shadow-[2px_2px_0_#3A2E28] cursor-pointer"
                              >
                                <Star className="size-3 fill-ink text-ink" />
                                Unlock ({item.cost} ★)
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] font-bold text-inksoft px-1.5 py-0.5">
                                  Need {item.cost - student.stars} more ★
                                </span>
                              </div>
                            )}

                            {/* Teacher Gift PIN Bypass option */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startTeacherGift(item);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-paper border border-leaf/40 text-leaf font-bold text-[11px] hover:bg-leaf/15 transition-colors cursor-pointer"
                              title="Teacher Gift with PIN"
                            >
                              <Gift className="size-3" />
                              <span>Teacher Gift</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Teacher Gift / PIN Bypass Modal */}
      <AnimatePresence>
        {giftTargetItem && (
          <div className="fixed inset-0 z-60 grid place-items-center bg-ink/60 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-pop w-full max-w-sm p-5 bg-paper rounded-3xl border-2 border-ink shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-ink/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-leaf/20 text-leaf">
                    <Gift className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-ink">
                      Teacher Gift Bypass
                    </h3>
                    <p className="text-xs text-inksoft">Gift &ldquo;{giftTargetItem.name}&rdquo;</p>
                  </div>
                </div>
                <button
                  onClick={() => setGiftTargetItem(null)}
                  className="grid size-8 place-items-center rounded-full hover:bg-card-warm text-inksoft"
                >
                  <X className="size-4" />
                </button>
              </div>

              {gateStep === "math" ? (
                <div>
                  <p className="text-xs font-semibold text-inksoft mb-2">
                    Step 1 of 2: Answer the math problem to confirm you are the teacher:
                  </p>
                  <div className="font-display text-2xl font-bold text-center text-ink bg-card-warm p-4 rounded-2xl border-2 border-ink/10 mb-3">
                    {mathA} × {mathB} = ?
                  </div>
                  <input
                    type="number"
                    value={mathAnswer}
                    onChange={(e) => setMathAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitMathGate()}
                    placeholder="Enter answer"
                    autoFocus
                    className="w-full h-11 px-3 text-center text-lg font-bold rounded-xl border-2 border-ink/15 bg-paper mb-2 outline-none focus:border-leaf"
                  />
                  {mathError && (
                    <p className="text-xs text-coral font-bold text-center mb-2">
                      Incorrect math answer. Please try again.
                    </p>
                  )}
                  <button
                    onClick={submitMathGate}
                    disabled={!mathAnswer.trim()}
                    className="w-full h-11 font-display font-bold rounded-xl bg-leaf text-cream border-2 border-ink/20 hover:bg-leaf/90 transition-colors disabled:opacity-40"
                  >
                    Continue to PIN
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-inksoft mb-2">
                    Step 2 of 2: Enter teacher PIN to gift item without star cost:
                  </p>
                  <input
                    type="password"
                    maxLength={6}
                    value={pinEntry}
                    onChange={(e) => setPinEntry(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitPinGate()}
                    placeholder="Enter PIN (e.g. 1234)"
                    autoFocus
                    className="w-full h-11 px-3 text-center tracking-widest text-xl font-bold rounded-xl border-2 border-ink/15 bg-paper mb-2 outline-none focus:border-leaf"
                  />
                  {pinError && (
                    <p className="text-xs text-coral font-bold text-center mb-2">{pinError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGateStep("math")}
                      className="flex-1 h-11 font-display font-bold rounded-xl border-2 border-ink/15 bg-card-warm text-ink text-xs hover:bg-ink/5"
                    >
                      Back
                    </button>
                    <button
                      onClick={submitPinGate}
                      disabled={!pinEntry.trim()}
                      className="flex-1 h-11 font-display font-bold rounded-xl bg-leaf text-cream border-2 border-ink/20 hover:bg-leaf/90 transition-colors disabled:opacity-40"
                    >
                      Gift Item!
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
