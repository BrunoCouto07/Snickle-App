import { Heart, HelpCircle, Mail, Printer, ShieldCheck, Sparkles, Volume2 } from "lucide-react";
import { SupportTeacherButton } from "./SupportTeacherModal";

interface Props {
  onOpenGuide: () => void;
  onOpenContact: () => void;
  onOpenBackup: () => void;
  onOpenSupport: () => void;
}

export function AppFooter({ onOpenGuide, onOpenContact, onOpenBackup, onOpenSupport }: Props) {
  return (
    <footer className="mt-16 border-t-2 border-ink/10 bg-card-warm/60 py-10 text-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 pb-8 border-b border-ink/10">
          {/* Mission & Background */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="grid size-7 place-items-center rounded-lg bg-honey text-ink text-sm font-bold shadow-xs">
                ⭐
              </span>
              <h4 className="font-display text-base font-bold text-ink">Kid Choices Connect</h4>
            </div>
            <p className="text-xs leading-relaxed text-inksoft mb-3">
              Founded by an elementary intensive needs paraprofessional, daycare administrator,
              Pre-K educator, and father of two. Built to give young learners an engaging voice in
              daily choices and bridge consistent routines between classrooms and co-parenting
              homes.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-bold text-inksoft">
              <span className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-paper px-2.5 py-1">
                <ShieldCheck className="size-3 text-leaf" /> 100% Local Storage
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-paper px-2.5 py-1">
                <Volume2 className="size-3 text-sky" /> 13 Spoken Languages
              </span>
            </div>
          </div>

          {/* Quick Features & Printables */}
          <div className="space-y-2 text-xs">
            <h5 className="font-display font-bold text-ink text-sm mb-2">
              Classroom & Home Support
            </h5>
            <ul className="space-y-2 text-inksoft">
              <li className="flex items-start gap-1.5">
                <span className="text-honey font-bold">•</span>
                <span>
                  <strong className="text-ink">Pre-K to 5th Grade:</strong> Adapts to early learners
                  and upper elementary tasks with customizable pools.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-honey font-bold">•</span>
                <span>
                  <strong className="text-ink">Screen-Free Printables:</strong> Badge lanyards,
                  choice posters, and magnet cards for on-the-go routines.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-honey font-bold">•</span>
                <span>
                  <strong className="text-ink">Proud Parent Reports:</strong> Progress treats
                  comparing stars earned to peer benchmark context.
                </span>
              </li>
            </ul>
          </div>

          {/* Direct Actions & Contact */}
          <div className="flex flex-col justify-between">
            <div>
              <h5 className="font-display font-bold text-ink text-sm mb-2.5">
                Creator Direct Line
              </h5>
              <p className="text-xs leading-relaxed text-inksoft mb-4">
                Have a classroom idea, IEP customization request, or co-parenting routine
                suggestion? Send a direct message to the educator.
              </p>
              <button
                onClick={onOpenContact}
                className="font-display inline-flex items-center gap-2 rounded-2xl border-2 border-ink bg-ink px-4 py-2.5 text-xs font-bold text-cream shadow-[3px_3px_0_#FFC63F] hover:shadow-[1px_1px_0_#FFC63F] hover:translate-y-[1px] transition-all"
              >
                <Mail className="size-4 text-honey" /> Contact the Creator
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <SupportTeacherButton onClick={onOpenSupport} />
              <button
                onClick={onOpenGuide}
                className="font-display rounded-full border border-ink/15 bg-paper px-3 py-1.5 text-xs font-bold text-ink hover:bg-card-warm transition-colors"
              >
                Classroom Guide
              </button>
              <button
                onClick={onOpenBackup}
                className="font-display rounded-full border border-ink/15 bg-paper px-3 py-1.5 text-xs font-bold text-ink hover:bg-card-warm transition-colors"
              >
                Backup & Sync
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-inksoft">
          <p className="font-hand text-base">
            Kid Choices Connect · Built with{" "}
            <Heart className="inline size-3.5 fill-coral text-coral" /> for kids, educators &
            families everywhere
          </p>
          <p className="text-[11px] text-inksoft">
            COPPA & FERPA Minded • Photos & choices stay strictly on this device
          </p>
        </div>
      </div>
    </footer>
  );
}
