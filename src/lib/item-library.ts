import type { Category, CategoryOption, Lang } from "./app-types";
import { PICTURES, type Pic } from "./picture-library";

export const POOLS = [
  "animals",
  "food",
  "play",
  "colors",
  "weather",
  "vehicles",
  "feelings",
  "nature",
] as const;

function poolFor(cat: Category): string {
  if (cat.pool) return cat.pool;
  const label = cat.labels.en.toLowerCase();
  const guess = PICTURES.find(
    (p) => p.tags.some((t) => label.includes(t)) || label.includes(p.tags[0] ?? ""),
  );
  return guess?.tags[0] ?? "animals";
}

export function picToOption(pic: Pic): CategoryOption {
  return { id: `smart-${pic.id}`, emoji: pic.emoji, labels: pic.labels, smart: true };
}

/** Pick fresh items from the built-in library that this category has not shown yet. */
export function freshFromLibrary(cat: Category, count: number): CategoryOption[] {
  const pool = poolFor(cat);
  const used = new Set([...(cat.usedOptionIds ?? []), ...cat.options.map((o) => o.id)]);
  const usedEmoji = new Set(cat.options.map((o) => o.emoji));
  const candidates = PICTURES.filter(
    (p) => p.tags.includes(pool) && !used.has(`smart-${p.id}`) && !usedEmoji.has(p.emoji),
  );
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(picToOption);
}

/** Merge fresh items into a category, keeping the option count stable. */
export function rotateCategory(cat: Category, extras: CategoryOption[]): Category {
  if (extras.length === 0) return cat;
  const keep = cat.options.slice(extras.length);
  const options = [...keep, ...extras];
  return {
    ...cat,
    options,
    usedOptionIds: [
      ...new Set([...(cat.usedOptionIds ?? []), ...cat.options.map((o) => o.id)]),
    ].slice(-120),
  };
}

export function swapSingleOption(cat: Category, optionId: string): Category {
  const [fresh] = freshFromLibrary(cat, 1);
  if (!fresh) return cat;
  return {
    ...cat,
    options: cat.options.map((o) => (o.id === optionId ? fresh : o)),
    usedOptionIds: [...new Set([...(cat.usedOptionIds ?? []), optionId])].slice(-120),
  };
}

export function labelIn(labels: Record<Lang, string>, lang: Lang) {
  return labels[lang] || labels.en;
}
