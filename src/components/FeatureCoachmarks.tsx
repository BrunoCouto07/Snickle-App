import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronRight, Sparkles, X } from "lucide-react";
import {
  type CoachmarkScreen,
  getSeenCoachmarkScreens,
  markCoachmarkScreenSeen,
} from "@/lib/coachmarks";

interface Hint {
  title: string;
  desc: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  tag: string;
}

const HINTS: Record<CoachmarkScreen, Hint[]> = {
  roster: [
    {
      title: "Personalized Face-Off Choices",
      desc: "Tap any student to launch their 1-on-1 choice adventure with golden stars, cheering audio, and confetti!",
      position: "center",
      tag: "Student Roster",
    },
    {
      title: "Multilingual Spoken Audio",
      desc: "Switch between 13 spoken languages with warm, friendly teacher audio for non-readers and dual-language learners.",
      position: "top",
      tag: "Language Selector",
    },
    {
      title: "Add Students & Custom Worlds",
      desc: "Add new learners, assign team worlds (Space, Dino, Safari, Galaxy), and set 100% private on-device photos.",
      position: "bottom",
      tag: "Roster Management",
    },
    {
      title: "Teacher Dashboard & Printables",
      desc: "Access individual progress treats, classroom printables, and category controls with a quick PIN or math check.",
      position: "top",
      tag: "Teacher Security",
    },
  ],
  game: [
    {
      title: "Warm Teacher Audio",
      desc: "Tap the speaker icon anytime to hear the question read aloud in a warm, encouraging teacher voice.",
      position: "top",
      tag: "Listen Aloud",
    },
    {
      title: "Low-Stress Binary Face-Off",
      desc: "Students tap their favorite of two options. The bracket advances smoothly without overwhelming grids.",
      position: "center",
      tag: "Choice Cards",
    },
    {
      title: "Spoken Verbal Mic",
      desc: "Encourages expressive verbal communication by letting students speak their answer aloud into the mic.",
      position: "bottom",
      tag: "Voice Practice",
    },
    {
      title: "Simple vs. Advanced Modes",
      desc: "Toggle between a focused 4-item bracket or a wider 6-item view to meet each student's developmental needs.",
      position: "top",
      tag: "Differentiated View",
    },
  ],
  "admin-insights": [
    {
      title: "Smart Activity Center Grouping",
      desc: "Automatically groups students by shared favorite choices for smooth, collaborative center rotations.",
      position: "top",
      tag: "Instant Groupings",
    },
    {
      title: "Individualized Progress Treats",
      desc: "View stars earned with class average benchmarks (e.g. 32 stars vs. class average 23) to celebrate with proud parents.",
      position: "center",
      tag: "Parent Reports",
    },
  ],
  "admin-roster": [
    {
      title: "Themed Worlds & Frames",
      desc: "Organize students into Space, Dino, Safari, or custom classroom team frames they love recognizing.",
      position: "center",
      tag: "Custom Worlds",
    },
    {
      title: "100% On-Device Photos",
      desc: "Crop and rotate photos locally—photos never leave this device, ensuring complete student privacy.",
      position: "top",
      tag: "Private Photos",
    },
  ],
  "admin-categories": [
    {
      title: "AI & Library Auto-Fill",
      desc: "Instantly generate 4 age-appropriate choice cards for new classroom topics or routines with one tap.",
      position: "top",
      tag: "Instant Cards",
    },
    {
      title: "Keep-It-Fresh Item Rotation",
      desc: "Automatically cycle new library items into choice sessions so students stay engaged all year long.",
      position: "bottom",
      tag: "Smart Rotation",
    },
  ],
  "admin-settings": [
    {
      title: "Security PIN & Themes",
      desc: "Customize your 4-digit teacher code, update class name, and switch between classroom visual themes.",
      position: "top",
      tag: "Security & Themes",
    },
    {
      title: "Classroom Backup & Device Sync",
      desc: "Download full JSON snapshots to safely transfer student records and categories between classroom iPads.",
      position: "bottom",
      tag: "Offline Backup",
    },
  ],
  "admin-printables": [
    {
      title: "Screen-Free Physical Materials",
      desc: "Generate printable student badge cards, choice posters, and center signs for on-the-go routines without screens.",
      position: "center",
      tag: "Print & Go",
    },
  ],
};

interface Props {
  screen: CoachmarkScreen;
  enabled?: boolean;
}

export function FeatureCoachmarks({ screen, enabled = true }: Props) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }
    const seen = getSeenCoachmarkScreens();
    if (!seen.includes(screen)) {
      setIndex(0);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [screen, enabled]);

  const markScreenSeen = () => {
    setVisible(false);
    markCoachmarkScreenSeen(screen);
  };

  const hints = HINTS[screen] || [];
  if (!visible || hints.length === 0 || !enabled) return null;

  const hint = hints[index];
  const isLast = index >= hints.length - 1;

  const next = () => {
    if (isLast) {
      markScreenSeen();
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-45 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-[2px] transition-all cursor-pointer"
      onClick={markScreenSeen}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${screen}-${index}`}
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm rounded-3xl border-2 border-honey/80 bg-neutral-900 p-5 text-cream shadow-2xl"
          style={{
            boxShadow: "0 20px 35px -5px rgba(0, 0, 0, 0.6), 0 0 0 2px rgba(255, 198, 63, 0.3)",
          }}
        >
          {/* Chat bubble pointer tail pointing dynamically */}
          <div
            className={`absolute size-4 rotate-45 border-neutral-900 bg-neutral-900 ${
              hint.position === "bottom"
                ? "-top-2 left-1/2 -translate-x-1/2 border-l-2 border-t-2 border-honey/80"
                : hint.position === "top"
                  ? "-bottom-2 left-1/2 -translate-x-1/2 border-r-2 border-b-2 border-honey/80"
                  : hint.position === "left"
                    ? "-right-2 top-1/2 -translate-y-1/2 border-r-2 border-t-2 border-honey/80"
                    : hint.position === "right"
                      ? "-left-2 top-1/2 -translate-y-1/2 border-l-2 border-b-2 border-honey/80"
                      : "hidden"
            }`}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-display inline-flex items-center gap-1 rounded-full bg-honey/20 border border-honey/40 px-2.5 py-0.5 text-[11px] font-bold text-honey">
              <Sparkles className="size-3" /> {hint.tag}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-cream/60">
                {index + 1} of {hints.length}
              </span>
              <button
                onClick={markScreenSeen}
                aria-label="Close walkthrough"
                className="text-cream/50 hover:text-cream transition-colors p-1"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <h4 className="font-display text-base font-bold text-cream mb-1.5 flex items-center gap-1.5">
            💬 {hint.title}
          </h4>
          <p className="text-xs text-cream/80 leading-relaxed mb-4">{hint.desc}</p>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-cream/10">
            <button
              onClick={markScreenSeen}
              className="text-[11px] font-bold text-cream/60 hover:text-cream transition-colors underline"
            >
              Skip hints
            </button>
            <button
              onClick={next}
              className="font-display inline-flex items-center gap-1 rounded-xl bg-honey px-3.5 py-1.5 text-xs font-bold text-ink shadow-[2px_2px_0_#FFF] hover:bg-honey/90 hover:translate-y-[1px] transition-all"
            >
              {isLast ? (
                <>
                  Got it! <Check className="size-3.5" />
                </>
              ) : (
                <>
                  Next <ChevronRight className="size-3.5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
