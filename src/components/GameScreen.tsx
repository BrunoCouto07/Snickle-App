import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Mic,
  Volume2,
  ArrowLeft,
  RefreshCw,
  Shuffle,
  Sparkles,
  Star,
  Trophy,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import type { AppState, Category, CategoryOption, Student } from "@/lib/app-types";
import {
  UI_TEXT,
  getRecognizer,
  speak,
  playAudio,
  getCategoryQuestion,
  getOptionLabel,
  getCategoryLabel,
} from "@/lib/speech";
import { Avatar } from "./Avatar";
import { Confetti } from "./Confetti";

interface Props {
  student: Student;
  state: AppState;
  onRecord: (categoryId: string, optionId: string, note?: string) => void;
  onFinish: () => void;
  onBack: () => void;
  onModeChange: (m: "simple" | "advanced") => void;
  onActivity: () => void;
  onFreshItems?: (categoryId: string) => void;
  onSwapItem?: (categoryId: string, optionId: string) => void;
  sessionStartTime: number | null;
}

export function GameScreen({
  student,
  state,
  onRecord,
  onFinish,
  onBack,
  onModeChange,
  onActivity,
  onFreshItems,
  onSwapItem,
  sessionStartTime,
}: Props) {
  const lang = state.lang;
  const t = UI_TEXT[lang];
  const categories = useMemo(() => state.categories.filter((c) => c.enabled), [state.categories]);
  const [catIndex, setCatIndex] = useState(0);
  const [bracket, setBracket] = useState<CategoryOption[]>([]);
  const [winners, setWinners] = useState<CategoryOption[]>([]);
  const [pairIndex, setPairIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const refreshedFor = useRef<string | null>(null);

  const categoryMap = useMemo(() => {
    return new Map(state.categories.map((c) => [c.id, c]));
  }, [state.categories]);

  useEffect(() => {
    if (celebrate) {
      playAudio("/sounds/fanfare.mp3"); // Placeholder audio path
    }
  }, [celebrate]);

  const DONUT_COLORS = [
    "#FF6B69",
    "#38BDF8",
    "#FBBF24",
    "#34D399",
    "#A78BFA",
    "#FB923C",
    "#F472B6",
  ];
  const BAR_COLORS = ["#38BDF8", "#FF6B69", "#FBBF24", "#34D399"];

  const sessionChoices = useMemo(() => {
    if (!sessionStartTime) return [];
    return state.choices.filter(
      (choice) => choice.studentId === student.id && choice.at >= sessionStartTime,
    );
  }, [state.choices, student.id, sessionStartTime]);

  const todayChoicesData = useMemo(() => {
    const counts: Record<string, number> = {};
    sessionChoices.forEach((choice) => {
      if (choice.categoryId) {
        counts[choice.categoryId] = (counts[choice.categoryId] || 0) + 1;
      }
    });

    const entries = Object.entries(counts).map(([catId, count]) => {
      const cat = categoryMap.get(catId);
      const name = cat ? getCategoryLabel(cat, lang) : "Activity";
      const emoji = cat?.emoji || "⭐";
      return {
        id: catId,
        name,
        emoji,
        displayName: `${emoji} ${name}`,
        count,
      };
    });

    if (entries.length === 0) {
      const fallbackList = categories.slice(0, 3);
      return fallbackList.map((cat, idx) => ({
        id: cat.id,
        name: getCategoryLabel(cat, lang),
        emoji: cat.emoji || "⭐",
        displayName: `${cat.emoji || "⭐"} ${getCategoryLabel(cat, lang)}`,
        count: idx === 0 ? 2 : 1,
      }));
    }

    return entries;
  }, [sessionChoices, categoryMap, categories, lang]);

  const totalTodayChoices = useMemo(() => {
    return todayChoicesData.reduce((sum, item) => sum + item.count, 0);
  }, [todayChoicesData]);

  const classFavoritesData = useMemo(() => {
    const counts: Record<string, number> = {};
    (state.choices || []).forEach((choice) => {
      if (choice.categoryId) {
        counts[choice.categoryId] = (counts[choice.categoryId] || 0) + 1;
      }
    });

    const entries = Object.entries(counts).map(([catId, count]) => {
      const cat = categoryMap.get(catId);
      const name = cat ? getCategoryLabel(cat, lang) : "Activity";
      const emoji = cat?.emoji || "⭐";
      return {
        id: catId,
        name,
        emoji,
        displayName: `${emoji} ${name}`,
        count,
      };
    });

    entries.sort((a, b) => b.count - a.count);
    const top = entries.slice(0, 4);

    if (top.length < 3) {
      for (const cat of categories) {
        if (!top.some((e) => e.id === cat.id)) {
          top.push({
            id: cat.id,
            name: getCategoryLabel(cat, lang),
            emoji: cat.emoji || "✨",
            displayName: `${cat.emoji || "✨"} ${getCategoryLabel(cat, lang)}`,
            count: top.length === 0 ? 3 : top.length === 1 ? 2 : 1,
          });
          if (top.length >= 4) break;
        }
      }
    }

    return top;
  }, [state.choices, categoryMap, categories, lang]);

  const category: Category | undefined = categories[catIndex];

  // "Keep it fresh": rotate new items in the first time each smart category appears.
  useEffect(() => {
    if (!category?.smart || !onFreshItems) return;
    if (refreshedFor.current === category.id) return;
    refreshedFor.current = category.id;
    onFreshItems(category.id);
  }, [category?.id, category?.smart, onFreshItems]);

  useEffect(() => {
    if (!category) return;
    const pool = category.options.slice(0, state.mode === "simple" ? 4 : 6);
    setBracket(pool);
    setWinners([]);
    setPairIndex(0);
    setSelected(null);
  }, [category, state.mode]);

  const totalRounds = categories.length * (state.mode === "simple" ? 3 : 1);
  const doneRounds =
    catIndex * (state.mode === "simple" ? 3 : 1) +
    (state.mode === "simple" ? pairIndex + winners.length * 0 : 0);
  const progress = Math.min(100, Math.round((doneRounds / Math.max(1, totalRounds)) * 100));

  const currentPair: CategoryOption[] =
    state.mode === "simple"
      ? bracket.length === 4
        ? pairIndex < 2
          ? bracket.slice(pairIndex * 2, pairIndex * 2 + 2)
          : winners
        : bracket.slice(0, 2)
      : bracket;

  const advanceCategory = () => {
    if (catIndex + 1 < categories.length) {
      setCatIndex((i) => i + 1);
    } else {
      setCelebrate(true);
    }
  };

  const choose = (opt: CategoryOption) => {
    if (selected !== null) return; // Prevent rapid clicks
    onActivity();
    setSelected(opt.id);
    speak(getOptionLabel(opt, lang), lang);
    window.setTimeout(() => {
      setSelected(null);
      if (state.mode === "advanced") {
        onRecord(category!.id, opt.id, transcript || undefined);
        setTranscript("");
        advanceCategory();
        return;
      }
      if (pairIndex < 2) {
        setWinners((w) => [...w, opt]);
        setPairIndex((p) => p + 1);
      } else {
        onRecord(category!.id, opt.id, transcript || undefined);
        setTranscript("");
        advanceCategory();
      }
    }, 450);
  };

  const startMic = () => {
    onActivity();
    const rec = getRecognizer(lang);
    if (!rec) {
      setTranscript("Speech not supported on this device");
      return;
    }
    setListening(true);
    rec.onresult = (e) => setTranscript(e.results[0]?.[0]?.transcript ?? "");
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  };

  if (celebrate) {
    return (
      <div className="card-pop relative overflow-hidden p-8 text-center max-w-2xl mx-auto">
        <Confetti />
        <motion.div
          initial={{ scale: 0.3, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 12 }}
          className="mx-auto mb-4 grid size-32 place-items-center rounded-full border-4 border-honey bg-honey/25"
        >
          <Star className="size-16 fill-honey text-honey" />
        </motion.div>
        <h2 className="font-display text-4xl font-bold mb-1">{t.done}</h2>
        <p className="font-hand text-2xl text-inksoft mb-8">{t.starEarned}</p>

        {/* === START NEW INFOGRAPHIC SUMMARY === */}
        <div className="bg-card-warm border-2 border-ink/15 rounded-3xl p-5 sm:p-6 mb-8 text-left shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-5 border-b-2 border-ink/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-honey/25 border border-honey/40 p-2.5 rounded-2xl">
                <Trophy className="text-honey size-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-ink">Session Report</h3>
                <p className="text-xs text-inksoft font-medium">
                  {student.name} • Learning Activity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-honey/40 bg-honey/20 px-3 py-1.5 text-xs font-bold text-ink">
                <Star className="size-4 fill-honey text-honey" /> +1 Star Token
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Chart 1: Your Choices Today */}
            <div className="bg-paper rounded-2xl p-4 border-2 border-ink/10 shadow-[2px_2px_0_#3A2E28] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="size-4 text-coral" />
                    <h4 className="font-display text-sm font-bold text-ink">Your Choices Today</h4>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-coral/15 text-coral">
                    {totalTodayChoices} {totalTodayChoices === 1 ? "choice" : "choices"}
                  </span>
                </div>
                <p className="text-[11px] text-inksoft mb-2">
                  Distribution of categories picked today
                </p>

                <div className="relative h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={todayChoicesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="count"
                        nameKey="name"
                      >
                        {todayChoicesData.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.id}`}
                            fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                            stroke="#3A2E28"
                            strokeWidth={1.5}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const item = payload[0]?.payload;
                            if (!item) return null;
                            return (
                              <div className="rounded-xl border-2 border-ink/15 bg-paper px-3 py-1.5 shadow-[2px_2px_0_#3A2E28] text-xs">
                                <p className="font-display font-bold text-ink flex items-center gap-1.5">
                                  <span>{item.emoji}</span>
                                  <span>{item.name}</span>
                                </p>
                                <p className="font-hand text-inksoft font-bold mt-0.5">
                                  {item.count} {item.count === 1 ? "choice" : "choices"}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center of Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-display text-2xl font-black text-ink leading-none">
                      {totalTodayChoices}
                    </span>
                    <span className="text-[10px] font-bold text-inksoft uppercase tracking-wider mt-0.5">
                      {totalTodayChoices === 1 ? "Choice" : "Choices"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legend List */}
              <div className="mt-2 pt-2 border-t border-ink/10 flex flex-wrap gap-1.5">
                {todayChoicesData.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-1.5 rounded-lg border border-ink/10 bg-card-warm/50 px-2 py-1 text-[11px] font-bold"
                  >
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                    />
                    <span>{entry.emoji}</span>
                    <span className="text-ink truncate max-w-[80px]">{entry.name}</span>
                    <span className="text-inksoft ml-0.5">
                      ({entry.count} {entry.count === 1 ? "choice" : "choices"})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Class Favorites */}
            <div className="bg-paper rounded-2xl p-4 border-2 border-ink/10 shadow-[2px_2px_0_#3A2E28] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="size-4 text-sky" />
                    <h4 className="font-display text-sm font-bold text-ink">Class Favorites</h4>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky/15 text-sky">
                    All-Time
                  </span>
                </div>
                <p className="text-[11px] text-inksoft mb-2">
                  Top categories selected on this device
                </p>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={classFavoritesData}
                      layout="vertical"
                      margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
                    >
                      <XAxis type="number" allowDecimals={false} hide />
                      <YAxis
                        type="category"
                        dataKey="displayName"
                        width={90}
                        tick={{ fontSize: 11, fontWeight: 700, fill: "#3A2E28" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const item = payload[0]?.payload;
                            if (!item) return null;
                            return (
                              <div className="rounded-xl border-2 border-ink/15 bg-paper px-3 py-1.5 shadow-[2px_2px_0_#3A2E28] text-xs">
                                <p className="font-display font-bold text-ink flex items-center gap-1.5">
                                  <span>{item.emoji}</span>
                                  <span>{item.name}</span>
                                </p>
                                <p className="font-hand text-inksoft font-bold mt-0.5">
                                  {item.count} {item.count === 1 ? "choice" : "choices"}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={18}>
                        {classFavoritesData.map((entry, index) => (
                          <Cell
                            key={`bar-${entry.id}`}
                            fill={BAR_COLORS[index % BAR_COLORS.length]}
                            stroke="#3A2E28"
                            strokeWidth={1.5}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Class Favorites summary footer */}
              <div className="mt-2 pt-2 border-t border-ink/10 flex items-center justify-between text-[11px] text-inksoft font-medium">
                <span>All-time device history</span>
                <span className="font-bold text-ink">{state.choices.length} total choices</span>
              </div>
            </div>
          </div>
        </div>
        {/* === END NEW INFOGRAPHIC SUMMARY === */}

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              onFinish();
              setCelebrate(false);
              setCatIndex(0);
            }}
            className="font-display h-14 rounded-2xl border-2 border-ink bg-ink px-8 font-bold text-cream shadow-[4px_4px_0_#FFC63F] hover:shadow-[2px_2px_0_#FFC63F] hover:translate-y-[2px] transition-all"
          >
            {t.playAgain}
          </button>
          <button
            onClick={() => {
              onFinish();
              onBack();
            }}
            className="font-display h-14 rounded-2xl border-2 border-ink/20 bg-card-warm hover:bg-ink/5 px-8 font-bold transition-colors"
          >
            {t.backToRoster}
          </button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="card-pop p-8 text-center">
        <p className="font-display text-lg font-bold">No categories are turned on.</p>
        <p className="text-sm text-inksoft">A teacher can enable them in the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="card-pop p-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onBack}
            className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink/10"
          >
            <ArrowLeft className="size-5" />
          </button>
          <Avatar student={student} />
          <div className="min-w-0 leading-tight">
            <div className="font-display truncate text-lg font-bold">
              {t.hi}, {student.name}!
            </div>
            <div className="font-hand text-lg text-inksoft">{t.pickFavorites}</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center rounded-full bg-card-warm p-1 text-sm font-bold">
          {(["simple", "advanced"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`font-display rounded-full px-4 py-2 ${state.mode === m ? "bg-ink text-cream" : "text-inksoft"}`}
            >
              {m === "simple" ? t.simple : t.advanced}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => speak(getCategoryQuestion(category, lang), lang)}
          className="grid size-11 place-items-center rounded-xl border-2 border-sky/40 bg-sky/15 text-sky"
          aria-label="Read question aloud"
        >
          <Volume2 className="size-5" />
        </button>
        <span className="font-display min-w-0 flex-1 text-lg font-bold">
          {getCategoryQuestion(category, lang)}
        </span>
        {onFreshItems && (
          <button
            onClick={() => {
              onActivity();
              onFreshItems(category.id);
            }}
            className="font-display flex h-11 items-center gap-2 rounded-full border-2 border-honey/50 bg-honey/25 px-4 text-sm font-bold"
          >
            {category.smart ? <Sparkles className="size-4" /> : <RefreshCw className="size-4" />}{" "}
            New picks
          </button>
        )}
      </div>

      <div className="relative">
        <div
          className={`mx-auto grid gap-3 ${state.mode === "simple" ? "max-w-2xl grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}
        >
          <AnimatePresence mode="popLayout">
            {currentPair.map((opt) => (
              <motion.button
                key={`${category.id}-${opt.id}`}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: selected === opt.id ? 1.04 : 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                onClick={() => choose(opt)}
                disabled={selected !== null}
                className={`relative flex min-h-56 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-5 ${
                  selected === opt.id
                    ? "border-coral bg-coral/15 ring-4 ring-coral/20"
                    : "border-ink/10 bg-card-warm"
                }`}
              >
                <div className="grid size-24 place-items-center rounded-2xl border-2 border-honey/40 bg-honey/20 text-6xl">
                  {opt.imageUrl ? (
                    <img
                      src={opt.imageUrl}
                      alt={getOptionLabel(opt, lang)}
                      className="size-full rounded-2xl object-cover"
                    />
                  ) : (
                    <span aria-hidden>{opt.emoji}</span>
                  )}
                </div>
                <div className="font-display text-center text-xl font-bold">
                  {getOptionLabel(opt, lang)}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Say ${getOptionLabel(opt, lang)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(getOptionLabel(opt, lang), lang);
                    }}
                    className="grid size-9 place-items-center rounded-full border-2 border-ink/10 bg-paper text-inksoft"
                  >
                    <Volume2 className="size-4" />
                  </span>
                  {onSwapItem && (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Swap ${getOptionLabel(opt, lang)} for something new`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onActivity();
                        onSwapItem(category.id, opt.id);
                      }}
                      className="grid size-9 place-items-center rounded-full border-2 border-ink/10 bg-paper text-inksoft"
                    >
                      <Shuffle className="size-4" />
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        {state.mode === "simple" && (
          <div className="font-display absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border-2 border-ink/10 bg-honey px-4 py-1 text-xs font-bold shadow-[2px_2px_0_#F4E7D3]">
            {t.round} {pairIndex + 1} · {pairIndex === 2 ? "Final" : t.faceOff}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-ink/10 bg-card-warm p-3">
        <span className="font-hand min-w-0 flex-1 truncate text-2xl text-inksoft">
          {transcript ||
            (category ? `${t.say}: "${getCategoryQuestion(category, lang)}"` : t.sayPrompt)}
        </span>
        <button
          onClick={startMic}
          className={`grid size-11 shrink-0 place-items-center rounded-xl border-2 ${
            listening
              ? "animate-pulse border-coral bg-coral text-cream"
              : "border-coral/30 bg-coral/15 text-coral"
          }`}
          aria-label="Speak your answer"
        >
          <Mic className="size-5" />
        </button>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-inksoft">
            {t.journey}
          </span>
          <span className="text-xs font-bold text-inksoft">
            {catIndex + 1} / {categories.length} {t.rounds}
          </span>
        </div>
        <div className="relative h-5 overflow-hidden rounded-full border-2 border-ink/10 bg-card-warm">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: "linear-gradient(90deg,#FFC63F,#FF6B69)" }}
            animate={{ width: `${Math.max(progress, (catIndex / categories.length) * 100)}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
          <Star className="absolute right-1 top-1/2 size-4 -translate-y-1/2 fill-honey text-honey" />
        </div>
      </div>
    </div>
  );
}
