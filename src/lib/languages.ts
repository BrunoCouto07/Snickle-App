export interface Language {
  code: string; // BCP 47 language tag, e.g., "en-US"
  lang: string; // 2-letter abbreviation, e.g., "en"
  name: string; // Native name, e.g., "English"
  flag: string; // Emoji flag, e.g., "🇺🇸"
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en-US", lang: "en", name: "English", flag: "🇺🇸" },
  { code: "es-ES", lang: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt-BR", lang: "pt", name: "Português (Brasil)", flag: "🇧🇷" },
  { code: "zh-CN", lang: "zh", name: "中文 (简体)", flag: "🇨🇳" },
  { code: "it-IT", lang: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "fr-FR", lang: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ja-JP", lang: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko-KR", lang: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ru-RU", lang: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "nl-NL", lang: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "de-DE", lang: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "el-GR", lang: "el", name: "Ελληνικά", flag: "🇬🇷" },
  { code: "ar-SA", lang: "ar", name: "العربية", flag: "🇸🇦" },
];
