import { ExternalLink } from "lucide-react";

interface KofiButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function KofiButton({
  className = "",
  size = "md",
  label = "Support Snickle (Buy me a coffee)",
}: KofiButtonProps) {
  const sizeClasses =
    size === "sm"
      ? "px-3 py-1.5 text-xs rounded-full gap-1.5"
      : size === "lg"
        ? "px-6 py-3.5 text-base rounded-2xl gap-2.5"
        : "px-4 py-2 text-xs sm:text-sm rounded-2xl gap-2";

  return (
    <a
      href="https://ko-fi.com/snickleapp"
      target="_blank"
      rel="noopener noreferrer"
      className={`font-display inline-flex items-center justify-center border-2 border-ink bg-[#FFDD00] text-ink font-black shadow-[3px_3px_0_#3A2E28] hover:bg-[#FFD200] hover:shadow-[1.5px_1.5px_0_#3A2E28] hover:translate-y-[1.5px] active:translate-y-[2.5px] transition-all cursor-pointer select-none ${sizeClasses} ${className}`}
      title="Support Snickle (Buy me a coffee) on Ko-fi"
    >
      <span className="text-base sm:text-lg leading-none shrink-0" aria-hidden>
        ☕
      </span>
      <span className="truncate font-extrabold">{label}</span>
      <ExternalLink className="size-3.5 opacity-65 ml-0.5 shrink-0" />
    </a>
  );
}
