import { Printer, X } from "lucide-react";
import type { AppState, Category, Lang, Student } from "@/lib/app-types";
import { THEMES } from "@/lib/defaults";
import { getClassSubtitle } from "@/lib/class-info";

export function PrintableCards({
  state,
  lang,
  onClose,
}: {
  state: AppState;
  lang: Lang;
  onClose: () => void;
}) {
  const cats = state.categories.filter((c) => c.enabled);
  return (
    <PrintShell title="Choice Cards & Game Boards" onClose={onClose}>
      {cats.map((c: Category) => (
        <section key={c.id} className="mb-8 break-inside-avoid">
          <h3 className="font-display mb-3 border-b-4 border-black pb-1 text-2xl font-bold">
            {c.question[lang]}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {c.options.map((o) => (
              <div
                key={o.id}
                className="grid place-items-center border-4 border-black p-6 text-center"
              >
                <span className="text-7xl" aria-hidden>
                  {o.emoji}
                </span>
                <span className="font-display mt-2 text-2xl font-bold uppercase">
                  {o.labels[lang]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-4 border-dashed border-black p-3">
            <p className="font-display text-sm font-bold uppercase">Teacher tally board</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {c.options.map((o) => (
                <div key={o.id} className="flex items-center gap-2 border-2 border-black p-2">
                  <span className="text-2xl">{o.emoji}</span>
                  <span className="flex-1 text-sm font-bold">{o.labels[lang]}</span>
                  <span className="h-8 w-24 border-b-2 border-black" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </PrintShell>
  );
}

export function PosterPrintable({
  student,
  state,
  lang,
  onClose,
}: {
  student: Student;
  state: AppState;
  lang: Lang;
  onClose: () => void;
}) {
  const theme = THEMES.find((t) => t.key === student.theme)!;
  const mine = state.choices.filter((c) => c.studentId === student.id);
  const current = state.categories
    .filter((c) => c.enabled)
    .map((cat) => {
      const last = [...mine].reverse().find((m) => m.categoryId === cat.id);
      const opt = cat.options.find((o) => o.id === last?.optionId);
      return { cat, opt };
    });

  return (
    <PrintShell title={`All About ${student.name}`} onClose={onClose}>
      <div className="border-8 border-black p-6">
        <header className="mb-6 flex items-center gap-4 border-b-4 border-black pb-4">
          <span className="text-7xl">{theme.emoji}</span>
          <div>
            <h2 className="font-display text-5xl font-bold">All About {student.name}</h2>
            <p className="text-lg">
              {theme.label} world · {student.stars} golden stars
            </p>
          </div>
        </header>
        <div className="grid grid-cols-2 gap-4">
          {current.map(({ cat, opt }) => (
            <div key={cat.id} className="border-4 border-black p-4">
              <p className="font-display text-sm font-bold uppercase">{cat.labels[lang]}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-5xl">{opt?.emoji ?? "❓"}</span>
                <span className="font-display text-2xl font-bold">
                  {opt?.labels[lang] ?? "Not chosen yet"}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 border-4 border-black p-4">
          <p className="font-display mb-2 text-sm font-bold uppercase">Choices over time</p>
          {mine.length === 0 ? (
            <p className="text-sm">No history recorded yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {mine.slice(-12).map((m) => {
                const cat = state.categories.find((c) => c.id === m.categoryId);
                const opt = cat?.options.find((o) => o.id === m.optionId);
                return (
                  <li key={m.id} className="flex justify-between border-b border-black/30 py-1">
                    <span>
                      {opt?.emoji} {opt?.labels[lang]} · {cat?.labels[lang]}
                    </span>
                    <span>{new Date(m.at).toLocaleDateString()}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </PrintShell>
  );
}

export function GroupsPrintable({
  state,
  groups,
  onClose,
}: {
  state: AppState;
  groups: { label: string; emoji: string; members: Student[] }[];
  onClose: () => void;
}) {
  return (
    <PrintShell title="Group Builder Sheet" onClose={onClose}>
      <div className="mb-4 border-b-4 border-black pb-2">
        <h2 className="font-display text-3xl font-bold">Class Groups</h2>
        <p className="text-sm">
          {getClassSubtitle(state)} · {new Date().toLocaleDateString()}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {groups.map((g, i) => (
          <div key={`${g.label}-${i}`} className="border-4 border-black p-4">
            <div className="mb-2 flex items-center gap-2 border-b-2 border-black pb-2">
              <span className="text-3xl">{g.emoji}</span>
              <span className="font-display text-xl font-bold">{g.label}</span>
            </div>
            <ul className="space-y-1">
              {g.members.map((m) => (
                <li key={m.id} className="text-sm font-bold">
                  {m.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="col-span-full text-sm">Run a game to build groups.</p>
        )}
      </div>
    </PrintShell>
  );
}

function PrintShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="print-sheet fixed inset-0 z-50 overflow-y-auto bg-white p-6 text-black">
      <div className="no-print mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="font-display flex h-12 items-center gap-2 rounded-2xl border-2 border-black bg-black px-5 font-bold text-white"
          >
            <Printer className="size-5" /> Print
          </button>
          <button
            onClick={onClose}
            className="grid size-12 place-items-center rounded-2xl border-2 border-black"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
      <div className="mx-auto max-w-3xl">{children}</div>
    </div>
  );
}
