import { useState } from "react";
import {
  Check,
  Coffee,
  Copy,
  ExternalLink,
  Github,
  Heart,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { motion } from "motion/react";

export function SupportTeacherModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card-pop relative w-full max-w-md p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-honey/20 text-honey">
              <Coffee className="size-5 text-ink" />
            </span>
            <h2 className="font-display text-xl font-bold">Support a Teacher</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full border-2 border-ink/10 hover:bg-card-warm"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-4 rounded-2xl border-2 border-honey/30 bg-honey/10 p-4 text-xs leading-relaxed text-ink">
          <p className="mb-2 font-bold text-sm">Made with ❤️ for Classrooms Worldwide</p>
          <p className="text-inksoft">
            Kid Choices Connect was built by an early childhood educator to give young students in
            Pre-K, ECSE, and Kindergarten classrooms an accessible, joyful way to express their
            choices. It is 100% free and open for teachers everywhere.
          </p>
        </div>

        <div className="space-y-2.5">
          <a
            href="https://buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-ink bg-honey px-4 text-sm font-bold text-ink shadow-[3px_3px_0_#3A2E28] transition-transform hover:-translate-y-0.5"
          >
            <Coffee className="size-4.5" /> Buy Me a Coffee
            <ExternalLink className="size-3.5 opacity-60 ml-auto" />
          </a>

          <a
            href="https://github.com/BrunoCouto07/kid-choices-connect"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-ink/15 bg-paper px-4 text-sm font-bold text-ink hover:bg-card-warm transition-colors"
          >
            <Github className="size-4" /> Star on GitHub
            <ExternalLink className="size-3.5 opacity-60 ml-auto" />
          </a>

          <button
            type="button"
            onClick={handleShare}
            className="font-display flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-ink/15 bg-paper px-4 text-sm font-bold text-ink hover:bg-card-warm transition-colors"
          >
            {copied ? (
              <>
                <Check className="size-4 text-leaf" /> Link Copied to Clipboard!
              </>
            ) : (
              <>
                <Share2 className="size-4 text-coral" /> Share with Fellow Teachers
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] font-bold text-inksoft">
          Thank you for supporting public educators and accessible classroom tools!
        </p>
      </motion.div>
    </div>
  );
}

export function SupportTeacherButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="font-display inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-paper px-3 py-1.5 text-xs font-bold text-ink hover:bg-honey/20 hover:border-honey transition-colors"
      title="Support this project"
    >
      <Heart className="size-3.5 fill-coral text-coral" />
      <span>Support a Teacher</span>
    </button>
  );
}
