export type Lang =
  "en" | "es" | "pt" | "zh" | "it" | "fr" | "ja" | "ko" | "ru" | "nl" | "de" | "el" | "ar";

export type ThemeKey = "space" | "farm" | "forest" | "sea" | "superhero";

export type UiTheme =
  "standard" | "dark" | "vaporwave" | "space" | "sea" | "forest" | "farm" | "superhero";

export type WorldFrameStyle = "classic" | "stars" | "dino" | "galaxy" | "safari" | "ocean";

export interface CustomWorld {
  id: string;
  label: string;
  emoji: string;
  color: string;
  frameStyle?: WorldFrameStyle;
}

export interface Student {
  id: string;
  name: string;
  theme: ThemeKey;
  accessories: string[];
  stars: number;
  /** Custom character emoji; falls back to the world emoji. */
  face?: string;
  /** Colour tint key from COLOR_FILTERS. */
  tint?: string;
  /** ID of custom world / group. */
  customWorldId?: string;
  /** Client-side local photo (base64). Never sent to any server. */
  photoUrl?: string;
}

export interface CategoryOption {
  id: string;
  emoji: string;
  imageUrl?: string;
  labels: Record<Lang, string>;
  /** Added by the "keep it fresh" smart rotation. */
  smart?: boolean;
}

export interface Category {
  id: string;
  enabled: boolean;
  labels: Record<Lang, string>;
  question: Record<Lang, string>;
  options: CategoryOption[];
  /** Keep it fresh: rotate in new items each round. */
  smart?: boolean;
  /** Picture-library group used for fresh items. */
  pool?: string;
  /** Items already shown, so the rotation does not repeat. */
  usedOptionIds?: string[];
}

export interface ChoiceRecord {
  id: string;
  studentId: string;
  categoryId: string;
  optionId: string;
  at: number;
  note?: string;
}

export interface AppState {
  students: Student[];
  categories: Category[];
  choices: ChoiceRecord[];
  pin: string;
  lang: Lang;
  mode: "simple" | "advanced";
  lastSyncedAt: number | null;
  className: string;
  teacherName: string;
  grade?: string;
  schoolName?: string;
  uiTheme: UiTheme;
  customWorlds?: CustomWorld[];
  showFeatureHints?: boolean;
}
