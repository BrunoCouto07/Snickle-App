import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Crown, Sparkles, Star, Trophy, Volume2 } from "lucide-react";
import type { Category, CategoryOption, Lang } from "@/lib/app-types";
import { getCategoryLabel, getOptionLabel, speak } from "@/lib/speech";

export interface BracketResult {
  category: Category;
  contenders: CategoryOption[];
  semiWinners?: CategoryOption[];
  champion: CategoryOption;
  mode?: "simple" | "advanced";
}

interface TournamentBracketProps {
  results: BracketResult[];
  lang: Lang;
  studentName?: string;
}

export function TournamentBracket({
  results,
  lang,
  studentName = "Champion",
}: TournamentBracketProps) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  if (!results || results.length === 0) {
    return null;
  }

  const currentResult = results[activeCategoryIndex] || results[0];
  const { category, contenders, semiWinners = [], champion } = currentResult;

  const categoryLabel = getCategoryLabel(category, lang);

  // Semifinalists: If we tracked them, use them; otherwise pick champion and the second most likely
  const semi1Winner =
    semiWinners[0] ||
    (contenders.slice(0, 2).some((c) => c.id === champion.id) ? champion : contenders[0]);
  const semi2Winner =
    semiWinners[1] ||
    (contenders.slice(2, 4).some((c) => c.id === champion.id)
      ? champion
      : contenders[2] || contenders[1]);

  const leftPair = contenders.slice(0, 2);
  const rightPair = contenders.length >= 4 ? contenders.slice(2, 4) : contenders.slice(2);

  const handleSpeak = (text: string) => {
    speak(text, lang);
  };

  return (
    <div className="w-full my-6 rounded-3xl border-3 border-ink bg-[#FFFDF9] p-4 sm:p-6 shadow-[4px_4px_0_#3A2E28] overflow-hidden">
      {/* Header with Title and Category Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-ink/10">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl border-2 border-ink bg-[#FFDD00] shadow-[2px_2px_0_#3A2E28]">
            <Trophy className="size-6 text-ink fill-honey" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-coral">
                Tournament Bracket
              </span>
              <Sparkles className="size-3.5 text-honey animate-pulse" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-black text-ink">
              {categoryLabel} Face-Off
            </h3>
          </div>
        </div>

        {/* If multiple categories completed in this session, show tabs */}
        {results.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 bg-paper/80 border-2 border-ink/10 rounded-2xl p-1">
            {results.map((res, idx) => (
              <button
                key={res.category.id}
                onClick={() => setActiveCategoryIndex(idx)}
                className={`font-display flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryIndex === idx
                    ? "bg-ink text-cream shadow-[2px_2px_0_#FFC63F]"
                    : "bg-transparent text-ink hover:bg-card-warm"
                }`}
              >
                <span>{res.category.emoji || "⭐"}</span>
                <span>{getCategoryLabel(res.category, lang)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Subtitle / Context */}
      <p className="mt-3 text-xs sm:text-sm font-semibold text-inksoft text-center sm:text-left">
        See how <span className="font-bold text-ink">{studentName}</span>&apos;s favorites went
        head-to-head in the tournament to claim the Winner Podium!
      </p>

      {/* Gamified Tournament Bracket Flow */}
      <div className="relative mt-6 pt-2 pb-4">
        {/* Desktop / Tablet Bracket Layout: Left Semifinal ➡️ Central Winner Podium ⬅️ Right Semifinal */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-6 sm:gap-4">
          {/* LEFT BRANCH: Semifinal Match 1 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-inksoft bg-card-warm/80 border border-ink/10 px-2 py-0.5 rounded-full">
                Round 1 · Match A
              </span>
              <span className="text-[10px] font-bold text-leaf">Semifinal 1</span>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              {leftPair.map((opt, i) => {
                const isChampion = opt.id === champion.id;
                const isSemiWinner = opt.id === semi1Winner?.id || isChampion;
                const label = getOptionLabel(opt, lang);

                return (
                  <motion.div
                    key={opt.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleSpeak(label)}
                    className={`relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      isChampion
                        ? "border-honey bg-honey/15 shadow-[3px_3px_0_#F59E0B]"
                        : isSemiWinner
                          ? "border-sky/60 bg-sky/10 shadow-[2px_2px_0_#38BDF8]"
                          : "border-ink/15 bg-paper hover:bg-card-warm shadow-[2px_2px_0_#3A2E28]"
                    }`}
                  >
                    {/* Option Visual */}
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-ink/10 bg-white overflow-hidden shadow-xs">
                      {opt.photoUrl ? (
                        <img src={opt.photoUrl} alt={label} className="size-full object-cover" />
                      ) : (
                        <span className="text-2xl" aria-hidden>
                          {opt.emoji || "⭐"}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-sm text-ink truncate">{label}</p>
                      <p className="text-[10px] font-semibold text-inksoft">
                        {isChampion
                          ? "🏆 Grand Winner"
                          : isSemiWinner
                            ? "⭐ Won Match A"
                            : `Contender #${i + 1}`}
                      </p>
                    </div>

                    {isSemiWinner && (
                      <span className="grid size-6 place-items-center rounded-full bg-honey border border-ink text-ink text-xs font-black shadow-xs shrink-0">
                        <Check className="size-3.5 stroke-[3]" />
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(label);
                      }}
                      className="size-7 grid place-items-center rounded-lg hover:bg-ink/5 text-inksoft hover:text-ink cursor-pointer"
                      title="Pronounce"
                    >
                      <Volume2 className="size-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Visual connector line indicating flow to center on desktop */}
            <div className="hidden lg:flex items-center justify-end pr-2 text-inksoft">
              <span className="text-xs font-black text-honey">Funneling to Final ▶</span>
            </div>
          </div>

          {/* CENTER: WINNER PODIUM (Celebratory Bouncy Pop-In) */}
          <div className="flex flex-col items-center justify-center my-2 sm:my-0 px-2 sm:px-6">
            <motion.div
              initial={{ scale: 0.1, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 14,
                mass: 0.8,
                delay: 0.15,
              }}
              className="relative flex flex-col items-center"
            >
              {/* Floating Stars and Sparkles */}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                className="absolute -top-6 -left-6 z-20 text-3xl pointer-events-none"
              >
                ✨
              </motion.div>
              <motion.div
                animate={{ rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className="absolute -top-7 -right-6 z-20 text-3xl pointer-events-none"
              >
                🌟
              </motion.div>

              {/* Floating Crown over the champion card */}
              <motion.div
                initial={{ y: -25, opacity: 0 }}
                animate={{ y: [0, -6, 0], opacity: 1 }}
                transition={{
                  y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                  opacity: { duration: 0.4 },
                }}
                className="z-20 mb-[-12px] flex items-center gap-1.5 rounded-full border-2 border-ink bg-[#FFDD00] px-4 py-1 text-xs font-black text-ink shadow-[2px_2px_0_#3A2E28]"
              >
                <Crown className="size-4 fill-ink text-ink" />
                <span>CHAMPION CHOICE!</span>
              </motion.div>

              {/* Champion Card */}
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSpeak(getOptionLabel(champion, lang))}
                className="relative z-10 w-64 sm:w-72 rounded-3xl border-3 border-ink bg-white p-4 shadow-[5px_5px_0_#3A2E28] text-center cursor-pointer overflow-hidden"
              >
                {/* Golden Glow Backdrop inside card */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#FFF9E6] via-white to-[#FFF3CC] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative mb-3 grid size-24 sm:size-28 place-items-center rounded-2xl border-3 border-ink bg-[#FFF9E6] shadow-[3px_3px_0_#FFDD00] overflow-hidden">
                    {champion.photoUrl ? (
                      <img
                        src={champion.photoUrl}
                        alt={getOptionLabel(champion, lang)}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl sm:text-6xl" aria-hidden>
                        {champion.emoji || "⭐"}
                      </span>
                    )}

                    <div className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-[#FFDD00] border-2 border-ink shadow-xs">
                      <Star className="size-4 fill-ink text-ink" />
                    </div>
                  </div>

                  <h4 className="font-display text-xl sm:text-2xl font-black text-ink tracking-tight">
                    {getOptionLabel(champion, lang)}
                  </h4>

                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-ink/20 bg-honey/20 px-3 py-1 text-xs font-bold text-ink">
                      <Trophy className="size-3.5 text-honey fill-honey" /> #1 Pick Today
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(getOptionLabel(champion, lang));
                      }}
                      className="grid size-7 place-items-center rounded-full border border-ink/15 bg-paper hover:bg-honey transition-colors cursor-pointer"
                      title="Pronounce Winner"
                    >
                      <Volume2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* 3D WINNER PODIUM STAND */}
              <div className="relative -mt-2 w-72 sm:w-80 flex flex-col items-center">
                {/* Top tier with number 1 */}
                <div className="h-10 w-full rounded-2xl border-3 border-ink bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] flex items-center justify-center shadow-[4px_4px_0_#3A2E28]">
                  <span className="font-display font-black text-xl text-ink tracking-wider flex items-center gap-2">
                    <span>★</span> 1ST PLACE <span>★</span>
                  </span>
                </div>
                {/* Podium Base */}
                <div className="h-6 w-[86%] rounded-b-2xl border-x-3 border-b-3 border-ink bg-[#D97706] flex items-center justify-center shadow-[3px_3px_0_#3A2E28]">
                  <span className="text-[10px] font-black uppercase text-cream/90 tracking-widest">
                    SNICKLE TOURNAMENT
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT BRANCH: Semifinal Match 2 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-leaf">Semifinal 2</span>
              <span className="text-[11px] font-black uppercase tracking-wider text-inksoft bg-card-warm/80 border border-ink/10 px-2 py-0.5 rounded-full">
                Round 1 · Match B
              </span>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              {rightPair.map((opt, i) => {
                const isChampion = opt.id === champion.id;
                const isSemiWinner = opt.id === semi2Winner?.id || isChampion;
                const label = getOptionLabel(opt, lang);

                return (
                  <motion.div
                    key={opt.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleSpeak(label)}
                    className={`relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      isChampion
                        ? "border-honey bg-honey/15 shadow-[3px_3px_0_#F59E0B]"
                        : isSemiWinner
                          ? "border-sky/60 bg-sky/10 shadow-[2px_2px_0_#38BDF8]"
                          : "border-ink/15 bg-paper hover:bg-card-warm shadow-[2px_2px_0_#3A2E28]"
                    }`}
                  >
                    {/* Option Visual */}
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-ink/10 bg-white overflow-hidden shadow-xs">
                      {opt.photoUrl ? (
                        <img src={opt.photoUrl} alt={label} className="size-full object-cover" />
                      ) : (
                        <span className="text-2xl" aria-hidden>
                          {opt.emoji || "⭐"}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-sm text-ink truncate">{label}</p>
                      <p className="text-[10px] font-semibold text-inksoft">
                        {isChampion
                          ? "🏆 Grand Winner"
                          : isSemiWinner
                            ? "⭐ Won Match B"
                            : `Contender #${i + 3}`}
                      </p>
                    </div>

                    {isSemiWinner && (
                      <span className="grid size-6 place-items-center rounded-full bg-honey border border-ink text-ink text-xs font-black shadow-xs shrink-0">
                        <Check className="size-3.5 stroke-[3]" />
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(label);
                      }}
                      className="size-7 grid place-items-center rounded-lg hover:bg-ink/5 text-inksoft hover:text-ink cursor-pointer"
                      title="Pronounce"
                    >
                      <Volume2 className="size-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Visual connector line indicating flow to center on desktop */}
            <div className="hidden lg:flex items-center justify-start pl-2 text-inksoft">
              <span className="text-xs font-black text-honey">◀ Funneling to Final</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
