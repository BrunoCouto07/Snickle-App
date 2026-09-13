import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Cloud, CloudOff, Globe, HelpCircle, Heart, Lock, Star } from "lucide-react";
import type { Category, Lang, Student } from "@/lib/app-types";
import { useAppState } from "@/lib/store";
import { UI_TEXT } from "@/lib/speech";
import { freshFromLibrary, rotateCategory, swapSingleOption } from "@/lib/item-library";
import { StudentRoster } from "@/components/StudentRoster";
import { AvatarBuilder } from "@/components/AvatarBuilder";
import { GameScreen } from "@/components/GameScreen";
import { TeacherLock } from "@/components/TeacherLock";
import { AdminDashboard } from "@/components/AdminDashboard";
import { InactivityModal } from "@/components/InactivityModal";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";
import { SyncBackupModal } from "@/components/SyncBackupModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { SupportTeacherButton, SupportTeacherModal } from "@/components/SupportTeacherModal";
import { AppFooter } from "@/components/AppFooter";
import { ContactModal } from "@/components/ContactModal";
import { FeatureCoachmarks } from "@/components/FeatureCoachmarks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kid Choices Connect" },
      {
        name: "description",
        content:
          "Pre-K gamified preference collector and teacher analytics dashboard with student avatars, multilingual audio, and printable choice cards.",
      },
      { property: "og:title", content: "Kid Choices Connect" },
      {
        property: "og:description",
        content:
          "Pre-K gamified preference collector and teacher analytics dashboard with student avatars, multilingual audio, and printable choice cards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const IDLE_MS = 3 * 60 * 1000;

function Home() {
  const { state, update, syncing } = useAppState();
  const [screen, setScreen] = useState<"roster" | "game" | "admin">("roster");
  const [active, setActive] = useState<Student | null>(null);
  const [building, setBuilding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [locking, setLocking] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const lastActivity = useRef(Date.now());
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const t = UI_TEXT[state.lang];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("snickle_tour_completed");
      if (!seen) {
        setShowOnboarding(true);
      }
    }
  }, []);

  const bump = useCallback(() => {
    lastActivity.current = Date.now();
    setCountdown(null);
  }, []);

  useEffect(() => {
    if (screen !== "game") return;
    const id = window.setInterval(() => {
      const idle = Date.now() - lastActivity.current;
      if (idle > IDLE_MS) {
        setCountdown((c) => {
          if (c === null) return 30;
          if (c <= 1) {
            setScreen("roster");
            setActive(null);
            lastActivity.current = Date.now();
            return null;
          }
          return c - 1;
        });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [screen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [langDropdownRef]);

  useEffect(() => {
    const handler = () => bump();
    window.addEventListener("pointerdown", handler);
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [bump]);

  const setLang = (lang: Lang) => update((s) => ({ ...s, lang }));

  return (
    <div className="doodle min-h-screen bg-cream text-ink">
      <header className="sticky top-0 z-30 border-b-2 border-ink/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-11 shrink-0 -rotate-6 place-items-center rounded-2xl border-2 border-ink/10 bg-honey">
              <Star className="size-6 fill-ink text-ink" />
            </div>
            <div className="min-w-0 leading-tight">
              <h1 className="font-display truncate text-lg font-bold">Kid Choices Connect</h1>
              <p className="font-hand -mt-1 text-base text-inksoft">
                empowering every learner&apos;s voice
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="relative" ref={langDropdownRef}>
              {" "}
              {/* Added ref here */}
              <button
                id="language-menu-button"
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="grid size-11 place-items-center rounded-full border-2 border-ink/10 bg-paper text-ink hover:bg-card-warm transition-colors"
                aria-label="Select language"
                aria-expanded={isLanguageDropdownOpen}
              >
                <Globe className="size-5" />
              </button>
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-2xl border-2 border-ink/15 bg-paper p-1.5 shadow-[4px_4px_0_#3A2E28] ring-1 ring-black/5 focus:outline-none z-50">
                  <div
                    className="py-1 space-y-0.5"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="language-menu-button"
                  >
                    {SUPPORTED_LANGUAGES.map((langOption) => {
                      const isSelected = state.lang === langOption.lang;
                      return (
                        <button
                          key={langOption.code}
                          onClick={() => {
                            setLang(langOption.lang as Lang);
                            setIsLanguageDropdownOpen(false);
                          }}
                          className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl w-full text-left transition-colors ${
                            isSelected
                              ? "bg-honey text-ink shadow-[1px_1px_0_#3A2E28]"
                              : "text-ink hover:bg-card-warm"
                          }`}
                          role="menuitem"
                        >
                          <span className="text-lg shrink-0">{langOption.flag}</span>
                          <span className="font-mono font-bold text-[11px] uppercase px-1.5 py-0.5 rounded bg-ink/5 shrink-0">
                            {langOption.lang.toUpperCase()}
                          </span>
                          <span className="truncate flex-1">{langOption.name}</span>
                          {isSelected && (
                            <span className="text-ink font-black text-sm shrink-0">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowSyncModal(true)}
              title="Classroom Sync & Backup status. Click to download or restore backup."
              className="flex items-center gap-1.5 rounded-full border-2 border-leaf/40 bg-leaf/15 px-3 py-1.5 text-xs font-bold text-leaf hover:bg-leaf/25 transition-colors cursor-pointer"
            >
              {syncing ? (
                <CloudOff className="size-4 animate-pulse" />
              ) : (
                <Cloud className="size-4" />
              )}
              <span className="hidden sm:inline">{syncing ? "Saving" : "Offline Synced"}</span>
            </button>
            <button
              onClick={() => setShowOnboarding(true)}
              aria-label="App tutorial guide"
              title="Classroom Guide & Walkthrough"
              className="grid size-11 place-items-center rounded-full border-2 border-ink/10 bg-paper text-ink hover:bg-card-warm transition-colors"
            >
              <HelpCircle className="size-5" />
            </button>
            {screen !== "admin" && (
              <button
                onClick={() => setLocking(true)}
                aria-label="Teacher admin"
                className="grid size-11 place-items-center rounded-full border-2 border-ink bg-ink text-cream shadow-[3px_3px_0_#FFC63F]"
              >
                <Lock className="size-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {screen === "roster" && (
          <StudentRoster
            state={state}
            onAdd={() => setBuilding(true)}
            onEditStudent={(s) => setEditingStudent(s)}
            onSelect={(s) => {
              setActive(s);
              bump();
              setScreen("game");
              setSessionStartTime(Date.now());
            }}
          />
        )}

        {screen === "game" && active && (
          <GameScreen
            student={state.students.find((s) => s.id === active.id) ?? active}
            state={state}
            onActivity={bump}
            onModeChange={(mode) => update((s) => ({ ...s, mode }))}
            onRecord={(categoryId, optionId, note) =>
              update((s) => ({
                ...s,
                choices: [
                  ...s.choices,
                  {
                    id: `${Date.now()}-${optionId}`,
                    studentId: active.id,
                    categoryId,
                    optionId,
                    at: Date.now(),
                    ...(note ? { note } : {}),
                  },
                ],
              }))
            }
            onFinish={() =>
              update((s) => ({
                ...s,
                students: s.students.map((st) =>
                  st.id === active.id ? { ...st, stars: st.stars + 1 } : st,
                ),
                lastSyncedAt: Date.now(),
              }))
            }
            onBack={() => {
              setActive(null);
              setScreen("roster");
            }}
            onFreshItems={(categoryId) =>
              update((s) => {
                const cat = s.categories.find((c) => c.id === categoryId);
                if (!cat) return s;
                const extras = freshFromLibrary(cat, Math.min(3, cat.options.length));
                if (extras.length === 0) return s;
                return {
                  ...s,
                  categories: s.categories.map((c) =>
                    c.id === categoryId ? rotateCategory(c, extras) : c,
                  ),
                };
              })
            }
            onSwapItem={(categoryId, optionId) =>
              update((s) => ({
                ...s,
                categories: s.categories.map((c) =>
                  c.id === categoryId ? swapSingleOption(c, optionId) : c,
                ),
              }))
            }
            sessionStartTime={sessionStartTime}
          />
        )}

        {screen === "admin" && (
          <AdminDashboard
            state={state}
            update={update}
            syncing={syncing}
            onExit={() => setScreen("roster")}
          />
        )}
      </main>

      {(building || editingStudent) && (
        <AvatarBuilder
          initial={editingStudent ?? undefined}
          customWorlds={state.customWorlds}
          onAddCustomWorld={(w) =>
            update((st) => ({ ...st, customWorlds: [...(st.customWorlds ?? []), w] }))
          }
          onCancel={() => {
            setBuilding(false);
            setEditingStudent(null);
          }}
          onSave={(s) => {
            if (editingStudent) {
              update((st) => ({
                ...st,
                students: st.students.map((existing) =>
                  existing.id === editingStudent.id ? { ...existing, ...s } : existing,
                ),
              }));
            } else {
              update((st) => ({
                ...st,
                students: [...st.students, { ...s, id: `ST-${Date.now()}`, stars: 0 }],
              }));
            }
            setBuilding(false);
            setEditingStudent(null);
          }}
        />
      )}

      {locking && (
        <TeacherLock
          pin={state.pin}
          onCancel={() => setLocking(false)}
          onUnlock={() => {
            setLocking(false);
            setScreen("admin");
          }}
        />
      )}

      {countdown !== null && (
        <InactivityModal
          seconds={countdown}
          title={t.stillThere}
          subtitle={t.tapToStay}
          onStay={bump}
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
          onClose={() => {
            setShowOnboarding(false);
            try {
              localStorage.setItem("snickle_tour_completed", "true");
            } catch {
              // Ignore localStorage errors
            }
          }}
        />
      )}

      {showSupportModal && <SupportTeacherModal onClose={() => setShowSupportModal(false)} />}

      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}

      {screen !== "admin" && (
        <FeatureCoachmarks
          screen={screen === "game" ? "game" : "roster"}
          enabled={state.showFeatureHints !== false}
        />
      )}

      <AppFooter
        onOpenGuide={() => setShowOnboarding(true)}
        onOpenContact={() => setShowContactModal(true)}
        onOpenBackup={() => setShowSyncModal(true)}
        onOpenSupport={() => setShowSupportModal(true)}
      />
    </div>
  );
}
