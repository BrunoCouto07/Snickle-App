import { useMemo, useRef, useState } from "react";
import {
  Cloud,
  Download,
  FileUp,
  HelpCircle,
  Heart,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  Plus,
  Printer,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import type {
  AppState,
  Category,
  CategoryOption,
  CustomWorld,
  Student,
  UiTheme,
} from "@/lib/app-types";
import { COLOR_FILTERS, DEFAULT_CUSTOM_WORLDS, THEMES } from "@/lib/defaults";
import { UI_THEMES } from "@/lib/themes";
import { freshFromLibrary } from "@/lib/item-library";
import { generateSmartItems } from "@/lib/smart.functions";
import { getClassSubtitle } from "@/lib/class-info";
import { exportAppState } from "@/lib/backup";
import { getCategoryLabel, getOptionLabel } from "@/lib/speech";
import { Avatar } from "./Avatar";
import { AvatarBuilder } from "./AvatarBuilder";
import { PicturePicker, type PickedPicture } from "./PicturePicker";
import { GroupsPrintable, PosterPrintable, PrintableCards } from "./Printables";
import { CATEGORY_SUGGESTIONS } from "@/lib/category-suggestions";
import { SyncBackupModal } from "./SyncBackupModal";
import { OnboardingModal } from "./OnboardingModal";
import { SupportTeacherModal } from "./SupportTeacherModal";
import { ContactModal } from "./ContactModal";
import { FeatureCoachmarks } from "./FeatureCoachmarks";
import { resetAllCoachmarks, type CoachmarkScreen } from "@/lib/coachmarks";

const BAR_COLORS = ["bg-coral", "bg-sky", "bg-honey", "bg-leaf", "bg-apricot", "bg-ink"];

type Tab = "insights" | "roster" | "categories" | "settings";

export function AdminDashboard({
  state,
  update,
  syncing,
  onExit,
}: {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  syncing: boolean;
  onExit: () => void;
}) {
  const [tab, setTab] = useState<Tab>("insights");
  const [printCards, setPrintCards] = useState(false);
  const [printGroups, setPrintGroups] = useState(false);
  const [posterFor, setPosterFor] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newName, setNewName] = useState("");
  const [newId, setNewId] = useState("");
  const [newCat, setNewCat] = useState("");
  const [bulk, setBulk] = useState("");
  const [groupBy, setGroupBy] = useState<string>(state.categories.find((c) => c.enabled)?.id ?? "");
  const [picking, setPicking] = useState<{ catId: string; optId: string } | null>(null);
  const [busyCat, setBusyCat] = useState<string | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [hintResetSuccess, setHintResetSuccess] = useState(false);
  const [creatingCatWithAi, setCreatingCatWithAi] = useState(false);
  const [newWorldLabel, setNewWorldLabel] = useState("");
  const [newWorldEmoji, setNewWorldEmoji] = useState("🚀");
  const [newWorldColor, setNewWorldColor] = useState("#3B82F6");
  const csvRef = useRef<HTMLInputElement>(null);
  const lang = state.lang;

  const createCategoryWithChoices = async (name: string, withAi: boolean) => {
    if (!name.trim()) return;
    setCreatingCatWithAi(true);
    setAiNote(null);

    let seed = freshFromLibrary(
      {
        id: "tmp",
        enabled: true,
        labels: { en: name, es: name, ar: name },
        question: { en: "", es: "", ar: "" },
        options: [],
      },
      4,
    );

    if (withAi) {
      try {
        const res = await generateSmartItems({
          data: {
            category: name,
            avoid: [],
            count: 4,
          },
        });
        if (res.items && res.items.length > 0) {
          const aiOptions: CategoryOption[] = res.items.map((it, idx) => ({
            id: `ai-${Date.now()}-${idx}`,
            emoji: it.emoji,
            labels: { en: it.en, es: it.es, ar: it.ar },
            smart: true,
          }));
          seed = [...aiOptions, ...seed].slice(0, 4);
          setAiNote(`✨ Created "${name}" with 4 smart choices!`);
        } else {
          setAiNote(`Loaded "${name}" with choices from the picture library.`);
        }
      } catch {
        setAiNote(`Loaded "${name}" with choices from the picture library.`);
      }
    }

    const cat: Category = {
      id: `cat-${Date.now()}`,
      enabled: true,
      smart: true,
      pool: name.toLowerCase(),
      usedOptionIds: [],
      labels: { en: name, es: name, ar: name },
      question: {
        en: `Which ${name} do you like?`,
        es: `¿Qué ${name} te gusta?`,
        ar: `أي ${name} تحب؟`,
      },
      options:
        seed.length >= 4
          ? seed
          : ["A", "B", "C", "D"].map((k, i) => ({
              id: `opt-${i}`,
              emoji: ["🟠", "🟢", "🔵", "🟣"][i] ?? "⭐",
              labels: { en: `${name} ${k}`, es: `${name} ${k}`, ar: `${name} ${k}` },
            })),
    };
    update((s) => ({ ...s, categories: [...s.categories, cat] }));
    setNewCat("");
    setCreatingCatWithAi(false);
  };

  const filteredSuggestions = useMemo(() => {
    if (!newCat) return [];
    const query = newCat.toLowerCase();
    return CATEGORY_SUGGESTIONS.filter(
      (s) => s.name.toLowerCase().includes(query) || s.keywords.some((k) => k.includes(query)),
    ).slice(0, 4); // Limit to 4 visible items
  }, [newCat]);

  const patchCategory = (catId: string, fn: (c: Category) => Category) =>
    update((s) => ({ ...s, categories: s.categories.map((c) => (c.id === catId ? fn(c) : c)) }));

  const distributions = useMemo(
    () =>
      state.categories
        .filter((c) => c.enabled)
        .map((cat) => {
          const rows = state.choices.filter((c) => c.categoryId === cat.id);
          const items = cat.options
            .map((o) => ({ option: o, count: rows.filter((r) => r.optionId === o.id).length }))
            .sort((a, b) => b.count - a.count);
          const top = items[0]?.count ?? 0;
          const second = items[1]?.count ?? 0;
          return {
            cat,
            total: rows.length,
            items,
            split: rows.length ? Math.abs(top - second) / rows.length : 1,
          };
        }),
    [state.categories, state.choices],
  );

  const participation = useMemo(() => {
    const played = new Set(state.choices.map((c) => c.studentId));
    return { played: played.size, total: state.students.length };
  }, [state.choices, state.students]);

  const mostDivided = useMemo(
    () => [...distributions].filter((d) => d.total > 0).sort((a, b) => a.split - b.split)[0],
    [distributions],
  );

  const groups = useMemo(() => {
    const primary =
      state.categories.find((c) => c.id === groupBy) ?? state.categories.find((c) => c.enabled);
    if (!primary) return [];
    const buckets = new Map<string, Student[]>();
    for (const s of state.students) {
      const last = [...state.choices]
        .reverse()
        .find((c) => c.studentId === s.id && c.categoryId === primary.id);
      const key = last?.optionId ?? "unsorted";
      buckets.set(key, [...(buckets.get(key) ?? []), s]);
    }
    const out: { label: string; emoji: string; members: Student[] }[] = [];
    for (const [key, members] of buckets) {
      const opt = primary.options.find((o) => o.id === key);
      for (let i = 0; i < members.length; i += 4) {
        out.push({
          label: opt ? `${opt.labels[lang]} crew` : "Not surveyed yet",
          emoji: opt?.emoji ?? "❔",
          members: members.slice(i, i + 4),
        });
      }
    }
    return out;
  }, [state.students, state.choices, state.categories, groupBy, lang]);

  const addStudents = (rows: { name: string; id?: string }[]) =>
    update((s) => ({
      ...s,
      students: [
        ...s.students,
        ...rows.map((r, i) => ({
          id: r.id?.trim() || `ST-${Date.now()}-${i}`,
          name: r.name,
          theme: "space" as const,
          accessories: [],
          stars: 0,
        })),
      ],
    }));

  const importCsv = async (file: File) => {
    const text = await file.text();
    const rows = text
      .split(/\r?\n/)
      .map((r) => r.split(",").map((c) => c.trim()))
      .filter((r) => r[0] && r[0].toLowerCase() !== "name")
      .map((r) => ({ name: r[0] ?? "Student", ...(r[1] ? { id: r[1] } : {}) }));
    addStudents(rows);
  };

  const applyBulk = () => {
    const rows = bulk
      .split(/\r?\n/)
      .map((line) => line.split(",").map((c) => c.trim()))
      .filter((r) => r[0])
      .map((r) => ({ name: r[0] as string, ...(r[1] ? { id: r[1] } : {}) }));
    if (rows.length) addStudents(rows);
    setBulk("");
  };

  /** Fresh items: built-in library first, AI top-up when online. */
  const refreshItems = async (cat: Category) => {
    setBusyCat(cat.id);
    setAiNote(null);
    const wanted = Math.min(3, cat.options.length);
    const local = freshFromLibrary(cat, wanted);
    let extras: CategoryOption[] = local;
    try {
      const res = await generateSmartItems({
        data: {
          category: cat.labels.en,
          avoid: cat.options.map((o) => o.labels.en).concat(local.map((o) => o.labels.en)),
          count: Math.max(1, wanted - local.length) || 1,
        },
      });
      if (res.error) setAiNote(res.error);
      const aiItems: CategoryOption[] = res.items.map((i, n) => ({
        id: `ai-${Date.now()}-${n}`,
        emoji: i.emoji,
        labels: { en: i.en, es: i.es, ar: i.ar },
        smart: true,
      }));
      extras = [...local, ...aiItems].slice(0, wanted);
    } catch {
      setAiNote("Offline — used the built-in picture library.");
    }
    if (extras.length) {
      patchCategory(cat.id, (c) => ({
        ...c,
        options: [...c.options.slice(extras.length), ...extras],
        usedOptionIds: [
          ...new Set([...(c.usedOptionIds ?? []), ...c.options.map((o) => o.id)]),
        ].slice(-120),
      }));
    } else {
      setAiNote("No new items left in this pool yet.");
    }
    setBusyCat(null);
  };

  const applyPicture = (p: PickedPicture) => {
    if (!picking) return;
    patchCategory(picking.catId, (c) => ({
      ...c,
      options: c.options.map((o) =>
        o.id !== picking.optId
          ? o
          : {
              ...o,
              ...(p.emoji ? { emoji: p.emoji } : {}),
              ...(p.imageUrl ? { imageUrl: p.imageUrl } : {}),
              ...(p.labels ? { labels: p.labels } : {}),
            },
      ),
    }));
    setPicking(null);
  };

  return (
    <div className="card-pop p-5">
      <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="font-display truncate text-2xl font-bold">Teacher Dashboard</h2>
          <p className="font-hand text-xl text-inksoft">{getClassSubtitle(state)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setShowSyncModal(true)}
            title="Classroom Sync & Backup status. Click to download or restore backup."
            className="flex items-center gap-1.5 rounded-full border-2 border-leaf/40 bg-leaf/15 px-3 py-1.5 text-xs font-bold text-leaf hover:bg-leaf/25 transition-colors cursor-pointer"
          >
            <Cloud className={`size-4 ${syncing ? "animate-pulse" : ""}`} />{" "}
            <span>{syncing ? "Saving" : "Offline Synced"}</span>
          </button>
          <button
            onClick={() => setShowOnboarding(true)}
            aria-label="Walkthrough Guide"
            title="Classroom Guide & Walkthrough"
            className="grid size-11 place-items-center rounded-full border-2 border-ink/10 bg-paper text-ink hover:bg-card-warm transition-colors"
          >
            <HelpCircle className="size-5" />
          </button>
          <button
            onClick={onExit}
            className="font-display flex h-11 items-center gap-2 rounded-full border-2 border-ink bg-ink px-4 font-bold text-cream"
          >
            <LogOut className="size-4" /> Exit
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(["insights", "roster", "categories", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-display h-11 rounded-full px-5 font-bold capitalize ${
              tab === t ? "bg-ink text-cream" : "border-2 border-ink/10 bg-card-warm text-inksoft"
            }`}
          >
            {t}
          </button>
        ))}
        <button
          onClick={() => setShowSyncModal(true)}
          className="font-display ml-auto flex h-11 items-center gap-2 rounded-full border-2 border-sky/40 bg-sky/20 px-4 font-bold text-sky hover:bg-sky/30 transition-colors"
        >
          <Download className="size-4" /> Backup & Sync
        </button>
        <button
          onClick={() => setPrintCards(true)}
          className="font-display flex h-11 items-center gap-2 rounded-full border-2 border-honey/50 bg-honey/25 px-5 font-bold"
        >
          <Printer className="size-4" /> Printable cards
        </button>
      </div>

      {aiNote && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border-2 border-sky/30 bg-sky/10 p-3 text-sm font-bold text-sky">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 shrink-0" />
            <span>{aiNote}</span>
          </div>
          <button
            onClick={() => setAiNote(null)}
            className="rounded-full border border-sky/30 px-2.5 py-0.5 text-xs font-bold hover:bg-sky/20"
          >
            Dismiss
          </button>
        </div>
      )}

      {tab === "insights" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border-2 border-ink/10 bg-card-warm p-4 lg:col-span-2">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat
                label="Students surveyed"
                value={`${participation.played} / ${participation.total}`}
              />
              <Stat label="Choices recorded" value={String(state.choices.length)} />
              <Stat
                label="Most divided question"
                value={mostDivided ? getCategoryLabel(mostDivided.cat, lang) : "Not enough data"}
              />
            </div>
          </div>

          {distributions.map(({ cat, total, items }) => (
            <div key={cat.id} className="rounded-2xl border-2 border-ink/10 bg-card-warm p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display font-bold">{getCategoryLabel(cat, lang)}</p>
                <span className="text-xs font-bold text-inksoft">{total} answers</span>
              </div>
              <div className="space-y-2">
                {items.map((it, i) => {
                  const pct = total ? Math.round((it.count / total) * 100) : 0;
                  return (
                    <div key={it.option.id}>
                      <div className="mb-1 flex justify-between text-xs font-bold">
                        <span>
                          {it.option.emoji} {getOptionLabel(it.option, lang)}
                        </span>
                        <span>
                          {pct}% · {it.count}
                        </span>
                      </div>
                      <div className="h-3 rounded-full border border-ink/10 bg-paper">
                        <div
                          className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="rounded-2xl border-2 border-ink/10 bg-card-warm p-4 lg:col-span-2">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <p className="font-display flex items-center gap-2 font-bold">
                <Users className="size-4" /> Automated group builder
              </p>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="font-display ml-auto h-11 rounded-2xl border-2 border-ink/10 bg-paper px-3 font-bold"
              >
                {state.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.labels[lang]}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setPrintGroups(true)}
                className="font-display flex h-11 items-center gap-2 rounded-2xl border-2 border-honey/50 bg-honey/25 px-4 font-bold"
              >
                <Printer className="size-4" /> Print groups
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {groups.map((g, i) => (
                <div
                  key={`${g.label}-${i}`}
                  className="flex items-center gap-3 rounded-2xl border-2 border-leaf/30 bg-leaf/10 p-2"
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <div className="flex -space-x-2">
                    {g.members.map((m) => (
                      <span key={m.id} className="rounded-full bg-paper">
                        <Avatar student={m} size="sm" customWorlds={state.customWorlds} />
                      </span>
                    ))}
                  </div>
                  <span className="font-display ml-auto truncate text-sm font-bold">{g.label}</span>
                </div>
              ))}
              {groups.length === 0 && (
                <p className="text-sm text-inksoft">Run a game to build groups.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "roster" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Student name"
              className="h-12 min-w-40 flex-1 rounded-2xl border-2 border-ink/10 bg-card-warm px-4 outline-none focus:border-honey"
            />
            <input
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="Student ID"
              className="h-12 w-40 rounded-2xl border-2 border-ink/10 bg-card-warm px-4 outline-none focus:border-honey"
            />
            <button
              disabled={!newName.trim()}
              onClick={() => {
                addStudents([
                  { name: newName.trim(), ...(newId.trim() ? { id: newId.trim() } : {}) },
                ]);
                setNewName("");
                setNewId("");
              }}
              className="font-display flex h-12 items-center gap-2 rounded-2xl border-2 border-ink bg-ink px-5 font-bold text-cream disabled:opacity-40"
            >
              <Plus className="size-4" /> Add
            </button>
            <button
              onClick={() => csvRef.current?.click()}
              className="font-display flex h-12 items-center gap-2 rounded-2xl border-2 border-honey/50 bg-honey/25 px-5 font-bold"
            >
              <FileUp className="size-4" /> CSV upload
            </button>
            <input
              ref={csvRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])}
            />
          </div>

          <div className="rounded-2xl border-2 border-ink/10 bg-card-warm p-4">
            <p className="font-display mb-2 text-sm font-bold uppercase text-inksoft">
              Paste a whole class
            </p>
            <textarea
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              rows={4}
              placeholder={"One student per line:\nTheo, ST-001\nAmara"}
              className="w-full rounded-2xl border-2 border-ink/10 bg-paper p-3 outline-none focus:border-honey"
            />
            <button
              onClick={applyBulk}
              disabled={!bulk.trim()}
              className="font-display mt-2 h-12 rounded-2xl border-2 border-ink bg-ink px-5 font-bold text-cream disabled:opacity-40"
            >
              Add all
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border-2 border-ink/10">
            {state.students.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center gap-2 border-b-2 border-ink/5 bg-paper p-3 last:border-0"
              >
                <Avatar student={s} size="sm" customWorlds={state.customWorlds} />
                <input
                  value={s.name}
                  onChange={(e) =>
                    update((st) => ({
                      ...st,
                      students: st.students.map((x) =>
                        x.id === s.id ? { ...x, name: e.target.value } : x,
                      ),
                    }))
                  }
                  aria-label={`Name for ${s.name}`}
                  className="font-display h-11 min-w-32 flex-1 rounded-xl border-2 border-transparent bg-card-warm px-3 font-bold outline-none focus:border-honey"
                />
                <select
                  value={s.theme}
                  onChange={(e) =>
                    update((st) => ({
                      ...st,
                      students: st.students.map((x) =>
                        x.id === s.id ? { ...x, theme: e.target.value as Student["theme"] } : x,
                      ),
                    }))
                  }
                  aria-label={`World for ${s.name}`}
                  className="h-11 rounded-xl border-2 border-ink/10 bg-card-warm px-2 text-sm font-bold"
                >
                  {THEMES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.emoji} {t.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs font-bold text-inksoft">
                  {s.id} · {s.stars} ★
                </span>
                <button
                  onClick={() => setEditingStudent(s)}
                  aria-label={`Edit avatar for ${s.name}`}
                  className="grid size-11 place-items-center rounded-2xl border-2 border-sky/30 bg-sky/10 text-sky"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => setPosterFor(s)}
                  className="font-display h-11 rounded-2xl border-2 border-honey/50 bg-honey/20 px-3 text-sm font-bold"
                >
                  Poster
                </button>
                <button
                  onClick={() =>
                    update((st) => ({ ...st, students: st.students.filter((x) => x.id !== s.id) }))
                  }
                  className="grid size-11 place-items-center rounded-2xl border-2 border-coral/30 bg-coral/10 text-coral"
                  aria-label={`Remove ${s.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "categories" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 relative">
            {" "}
            {/* Added relative for dropdown positioning */}
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="New category name (e.g. Pets)"
              className="h-12 min-w-40 flex-1 rounded-2xl border-2 border-ink/10 bg-card-warm px-4 outline-none focus:border-honey"
            />
            {newCat.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 bg-card-warm border-2 border-ink/10 rounded-2xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.name}
                    onClick={() => setNewCat(suggestion.name)}
                    className="flex justify-between items-center w-full px-4 py-2 text-left font-display text-ink hover:bg-ink/10"
                  >
                    <span>{suggestion.name}</span>
                    <div className="flex gap-1">
                      {suggestion.masterCategories.map((mc) => (
                        <span
                          key={mc}
                          className="text-xs font-bold uppercase text-inksoft bg-paper px-2 py-1 rounded-full"
                        >
                          {mc.split(" ")[0]} {/* Display only first word of Master Category */}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
                {filteredSuggestions.length === 0 && (
                  <p className="px-4 py-2 text-inksoft">No suggestions found.</p>
                )}
              </div>
            )}
            <button
              disabled={!newCat.trim()}
              onClick={() => createCategoryWithChoices(newCat.trim(), false)}
              className="font-display flex h-12 items-center gap-2 rounded-2xl border-2 border-ink bg-ink px-5 font-bold text-cream disabled:opacity-40 hover:opacity-95"
            >
              <Plus className="size-4" /> Create
            </button>
            <button
              disabled={!newCat.trim() || creatingCatWithAi}
              onClick={() => createCategoryWithChoices(newCat.trim(), true)}
              title="Create category and automatically generate 4 matching choice items with AI or picture library"
              className="font-display flex h-12 items-center gap-2 rounded-2xl border-2 border-honey/60 bg-honey/30 px-5 font-bold text-ink disabled:opacity-40 hover:bg-honey/40 transition-colors"
            >
              {creatingCatWithAi ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4 text-honey" />
              )}
              <span>Auto-Fill with AI</span>
            </button>
          </div>

          {state.categories.map((cat) => (
            <div key={cat.id} className="rounded-2xl border-2 border-ink/10 bg-card-warm p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <input
                  value={cat.labels[lang]}
                  onChange={(e) =>
                    patchCategory(cat.id, (c) => ({
                      ...c,
                      labels: { ...c.labels, [lang]: e.target.value },
                    }))
                  }
                  aria-label="Category name"
                  className="font-display h-11 min-w-32 flex-1 rounded-xl border-2 border-transparent bg-paper px-3 font-bold outline-none focus:border-honey"
                />
                <button
                  onClick={() => patchCategory(cat.id, (c) => ({ ...c, smart: !c.smart }))}
                  title="Enable smart suggestions for new items in this category"
                  className={`font-display flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold ${
                    cat.smart ? "bg-honey text-ink" : "bg-ink/10 text-inksoft"
                  }`}
                >
                  <Sparkles className="size-4" /> Keep it fresh
                </button>
                <button
                  onClick={() => refreshItems(cat)}
                  disabled={busyCat === cat.id}
                  title="Generate new items for this category from the library or AI"
                  className="font-display flex h-11 items-center gap-2 rounded-full border-2 border-sky/40 bg-sky/15 px-4 text-sm font-bold text-sky"
                >
                  {busyCat === cat.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}{" "}
                  New items
                </button>
                <button
                  onClick={() => patchCategory(cat.id, (c) => ({ ...c, enabled: !c.enabled }))}
                  className={`font-display h-11 shrink-0 rounded-full px-4 text-sm font-bold ${
                    cat.enabled ? "bg-leaf/25 text-leaf" : "bg-ink/10 text-inksoft"
                  }`}
                >
                  {cat.enabled ? "On" : "Off"}
                </button>
                <button
                  onClick={() =>
                    update((s) => ({
                      ...s,
                      categories: s.categories.filter((c) => c.id !== cat.id),
                    }))
                  }
                  aria-label={`Delete ${cat.labels.en}`}
                  className="grid size-11 place-items-center rounded-2xl border-2 border-coral/30 bg-coral/10 text-coral"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <input
                value={cat.question[lang]}
                onChange={(e) =>
                  patchCategory(cat.id, (c) => ({
                    ...c,
                    question: { ...c.question, [lang]: e.target.value },
                  }))
                }
                aria-label="Question read to students"
                className="mb-3 h-11 w-full rounded-xl border-2 border-ink/10 bg-paper px-3 outline-none focus:border-honey"
              />

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {cat.options.map((o) => (
                  <div
                    key={o.id}
                    className="grid place-items-center rounded-2xl border-2 border-ink/10 bg-paper p-3 text-center"
                  >
                    {o.imageUrl ? (
                      <img
                        src={o.imageUrl}
                        alt={o.labels[lang]}
                        className="size-14 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="text-4xl">{o.emoji}</span>
                    )}
                    <input
                      value={o.labels[lang]}
                      onChange={(e) =>
                        patchCategory(cat.id, (c) => ({
                          ...c,
                          options: c.options.map((x) =>
                            x.id === o.id
                              ? { ...x, labels: { ...x.labels, [lang]: e.target.value } }
                              : x,
                          ),
                        }))
                      }
                      aria-label="Option word"
                      className="font-display mt-1 h-9 w-full rounded-lg border-2 border-transparent bg-card-warm px-2 text-center text-sm font-bold outline-none focus:border-honey"
                    />
                    <div className="mt-1 flex gap-1">
                      <button
                        onClick={() => setPicking({ catId: cat.id, optId: o.id })}
                        className="flex items-center gap-1 rounded-lg border-2 border-ink/10 px-2 py-1 text-xs font-bold text-inksoft"
                      >
                        <ImageIcon className="size-3" /> picture
                      </button>
                      <button
                        onClick={() =>
                          patchCategory(cat.id, (c) => ({
                            ...c,
                            options: c.options.filter((x) => x.id !== o.id),
                          }))
                        }
                        aria-label={`Remove ${o.labels[lang]}`}
                        className="rounded-lg border-2 border-coral/30 px-2 py-1 text-xs font-bold text-coral"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newItemId = `opt-${Date.now()}`;
                    patchCategory(cat.id, (c) => ({
                      ...c,
                      options: [
                        ...c.options,
                        {
                          id: newItemId,
                          emoji: "✨", // A more neutral placeholder
                          labels: { en: "New item", es: "Nuevo", ar: "جديد" },
                        },
                      ],
                    }));
                    setPicking({ catId: cat.id, optId: newItemId });
                  }}
                  className="grid min-h-32 place-items-center rounded-2xl border-2 border-dashed border-ink/25 text-inksoft"
                >
                  <Plus className="size-5" />
                  <span className="font-display text-xs font-bold">Add item</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "settings" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Class name">
              <input
                value={state.className}
                onChange={(e) => update((s) => ({ ...s, className: e.target.value }))}
                className="h-12 w-full rounded-2xl border-2 border-ink/10 bg-paper px-4 outline-none focus:border-honey"
              />
            </Field>
            <Field label="Teacher name">
              <input
                value={state.teacherName}
                onChange={(e) => update((s) => ({ ...s, teacherName: e.target.value }))}
                className="h-12 w-full rounded-2xl border-2 border-ink/10 bg-paper px-4 outline-none focus:border-honey"
              />
            </Field>
            <Field label="Grade (Optional)">
              <div>
                <input
                  value={state.grade || ""}
                  placeholder="e.g. PK, Kindergarten, 1st"
                  onChange={(e) => update((s) => ({ ...s, grade: e.target.value }))}
                  className="h-12 w-full rounded-2xl border-2 border-ink/10 bg-paper px-4 outline-none focus:border-honey"
                />
                <span className="text-[11px] text-inksoft mt-1 block">
                  Optional grade level (appears next to room number).
                </span>
              </div>
            </Field>
            <Field label="School Name (Optional)">
              <div>
                <input
                  value={state.schoolName || ""}
                  placeholder="e.g. Sunshine Elementary"
                  onChange={(e) => update((s) => ({ ...s, schoolName: e.target.value }))}
                  className="h-12 w-full rounded-2xl border-2 border-ink/10 bg-paper px-4 outline-none focus:border-honey"
                />
                <span className="text-[11px] text-inksoft mt-1 block">
                  Optional school name. Follows grade or room number.
                </span>
              </div>
            </Field>
            <Field label="Teacher PIN (4 digits)">
              <input
                value={state.pin}
                inputMode="numeric"
                maxLength={4}
                onChange={(e) =>
                  update((s) => ({ ...s, pin: e.target.value.replace(/\D/g, "").slice(0, 4) }))
                }
                className="h-12 w-full rounded-2xl border-2 border-ink/10 bg-paper px-4 outline-none focus:border-honey"
              />
            </Field>
            <Field label="Default avatar color">
              <div className="flex gap-2">
                {COLOR_FILTERS.map((c) => (
                  <span
                    key={c}
                    className="font-display rounded-full border-2 border-ink/10 bg-paper px-3 py-2 text-xs font-bold"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </Field>
            <div className="sm:col-span-2">
              <Field label="App theme">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {UI_THEMES.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => update((s) => ({ ...s, uiTheme: t.key as UiTheme }))}
                      className={`flex items-center gap-2 rounded-2xl border-2 p-3 ${
                        state.uiTheme === t.key
                          ? "border-honey bg-honey/20"
                          : "border-ink/10 bg-paper"
                      }`}
                    >
                      <span className="text-xl">{t.emoji}</span>
                      <span className="font-display text-sm font-bold">{t.label}</span>
                      <span className="ml-auto flex">
                        {t.swatch.map((c) => (
                          <span
                            key={c}
                            className="size-3 rounded-full border border-ink/10"
                            style={{ background: c }}
                          />
                        ))}
                      </span>
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* Classroom Data & Backup */}
          <div className="rounded-2xl border-2 border-ink/10 bg-card-warm p-5">
            <h3 className="font-display text-base font-bold mb-1">Classroom Backup & Data Sync</h3>
            <p className="text-xs text-inksoft mb-4">
              All student profiles, custom worlds, photos, and choice history are stored locally on
              this device. Create downloadable backups to transfer data between classroom iPads or
              prevent data loss.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowSyncModal(true)}
                className="font-display flex items-center gap-2 rounded-2xl border-2 border-ink bg-ink px-4 py-2.5 text-sm font-bold text-cream shadow-[2px_2px_0_#FFC63F]"
              >
                <Download className="size-4" /> Open Backup & Sync Center
              </button>
              <button
                onClick={() => exportAppState(state)}
                className="font-display flex items-center gap-2 rounded-2xl border-2 border-ink/15 bg-paper px-4 py-2.5 text-sm font-bold text-ink hover:bg-card-warm transition-colors"
              >
                <Download className="size-4 text-sky" /> Quick Download (.json)
              </button>
            </div>
          </div>

          {/* Custom Worlds & Groups Management */}
          <div className="rounded-2xl border-2 border-ink/10 bg-card-warm p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-display text-base font-bold">Custom Student Worlds & Teams</h3>
                <p className="text-xs text-inksoft">
                  Create themed world frames (Space, Dino, Safari, etc.) that can be assigned to
                  students.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {(state.customWorlds ?? DEFAULT_CUSTOM_WORLDS).map((world) => (
                <div
                  key={world.id}
                  className="flex items-center gap-2 rounded-2xl border-2 bg-paper px-3 py-1.5 text-xs font-bold"
                  style={{ borderColor: world.color }}
                >
                  <span className="text-base">{world.emoji}</span>
                  <span>{world.label}</span>
                  <button
                    onClick={() => {
                      const current = state.customWorlds ?? DEFAULT_CUSTOM_WORLDS;
                      update((s) => ({
                        ...s,
                        customWorlds: current.filter((w) => w.id !== world.id),
                      }));
                    }}
                    title="Remove custom world"
                    className="ml-1 text-inksoft hover:text-coral transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                value={newWorldEmoji}
                onChange={(e) => setNewWorldEmoji(e.target.value.slice(0, 2))}
                className="size-11 rounded-xl border-2 border-ink/10 bg-paper text-center text-lg outline-none focus:border-honey"
                placeholder="🚀"
                title="World emoji"
              />
              <input
                value={newWorldLabel}
                onChange={(e) => setNewWorldLabel(e.target.value)}
                className="h-11 min-w-36 flex-1 rounded-xl border-2 border-ink/10 bg-paper px-3 text-xs font-bold outline-none focus:border-honey"
                placeholder="World or Team name (e.g. Robot Lab)"
              />
              <input
                type="color"
                value={newWorldColor}
                onChange={(e) => setNewWorldColor(e.target.value)}
                className="size-11 cursor-pointer rounded-xl border-2 border-ink/10 bg-paper p-1"
                title="Badge frame color"
              />
              <button
                disabled={!newWorldLabel.trim()}
                onClick={() => {
                  const newW: CustomWorld = {
                    id: `world-${Date.now()}`,
                    label: newWorldLabel.trim(),
                    emoji: newWorldEmoji || "⭐",
                    color: newWorldColor || "#3B82F6",
                  };
                  update((s) => ({
                    ...s,
                    customWorlds: [...(s.customWorlds ?? DEFAULT_CUSTOM_WORLDS), newW],
                  }));
                  setNewWorldLabel("");
                }}
                className="font-display flex h-11 items-center gap-1.5 rounded-xl border-2 border-ink bg-ink px-4 text-xs font-bold text-cream disabled:opacity-40"
              >
                <Plus className="size-4" /> Add World
              </button>
            </div>
          </div>

          {/* Guides & Support Educator */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border-2 border-ink/10 bg-card-warm p-5">
              <h3 className="font-display text-base font-bold mb-1">
                Classroom Walkthrough & Tour
              </h3>
              <p className="text-xs text-inksoft mb-3">
                Review the step-by-step onboarding story, educational philosophy, and setup tips.
              </p>
              <button
                onClick={() => setShowOnboarding(true)}
                className="font-display flex items-center gap-2 rounded-xl border-2 border-ink/15 bg-paper px-4 py-2.5 text-xs font-bold text-ink hover:bg-card-warm transition-colors"
              >
                <HelpCircle className="size-4 text-sky" /> Replay Walkthrough Tour
              </button>
            </div>

            <div className="rounded-2xl border-2 border-ink/10 bg-card-warm p-5">
              <h3 className="font-display text-base font-bold mb-1">Feature Walkthrough Hints</h3>
              <p className="text-xs text-inksoft mb-3">
                Toggle or reset the dark callout "chat boxes" that explain features across every
                screen.
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={state.showFeatureHints !== false}
                    onChange={(e) => update((s) => ({ ...s, showFeatureHints: e.target.checked }))}
                    className="size-4 rounded border-2 border-ink text-honey accent-ink"
                  />
                  <span>Enable feature walkthrough pointers</span>
                </label>
                <button
                  onClick={() => {
                    resetAllCoachmarks();
                    setHintResetSuccess(true);
                    setTimeout(() => setHintResetSuccess(false), 3000);
                  }}
                  className="font-display inline-flex items-center gap-1.5 rounded-xl border border-ink/20 bg-paper px-3 py-1.5 text-xs font-bold text-ink hover:bg-card-warm transition-colors"
                >
                  <Sparkles className="size-3.5 text-honey" />
                  {hintResetSuccess ? "Hints Re-enabled!" : "Replay All Hints Everywhere"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-honey/40 bg-honey/15 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="size-4 fill-coral text-coral" />
                  <h3 className="font-display text-base font-bold">Creator Line & Support</h3>
                </div>
                <p className="text-xs text-inksoft mb-3">
                  Founded by an educator, paraprofessional, and co-parenting father. Free and
                  ad-free.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="font-display flex items-center justify-center gap-1.5 rounded-xl border-2 border-ink bg-paper px-3 py-2 text-xs font-bold text-ink hover:bg-card-warm transition-colors"
                >
                  <Mail className="size-3.5 text-coral" /> Message Creator Directly
                </button>
                <button
                  onClick={() => setShowSupportModal(true)}
                  className="font-display flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-honey px-4 py-2 text-xs font-bold text-ink shadow-[2px_2px_0_#3A2E28] hover:-translate-y-0.5 transition-transform"
                >
                  Support This Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {printCards && (
        <PrintableCards state={state} lang={lang} onClose={() => setPrintCards(false)} />
      )}
      {printGroups && (
        <GroupsPrintable state={state} groups={groups} onClose={() => setPrintGroups(false)} />
      )}
      {posterFor && (
        <PosterPrintable
          student={posterFor}
          state={state}
          lang={lang}
          onClose={() => setPosterFor(null)}
        />
      )}
      {picking && (
        <PicturePicker
          lang={lang}
          onPick={applyPicture}
          onClose={() => setPicking(null)}
          title="Choose a picture"
        />
      )}
      {editingStudent && (
        <AvatarBuilder
          initial={editingStudent}
          customWorlds={state.customWorlds}
          onAddCustomWorld={(w) =>
            update((st) => ({ ...st, customWorlds: [...(st.customWorlds ?? []), w] }))
          }
          onCancel={() => setEditingStudent(null)}
          onSave={(s) => {
            update((st) => ({
              ...st,
              students: st.students.map((x) => (x.id === editingStudent.id ? { ...x, ...s } : x)),
            }));
            setEditingStudent(null);
          }}
        />
      )}

      {showSyncModal && (
        <SyncBackupModal
          state={state}
          onRestore={(imported) => update(() => imported)}
          onClose={() => setShowSyncModal(false)}
        />
      )}

      {showOnboarding && (
        <OnboardingModal
          showFeatureHints={state.showFeatureHints !== false}
          onToggleFeatureHints={(enabled) => update((s) => ({ ...s, showFeatureHints: enabled }))}
          onOpenContact={() => {
            setShowOnboarding(false);
            setShowContactModal(true);
          }}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {showSupportModal && <SupportTeacherModal onClose={() => setShowSupportModal(false)} />}

      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}

      <FeatureCoachmarks
        screen={`admin-${tab}` as CoachmarkScreen}
        enabled={state.showFeatureHints !== false}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-ink/10 bg-paper p-3">
      <p className="text-xs font-bold uppercase text-inksoft">{label}</p>
      <p className="font-display truncate text-xl font-bold">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-2xl border-2 border-ink/10 bg-card-warm p-4">
      <span className="font-display mb-2 block text-sm font-bold uppercase text-inksoft">
        {label}
      </span>
      {children}
    </label>
  );
}
