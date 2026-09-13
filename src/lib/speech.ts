import type { Lang } from "./app-types";

export const LOCALE: Record<Lang, string> = {
  en: "en-US",
  es: "es-ES",
  pt: "pt-BR",
  zh: "zh-CN",
  it: "it-IT",
  fr: "fr-FR",
  ja: "ja-JP",
  ko: "ko-KR",
  ru: "ru-RU",
  nl: "nl-NL",
  de: "de-DE",
  el: "el-GR",
  ar: "ar-SA",
};

/** Candidate regional variants for fallback when primary locale voice isn't installed */
export const LOCALE_FALLBACKS: Record<Lang, string[]> = {
  en: ["en-US", "en-GB", "en-CA", "en-AU", "en-NZ", "en-IE", "en"],
  es: ["es-ES", "es-MX", "es-US", "es-419", "es-AR", "es-CO", "es-CL", "es"],
  pt: ["pt-BR", "pt-PT", "pt"],
  zh: ["zh-CN", "zh-TW", "zh-HK", "zh-SG", "zh-Hans", "zh-Hant", "zh"],
  it: ["it-IT", "it-CH", "it"],
  fr: ["fr-FR", "fr-CA", "fr-BE", "fr-CH", "fr"],
  ja: ["ja-JP", "ja"],
  ko: ["ko-KR", "ko"],
  ru: ["ru-RU", "ru"],
  nl: ["nl-NL", "nl-BE", "nl"],
  de: ["de-DE", "de-AT", "de-CH", "de"],
  el: ["el-GR", "el-CY", "el"],
  ar: ["ar-SA", "ar-EG", "ar-AE", "ar-QA", "ar-KW", "ar-MA", "ar"],
};

let voices: SpeechSynthesisVoice[] = [];

function loadVoices() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const loaded = window.speechSynthesis.getVoices();
    if (loaded && loaded.length > 0) {
      voices = loaded;
    }
  }
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

// Preferred warm, expressive, high-clarity natural teacher voices per language
const PREFERRED_VOICES: Record<Lang, string[]> = {
  en: [
    "Google US English",
    "Microsoft Aria Online (Natural)",
    "Microsoft Aria",
    "Microsoft Jenny Online (Natural)",
    "Microsoft Jenny",
    "Samantha",
    "Ava (Premium)",
    "Ava (Enhanced)",
    "Ava",
    "Victoria",
    "Allison",
    "Karen",
    "Microsoft Michelle Online (Natural)",
    "Microsoft Guy Online (Natural)",
    "Google UK English Female",
    "Moira",
    "Tessa",
    "Fiona",
    "Microsoft Zira",
    "Jenny",
  ],
  es: [
    "Google español",
    "Google español (Estados Unidos)",
    "Microsoft Dalia Online (Natural)",
    "Microsoft Elvira Online (Natural)",
    "Microsoft Helena Online (Natural)",
    "Microsoft Paloma Online (Natural)",
    "Paulina",
    "Monica",
    "Paloma",
    "Lucia",
    "Helena",
    "Microsoft Sabina Online (Natural)",
  ],
  pt: [
    "Google português do Brasil",
    "Google português",
    "Microsoft Francisca Online (Natural)",
    "Microsoft Thalita Online (Natural)",
    "Luciana",
    "Francisca",
    "Maria",
    "Vitória",
  ],
  zh: [
    "Google 普通话（中国大陆）",
    "Google 國語（台灣）",
    "Microsoft Xiaoxiao Online (Natural)",
    "Microsoft Yunxi Online (Natural)",
    "Microsoft HsiaoChen Online (Natural)",
    "Ting-Ting",
    "Mei-Jia",
    "Xiaoxiao",
  ],
  it: [
    "Google italiano",
    "Microsoft Elsa Online (Natural)",
    "Microsoft Isabella Online (Natural)",
    "Alice",
    "Federica",
    "Paola",
    "Elsa",
  ],
  fr: [
    "Google français",
    "Google français canadien",
    "Microsoft Denise Online (Natural)",
    "Microsoft Henri Online (Natural)",
    "Microsoft Sylvie Online (Natural)",
    "Amelie",
    "Audrey",
    "Thomas",
    "Celine",
  ],
  ja: [
    "Google 日本語",
    "Microsoft Nanami Online (Natural)",
    "Microsoft Keita Online (Natural)",
    "Kyoko",
    "Otoya",
    "Nanami",
  ],
  ko: [
    "Google 한국의",
    "Microsoft SunHi Online (Natural)",
    "Microsoft InJoon Online (Natural)",
    "Yuna",
    "Nari",
    "SunHi",
  ],
  ru: [
    "Google русский",
    "Microsoft Svetlana Online (Natural)",
    "Microsoft Irina Online (Natural)",
    "Milena",
    "Tatyana",
    "Irina",
  ],
  nl: [
    "Google Nederlands",
    "Microsoft Colette Online (Natural)",
    "Microsoft Fenna Online (Natural)",
    "Claire",
    "Fenna",
    "Colette",
  ],
  de: [
    "Google Deutsch",
    "Microsoft Katja Online (Natural)",
    "Microsoft Amala Online (Natural)",
    "Anna",
    "Marlene",
    "Petra",
    "Katja",
  ],
  el: [
    "Google Ελληνικά",
    "Microsoft Athina Online (Natural)",
    "Microsoft Nestoras Online (Natural)",
    "Athena",
    "Nestoras",
  ],
  ar: [
    "Google عربي",
    "Microsoft Salma Online (Natural)",
    "Microsoft Shakir Online (Natural)",
    "Microsoft Fatima Online (Natural)",
    "Amira",
    "Laila",
    "Maged",
    "Tariq",
  ],
};

function normalizeLangTag(tag: string): string {
  return tag.replace(/_/g, "-").toLowerCase();
}

/**
 * Strict language isolation: Validates that a voice truly belongs to the target language family.
 * A voice for English will NEVER be selected for non-English languages (Spanish, Arabic, etc.).
 */
function voiceMatchesLanguage(voice: SpeechSynthesisVoice, lang: Lang): boolean {
  const vLang = normalizeLangTag(voice.lang);
  const fallbacks = LOCALE_FALLBACKS[lang] || [LOCALE[lang]];
  const langPrefix = lang.toLowerCase();

  if (vLang.startsWith(langPrefix)) return true;
  if (fallbacks.some((fb) => vLang === fb.toLowerCase() || vLang.startsWith(fb.toLowerCase()))) {
    return true;
  }

  // Handle special Chinese voice tags
  if (lang === "zh" && (vLang.includes("cmn") || voice.name.toLowerCase().includes("chinese"))) {
    return true;
  }

  return false;
}

/**
 * Score a voice based on quality, teacher warmth, and natural cadence.
 * Highest score wins. Disqualifies voices from incompatible language families.
 */
function scoreVoice(voice: SpeechSynthesisVoice, lang: Lang): number {
  if (!voiceMatchesLanguage(voice, lang)) {
    return -999999; // Disqualify non-matching languages
  }

  let score = 0;
  const nameLower = voice.name.toLowerCase();
  const vLang = normalizeLangTag(voice.lang);
  const primaryLocale = (LOCALE[lang] || "").toLowerCase();
  const preferred = PREFERRED_VOICES[lang] || [];

  // 1. Check against preferred curated high-quality voices
  const prefIdx = preferred.findIndex((p) => nameLower.includes(p.toLowerCase()));
  if (prefIdx !== -1) {
    score += 5000 - prefIdx * 150;
  }

  // Explicit priority for high-clarity teacher voices (Google US English & Microsoft Aria)
  if (lang === "en") {
    if (nameLower.includes("google us english")) {
      score += 4000;
    } else if (nameLower.includes("microsoft aria")) {
      score += 3800;
    } else if (nameLower.includes("microsoft jenny")) {
      score += 3500;
    } else if (nameLower.includes("samantha")) {
      score += 3200;
    } else if (nameLower.includes("ava")) {
      score += 3000;
    }
  }

  // 2. High-grade neural/natural indicators
  if (nameLower.includes("online (natural)") || nameLower.includes("(natural)")) {
    score += 1600;
  }
  if (nameLower.includes("google")) {
    score += 1300;
  }
  if (nameLower.includes("neural") || nameLower.includes("wavenet")) {
    score += 1100;
  }
  if (nameLower.includes("premium") || nameLower.includes("enhanced")) {
    score += 900;
  }

  // 3. Cheerful female / warm teacher cadence indicator
  if (
    nameLower.includes("female") ||
    nameLower.includes("samantha") ||
    nameLower.includes("aria") ||
    nameLower.includes("jenny") ||
    nameLower.includes("ava") ||
    nameLower.includes("victoria") ||
    nameLower.includes("karen") ||
    nameLower.includes("paulina") ||
    nameLower.includes("monica") ||
    nameLower.includes("xiaoxiao") ||
    nameLower.includes("nanami") ||
    nameLower.includes("sunhi")
  ) {
    score += 400;
  }

  // 4. Exact primary locale match bonus
  if (vLang === primaryLocale) {
    score += 350;
  } else if (vLang.startsWith(lang.toLowerCase())) {
    score += 200;
  }

  // 5. Default voice bonus
  if (voice.default) {
    score += 50;
  }

  // 6. Heavily penalize robotic or low-bitrate legacy voices
  if (
    nameLower.includes("espeak") ||
    nameLower.includes("compact") ||
    nameLower.includes("robotic") ||
    nameLower.includes("desktop")
  ) {
    score -= 3000;
  }

  return score;
}

/**
 * Find the most natural, chipper teacher voice for the specified language.
 * Accepts either a language code ('en', 'es') or locale string ('en-US', 'es-ES').
 */
export function getTeacherVoice(langOrLocale: Lang | string): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) {
    loadVoices();
  }
  if (!voices || voices.length === 0) {
    return null;
  }

  const langKey = (Object.keys(LOCALE).find(
    (k) => LOCALE[k as Lang] === langOrLocale || k === langOrLocale,
  ) ||
    langOrLocale.split("-")[0] ||
    "en") as Lang;
  const targetLang = (langKey in LOCALE ? langKey : "en") as Lang;

  let bestVoice: SpeechSynthesisVoice | null = null;
  let highestScore = -1000;

  for (const voice of voices) {
    const s = scoreVoice(voice, targetLang);
    if (s > highestScore) {
      highestScore = s;
      bestVoice = voice;
    }
  }

  return bestVoice;
}

/**
 * Cleans text for child-friendly speech synthesis.
 * Strips leading/trailing emojis that screen readers awkwardly announce as descriptions.
 */
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Determine the optimal pitch for an encouraging, chipper teacher cadence.
 */
function getTeacherPitch(lang: Lang): number {
  switch (lang) {
    case "zh":
    case "ja":
    case "ko":
      return 1.1; // Gentle, clear, avoids shrillness in high-frequency Asian languages
    case "ar":
    case "ru":
    case "de":
      return 1.12;
    default:
      return 1.16; // Upbeat, friendly, encouraging teacher pitch
  }
}

/**
 * Speak with a warm, encouraging, chipper teacher voice using the Web Speech API.
 * Prioritizes high-quality voices like 'Google US English' or 'Microsoft Aria', with a
 * robust fallback mechanism to guarantee non-English languages are accurately identified
 * and pronounced without reverting to English phonemes.
 */
export function speak(text: string | undefined | null, lang: Lang) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!text || typeof text !== "string" || text.trim() === "" || text === "undefined") return;

  const spokenText = cleanTextForSpeech(text);
  if (!spokenText) return;

  try {
    window.speechSynthesis.cancel();

    if (!voices || voices.length === 0) {
      loadVoices();
    }

    const u = new SpeechSynthesisUtterance(spokenText);
    const targetLocale = LOCALE[lang] || "en-US";
    // Ensure SpeechSynthesisUtterance.lang is dynamically set to the exact language code (e.g., 'pt-BR')
    u.lang = targetLocale;

    const voice = getTeacherVoice(lang);

    if (voice) {
      u.voice = voice;
    } else {
      /**
       * CRITICAL FALLBACK MECHANISM FOR NON-ENGLISH LANGUAGES:
       * When no matching voice object is registered in getVoices():
       * 1. NEVER assign an English voice to non-English text.
       * 2. Leave u.voice as null / undefined so the browser's native text-to-speech engine
       *    delegates to its internal synthesizer for that specific language code.
       * 3. Provide the primary BCP-47 locale tag so the OS or browser accurately identifies
       *    and pronounces foreign phonemes.
       */
      u.voice = null;
    }

    // Chipper teacher cadence:
    // Slightly elevated upbeat pitch + clear, highly articulate enunciation (0.92) for speech therapy & early learners
    u.pitch = getTeacherPitch(lang);
    u.rate = 0.92;
    u.volume = 1.0;

    window.speechSynthesis.speak(u);
  } catch (err) {
    console.warn("Speech synthesis error:", err);
  }
}

export function playAudio(src: string) {
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio(src);
    audio.play().catch((e) => console.warn(`Failed to play audio from ${src}:`, e));
  } catch {
    // Ignore audio playback errors
  }
}

type SR = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export function getRecognizer(lang: Lang): SR | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SR;
    webkitSpeechRecognition?: new () => SR;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  try {
    const rec = new Ctor();
    rec.lang = LOCALE[lang] || "en-US";
    rec.interimResults = false;
    return rec;
  } catch {
    return null;
  }
}

// Fallback question templates in case category doesn't have a direct key for a language
const DEFAULT_QUESTIONS: Record<Lang, (name: string) => string> = {
  en: (name) => `Which ${name || "one"} do you like?`,
  es: (name) => `¿Qué ${name || "opción"} te gusta más?`,
  pt: (name) => `Qual ${name || "opção"} você mais gosta?`,
  zh: (name) => `你最喜欢哪个${name || "选项"}？`,
  it: (name) => `Quale ${name || "opzione"} ti piace di più?`,
  fr: (name) => `Quel ${name || "choix"} préfères-tu ?`,
  ja: (name) => `どの${name || "もの"}がすきですか？`,
  ko: (name) => `어떤 ${name || "것"}을 가장 좋아하나요?`,
  ru: (name) => `Что из ${name || "этого"} тебе нравится?`,
  nl: (name) => `Welke ${name || "optie"} vind je het leukst?`,
  de: (name) => `Welches ${name || "von diesen"} magst du am liebsten?`,
  el: (name) => `Ποιο ${name || "από αυτά"} σου αρέσει περισσότερο;`,
  ar: (name) => `أي ${name || "واحد"} تفضل أكثر؟`,
};

/** Get the localized question for a category, ensuring it is never empty or undefined */
export function getCategoryQuestion(
  cat: { question?: Record<string, string>; labels?: Record<string, string> } | undefined | null,
  lang: Lang,
): string {
  if (!cat) return DEFAULT_QUESTIONS[lang]("choice");

  if (cat.question && typeof cat.question[lang] === "string" && cat.question[lang].trim() !== "") {
    return cat.question[lang];
  }
  // Try English, then Spanish, then Arabic
  const fallbackQ =
    cat.question?.en ||
    cat.question?.es ||
    cat.question?.ar ||
    Object.values(cat.question || {})[0];
  if (fallbackQ && lang === "en") return fallbackQ;

  const catName = (cat.labels && (cat.labels[lang] || cat.labels.en || cat.labels.es)) || "choice";
  const formatter = DEFAULT_QUESTIONS[lang] || DEFAULT_QUESTIONS.en;
  return formatter(catName.toLowerCase());
}

/** Get the localized label for a category option, never undefined */
export function getOptionLabel(
  opt: { labels?: Record<string, string>; emoji?: string } | undefined | null,
  lang: Lang,
): string {
  if (!opt) return "";
  if (opt.labels && typeof opt.labels[lang] === "string" && opt.labels[lang].trim() !== "") {
    return opt.labels[lang];
  }
  // Fallback chain: en -> es -> ar -> first available label -> emoji
  return (
    opt.labels?.en ||
    opt.labels?.es ||
    opt.labels?.ar ||
    (opt.labels ? Object.values(opt.labels)[0] : "") ||
    opt.emoji ||
    "Choice"
  );
}

/** Get the localized category name, never undefined */
export function getCategoryLabel(
  cat: { labels?: Record<string, string> } | undefined | null,
  lang: Lang,
): string {
  if (!cat || !cat.labels) return "";
  if (typeof cat.labels[lang] === "string" && cat.labels[lang].trim() !== "") {
    return cat.labels[lang];
  }
  return cat.labels.en || cat.labels.es || cat.labels.ar || Object.values(cat.labels)[0] || "";
}

export const UI_TEXT: Record<
  Lang,
  {
    roster: string;
    addStudent: string;
    whoPlaying: string;
    hi: string;
    pickFavorites: string;
    simple: string;
    advanced: string;
    round: string;
    faceOff: string;
    journey: string;
    rounds: string;
    sayPrompt: string;
    say: string;
    done: string;
    starEarned: string;
    playAgain: string;
    backToRoster: string;
    stillThere: string;
    tapToStay: string;
  }
> = {
  en: {
    roster: "Class Roster",
    addStudent: "Add student",
    whoPlaying: "Who's playing?",
    hi: "Hi",
    pickFavorites: "pick your favorites",
    simple: "Simple",
    advanced: "Advanced",
    round: "Round",
    faceOff: "Face off!",
    journey: "Your journey",
    rounds: "rounds",
    sayPrompt: 'say: "I like to play with ___"',
    say: "say",
    done: "You did it!",
    starEarned: "You earned a golden star",
    playAgain: "Play again",
    backToRoster: "Back to friends",
    stillThere: "Are you still there?",
    tapToStay: "Tap to keep playing",
  },
  es: {
    roster: "Lista de clase",
    addStudent: "Agregar estudiante",
    whoPlaying: "¿Quién juega?",
    hi: "Hola",
    pickFavorites: "elige tus favoritos",
    simple: "Simple",
    advanced: "Avanzado",
    round: "Ronda",
    faceOff: "¡A competir!",
    journey: "Tu viaje",
    rounds: "rondas",
    sayPrompt: 'di: "Me gusta jugar con ___"',
    say: "di",
    done: "¡Lo lograste!",
    starEarned: "Ganaste una estrella dorada",
    playAgain: "Jugar otra vez",
    backToRoster: "Volver a amigos",
    stillThere: "¿Sigues ahí?",
    tapToStay: "Toca para seguir jugando",
  },
  pt: {
    roster: "Lista da Turma",
    addStudent: "Adicionar aluno",
    whoPlaying: "Quem vai jogar?",
    hi: "Olá",
    pickFavorites: "escolha seus favoritos",
    simple: "Simples",
    advanced: "Avançado",
    round: "Rodada",
    faceOff: "Duelo!",
    journey: "Sua jornada",
    rounds: "rodadas",
    sayPrompt: 'diga: "Eu gosto de brincar com ___"',
    say: "diga",
    done: "Você conseguiu!",
    starEarned: "Você ganhou uma estrela dourada",
    playAgain: "Jogar novamente",
    backToRoster: "Voltar aos amigos",
    stillThere: "Ainda está aí?",
    tapToStay: "Toque para continuar",
  },
  zh: {
    roster: "班级花名册",
    addStudent: "添加学生",
    whoPlaying: "谁来玩？",
    hi: "你好",
    pickFavorites: "选择你的最爱",
    simple: "简单",
    advanced: "高级",
    round: "回合",
    faceOff: "对决！",
    journey: "你的旅程",
    rounds: "轮",
    sayPrompt: "说：“我喜欢玩___”",
    say: "说",
    done: "你做到了！",
    starEarned: "你赢得了一颗金星",
    playAgain: "再玩一次",
    backToRoster: "返回朋友列表",
    stillThere: "你还在吗？",
    tapToStay: "点击继续游戏",
  },
  it: {
    roster: "Registro di Classe",
    addStudent: "Aggiungi studente",
    whoPlaying: "Chi gioca?",
    hi: "Ciao",
    pickFavorites: "scegli i tuoi preferiti",
    simple: "Semplice",
    advanced: "Avanzato",
    round: "Round",
    faceOff: "Sfida!",
    journey: "Il tuo viaggio",
    rounds: "round",
    sayPrompt: 'di\': "Mi piace giocare con ___"',
    say: "di'",
    done: "Ce l'hai fatta!",
    starEarned: "Hai guadagnato una stella dorata",
    playAgain: "Gioca di nuovo",
    backToRoster: "Torna agli amici",
    stillThere: "Ci sei ancora?",
    tapToStay: "Tocca per continuare",
  },
  fr: {
    roster: "Liste de Classe",
    addStudent: "Ajouter un élève",
    whoPlaying: "Qui joue ?",
    hi: "Bonjour",
    pickFavorites: "choisis tes préférés",
    simple: "Simple",
    advanced: "Avancé",
    round: "Manche",
    faceOff: "Duel !",
    journey: "Ton parcours",
    rounds: "manches",
    sayPrompt: "dis : « J'aime jouer avec ___ »",
    say: "dis",
    done: "Tu as réussi !",
    starEarned: "Tu as gagné une étoile dorée",
    playAgain: "Rejouer",
    backToRoster: "Retour aux amis",
    stillThere: "Es-tu toujours là ?",
    tapToStay: "Touche pour continuer",
  },
  ja: {
    roster: "クラス名簿",
    addStudent: "せいとを追加",
    whoPlaying: "だれがあそぶ？",
    hi: "こんにちは",
    pickFavorites: "すきなものをえらぼう",
    simple: "かんたん",
    advanced: "ステップアップ",
    round: "ラウンド",
    faceOff: "たいけつ！",
    journey: "ぼうけんのきろく",
    rounds: "回",
    sayPrompt: "はなしてね:「___がすき」",
    say: "いってね",
    done: "できたね！",
    starEarned: "きんの星をゲットしたよ",
    playAgain: "もう一度あそぶ",
    backToRoster: "おともだちにもどる",
    stillThere: "まだそこにいるかな？",
    tapToStay: "タップしてつづける",
  },
  ko: {
    roster: "학급 명단",
    addStudent: "학생 추가",
    whoPlaying: "누가 플레이하나요?",
    hi: "안녕",
    pickFavorites: "좋아하는 것을 골라보세요",
    simple: "기본",
    advanced: "심화",
    round: "라운드",
    faceOff: "대결!",
    journey: "나의 여정",
    rounds: "라운드",
    sayPrompt: '말해보세요: "나는 ___를 좋아해요"',
    say: "말하기",
    done: "해냈어요!",
    starEarned: "황금 별을 획득했어요",
    playAgain: "다시 하기",
    backToRoster: "친구들에게 돌아가기",
    stillThere: "아직 하고 있나요?",
    tapToStay: "계속하려면 탭하세요",
  },
  ru: {
    roster: "Список класса",
    addStudent: "Добавить ученика",
    whoPlaying: "Кто играет?",
    hi: "Привет",
    pickFavorites: "выбери любимое",
    simple: "Простой",
    advanced: "Сложный",
    round: "Раунд",
    faceOff: "Поединок!",
    journey: "Твое путешествие",
    rounds: "раундов",
    sayPrompt: 'скажи: "Мне нравится играть с ___"',
    say: "скажи",
    done: "У тебя получилось!",
    starEarned: "Ты получаешь золотую звезду",
    playAgain: "Сыграть снова",
    backToRoster: "Вернуться к друзьям",
    stillThere: "Ты еще здесь?",
    tapToStay: "Нажми, чтобы продолжить",
  },
  nl: {
    roster: "Klassenlijst",
    addStudent: "Leerling toevoegen",
    whoPlaying: "Wie speelt er?",
    hi: "Hoi",
    pickFavorites: "kies je favorieten",
    simple: "Eenvoudig",
    advanced: "Gevorderd",
    round: "Ronde",
    faceOff: "Kies!",
    journey: "Jouw reis",
    rounds: "rondes",
    sayPrompt: 'zeg: "Ik speel graag met ___"',
    say: "zeg",
    done: "Goed gedaan!",
    starEarned: "Je hebt een gouden ster verdiend",
    playAgain: "Nog eens spelen",
    backToRoster: "Terug naar vriendjes",
    stillThere: "Ben je er nog?",
    tapToStay: "Tik om verder te spelen",
  },
  de: {
    roster: "Klassenliste",
    addStudent: "Schüler hinzufügen",
    whoPlaying: "Wer spielt mit?",
    hi: "Hallo",
    pickFavorites: "wähle deine Favoriten",
    simple: "Einfach",
    advanced: "Erweitert",
    round: "Runde",
    faceOff: "Duell!",
    journey: "Deine Reise",
    rounds: "Runden",
    sayPrompt: 'sag: "Ich spiele gerne mit ___"',
    say: "sag",
    done: "Geschafft!",
    starEarned: "Du hast einen goldenen Stern verdient",
    playAgain: "Nochmal spielen",
    backToRoster: "Zurück zu den Freunden",
    stillThere: "Bist du noch da?",
    tapToStay: "Tippe, um weiterzuspelen",
  },
  el: {
    roster: "Μαθητολόγιο",
    addStudent: "Προσθήκη μαθητή",
    whoPlaying: "Ποιος παίζει;",
    hi: "Γεια σου",
    pickFavorites: "διάλεξε τα αγαπημένα σου",
    simple: "Απλό",
    advanced: "Προχωρημένο",
    round: "Γύρος",
    faceOff: "Αναμέτρηση!",
    journey: "Το ταξίδι σου",
    rounds: "γύροι",
    sayPrompt: "πες: «Μου αρέσει να παίζω με ___»",
    say: "πες",
    done: "Τα κατάφερες!",
    starEarned: "Κέρδισες ένα χρυσό αστέρι",
    playAgain: "Παίξε ξανά",
    backToRoster: "Πίσω στους φίλους",
    stillThere: "Είσαι ακόμα εδώ;",
    tapToStay: "Άγγιξε για να συνεχίσεις",
  },
  ar: {
    roster: "قائمة الصف",
    addStudent: "إضافة طالب",
    whoPlaying: "من يلعب؟",
    hi: "مرحبا",
    pickFavorites: "اختر المفضلة لديك",
    simple: "بسيط",
    advanced: "متقدم",
    round: "جولة",
    faceOff: "المواجهة!",
    journey: "رحلتك",
    rounds: "جولات",
    sayPrompt: 'قل: "أحب أن ألعب بـ ___"',
    say: "قل",
    done: "أحسنت!",
    starEarned: "حصلت على نجمة ذهبية",
    playAgain: "العب مرة أخرى",
    backToRoster: "العودة للأصدقاء",
    stillThere: "هل ما زلت هنا؟",
    tapToStay: "المس للاستمرار",
  },
};
