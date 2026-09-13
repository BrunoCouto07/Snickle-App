import { useState } from "react";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Heart,
  Home,
  Mail,
  Printer,
  ShieldCheck,
  Sparkles,
  Users,
  Volume2,
  X,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Step {
  title: string;
  badge: string;
  icon: React.ReactNode;
  content: string;
  highlights: { title: string; desc: string }[];
}

const STEPS: Step[] = [
  {
    title: "Welcome to Kid Choices Connect",
    badge: "Heart & Legacy in Education",
    icon: <GraduationCap className="size-8 text-honey" />,
    content:
      "Crafted by an elementary intensive needs paraprofessional, daycare administrator, and Pre-K educator stepping into full teaching after years of learning from the pros. Blending insights from aviation, healthcare, banking, and management with a father's mission to ignite genuine joy and engagement in education.",
    highlights: [
      {
        title: "Ignited by a 4-Year-Old's Honesty",
        desc: "Born after a young student admitted school felt 'boring' despite hours of classroom prep—sparking a mission to ditch pen-and-paper grids and make daily routines exciting.",
      },
      {
        title: "Father's Legacy for the Future",
        desc: "Inspired by my 5-year-old son and 7-year-old daughter to leave a lasting impact by meeting every child where they are and making learning fun.",
      },
    ],
  },
  {
    title: "From Pre-K/ECSE to 5th Grade & Modern Families",
    badge: "Classrooms & Co-Parenting",
    icon: <Home className="size-8 text-sky" />,
    content:
      "While oversized tap targets and friendly animations welcome little hands in Pre-K, extensive customizability makes it equally impactful for upper elementary grades (through 5th grade) and busy households.",
    highlights: [
      {
        title: "Co-Parenting Consistency",
        desc: "Originally conceived to simplify meal choices and daily routines between two households, maintaining consistency and removing parent manipulation.",
      },
      {
        title: "Flexible For Every Grade Level",
        desc: "Customize centers, reading rotations, sensory breaks, recess choices, and classroom tasks tailored to any age group or IEP.",
      },
    ],
  },
  {
    title: "Binary Face-Off Choices & Warm Teacher Audio",
    badge: "Student Autonomy",
    icon: <Sparkles className="size-8 text-coral" />,
    content:
      "Ditch overwhelming grids. Students compare two choices head-to-head in a low-anxiety bracket, receiving warm spoken audio prompts, confetti celebrations, and collectible stars.",
    highlights: [
      {
        title: "Chipper Spoken Audio in 13 Languages",
        desc: "Warm teacher voices read every question and choice aloud so non-readers, dual-language learners, and diverse learners participate with total confidence.",
      },
      {
        title: "Harder to Misplace in Busy Classrooms",
        desc: "Replaces loose clipboards with a tap-and-go experience that logs choices automatically in seconds.",
      },
    ],
  },
  {
    title: "Screen-Free Printables & Proud Parent Reports",
    badge: "Tangible Progress",
    icon: <Printer className="size-8 text-leaf" />,
    content:
      "Minimize screen time anytime with ready-to-print choice cards, physical badges, and celebratory individualized reports sent home as a treat for parents.",
    highlights: [
      {
        title: "Individualized Progress Treats",
        desc: "Print progress summaries showing stars earned with quarterly class benchmark context (e.g. 32 stars earned vs. quarterly class average 23).",
      },
      {
        title: "Hands-On Physical Cards",
        desc: "Generate printable choice cards for playground lanyards, sensory walks, or refrigerator routine magnets at home.",
      },
    ],
  },
  {
    title: "Zero-Cloud Privacy & 100% Offline Dependability",
    badge: "Safe & Reliable",
    icon: <ShieldCheck className="size-8 text-leaf" />,
    content:
      "Built for real school realities with spotty Wi-Fi. Kid Choices Connect runs entirely on your device with no required accounts, keeping all student records private.",
    highlights: [
      {
        title: "FERPA & COPPA Safe",
        desc: "Student photos and preference logs stay strictly in your browser's private local storage.",
      },
      {
        title: "One-Click Backup & Transfer",
        desc: "Export full JSON classroom archives anytime to transfer between classroom iPads or backup for the school year.",
      },
    ],
  },
];

interface Props {
  onClose: () => void;
  showFeatureHints?: boolean;
  onToggleFeatureHints?: (enabled: boolean) => void;
  onOpenContact?: () => void;
}

export function OnboardingModal({
  onClose,
  showFeatureHints = true,
  onToggleFeatureHints,
  onOpenContact,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const step = STEPS[currentStep]!;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="card-pop relative flex w-full max-w-lg flex-col overflow-hidden p-6 sm:p-7 my-4"
      >
        {/* Header bar */}
        <div className="mb-4 flex items-center justify-between border-b border-ink/10 pb-3">
          <span className="font-display inline-flex items-center gap-1.5 rounded-full border border-honey/40 bg-honey/15 px-3 py-1 text-xs font-bold text-ink">
            <Sparkles className="size-3.5 text-honey" />
            {step.badge}
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-inksoft hover:text-ink transition-colors"
          >
            Skip tour
          </button>
        </div>

        {/* Content area with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-76"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="grid size-14 place-items-center rounded-2xl border-2 border-ink/10 bg-card-warm shadow-sm shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="font-display text-xl font-bold leading-snug">{step.title}</h3>
                <p className="text-xs font-bold text-inksoft">
                  Step {currentStep + 1} of {STEPS.length}
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-ink/85 mb-4 font-normal">{step.content}</p>

            <div className="space-y-2.5 rounded-2xl border-2 border-ink/10 bg-paper p-3.5 shadow-inner">
              {step.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  <div className="mt-1 size-2 shrink-0 rounded-full bg-honey" />
                  <div>
                    <span className="font-bold text-ink">{h.title}: </span>
                    <span className="text-inksoft leading-relaxed">{h.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feature Walkthrough Hints Checkbox */}
        <div className="mt-4 border-t border-ink/10 pt-3">
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-medium text-ink">
            <input
              type="checkbox"
              checked={showFeatureHints}
              onChange={(e) => onToggleFeatureHints?.(e.target.checked)}
              className="size-4 rounded border-2 border-ink text-honey accent-ink focus:ring-honey"
            />
            <span>Show interactive feature walkthrough hints (pointers) on screens</span>
          </label>
        </div>

        {/* Navigation & dots */}
        <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  currentStep === i ? "w-7 bg-ink" : "w-2.5 bg-ink/20 hover:bg-ink/40"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={prev}
                className="font-display flex h-11 items-center gap-1 rounded-xl border border-ink/15 bg-paper px-3 text-xs font-bold text-ink hover:bg-card-warm"
              >
                <ChevronLeft className="size-4" /> Back
              </button>
            )}
            <button
              onClick={next}
              className="font-display flex h-11 items-center gap-1.5 rounded-xl border-2 border-ink bg-ink px-5 text-sm font-bold text-cream shadow-[2px_2px_0_#FFC63F] hover:opacity-95"
            >
              {currentStep === STEPS.length - 1 ? (
                "Get Started! 🚀"
              ) : (
                <>
                  Next <ChevronRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Creator contact sub-link */}
        {onOpenContact && (
          <div className="mt-3 text-center">
            <button
              onClick={() => {
                onClose();
                onOpenContact();
              }}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-inksoft hover:text-ink underline transition-colors"
            >
              <Mail className="size-3" /> Have an idea or question for the educator? Message creator
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
