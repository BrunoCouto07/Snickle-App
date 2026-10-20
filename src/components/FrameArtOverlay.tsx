import { memo } from "react";

interface Props {
  frameId: string;
}

export const FrameArtOverlay = memo(function FrameArtOverlay({ frameId }: Props) {
  switch (frameId) {
    case "frame_forest_vine":
      return (
        <svg
          viewBox="-10 -10 120 120"
          className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-[0_0_6px_rgba(34,197,94,0.7)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="vine-stem-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>
            <linearGradient id="leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          {/* Main Twisting Vine Ring */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="url(#vine-stem-grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="48.5"
            fill="none"
            stroke="#16a34a"
            strokeWidth="1.2"
            strokeDasharray="8 5"
          />
          {/* Sprouting Ivy Leaves along the circular path */}
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 48.5 * Math.cos(rad);
            const y = 50 + 48.5 * Math.sin(rad);
            const rot = deg + (i % 2 === 0 ? 35 : -35);
            return (
              <g key={deg} transform={`translate(${x}, ${y}) rotate(${rot})`}>
                {/* Leaf Petal */}
                <path
                  d="M 0 0 C -3 -7 0 -11 6 -9 C 11 -7 9 -2 0 0 Z"
                  fill="url(#leaf-grad)"
                  stroke="#14532d"
                  strokeWidth="0.75"
                />
                {/* Leaf Vein */}
                <path d="M 0 0 Q 3 -5 5 -8" stroke="#166534" strokeWidth="0.5" fill="none" />
                {/* Little Tender Sprout */}
                {i % 2 === 0 && <circle cx="2" cy="-4" r="1" fill="#bbf7d0" />}
              </g>
            );
          })}
        </svg>
      );

    case "frame_dragon_scale":
      return (
        <svg
          viewBox="-10 -10 120 120"
          className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-[0_0_8px_rgba(239,68,68,0.85)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="dragon-scale-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="35%" stopColor="#f97316" />
              <stop offset="85%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
            <linearGradient id="dragon-inner-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
          {/* Inner ember ring */}
          <circle
            cx="50"
            cy="50"
            r="46.5"
            fill="none"
            stroke="url(#dragon-inner-ring)"
            strokeWidth="2.5"
          />
          {/* 16 Overlapping Scalloped Dragon Scales */}
          {[
            0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315,
            337.5,
          ].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 49 * Math.cos(rad);
            const y = 50 + 49 * Math.sin(rad);
            const rot = deg + 90;
            return (
              <g key={deg} transform={`translate(${x}, ${y}) rotate(${rot})`}>
                <path
                  d="M -6.5 -3 Q 0 4.5 6.5 -3 Q 5 -8 0 -8.5 Q -5 -8 -6.5 -3 Z"
                  fill="url(#dragon-scale-grad)"
                  stroke="#450a0a"
                  strokeWidth="0.8"
                />
                {/* Scale Center Ridge */}
                <line
                  x1="0"
                  y1="-7"
                  x2="0"
                  y2="2"
                  stroke="#fef08a"
                  strokeWidth="0.6"
                  strokeOpacity="0.8"
                />
              </g>
            );
          })}
        </svg>
      );

    case "frame_cosmic_nebula":
      return (
        <svg
          viewBox="-12 -12 124 124"
          className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-[0_0_10px_rgba(168,85,247,0.85)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="cosmic-nebula-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="25%" stopColor="#8b5cf6" />
              <stop offset="55%" stopColor="#ec4899" />
              <stop offset="85%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <filter id="cosmic-glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Outer glowing stardust rim */}
          <circle
            cx="50"
            cy="50"
            r="48.5"
            fill="none"
            stroke="url(#cosmic-nebula-grad)"
            strokeWidth="3.5"
            strokeDasharray="28 4 14 3"
          />
          <circle
            cx="50"
            cy="50"
            r="46.5"
            fill="none"
            stroke="#c084fc"
            strokeWidth="1"
            strokeOpacity="0.75"
          />
          {/* Twinkling 4-point cosmic stars and stardust */}
          {[20, 80, 140, 200, 260, 320].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 49 * Math.cos(rad);
            const y = 50 + 49 * Math.sin(rad);
            const isLarge = i % 2 === 0;
            return (
              <g key={deg} transform={`translate(${x}, ${y})`}>
                {isLarge ? (
                  <path
                    d="M 0 -4.5 Q 0 0 4.5 0 Q 0 0 0 4.5 Q 0 0 -4.5 0 Q 0 0 0 -4.5 Z"
                    fill="#ffffff"
                    filter="url(#cosmic-glow)"
                  />
                ) : (
                  <circle cx="0" cy="0" r="1.6" fill="#67e8f9" filter="url(#cosmic-glow)" />
                )}
              </g>
            );
          })}
          {/* Subtle orbiting stardust dots */}
          {[50, 110, 170, 230, 290, 350].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 48.5 * Math.cos(rad);
            const y = 50 + 48.5 * Math.sin(rad);
            return <circle key={deg} cx={x} cy={y} r="1" fill="#fbcfe8" />;
          })}
        </svg>
      );

    case "frame_neon_arcade":
      return (
        <svg
          viewBox="-10 -10 120 120"
          className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-[0_0_8px_rgba(236,72,153,0.9)]"
          aria-hidden="true"
        >
          {/* Neon Magenta Outer Circle */}
          <circle cx="50" cy="50" r="48.5" fill="none" stroke="#ec4899" strokeWidth="2.5" />
          {/* Neon Cyan Inner Circle */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1.2"
            strokeDasharray="16 4"
          />
          {/* Laser Corner Brackets */}
          {[45, 135, 225, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 49 * Math.cos(rad);
            const y = 50 + 49 * Math.sin(rad);
            return (
              <g key={deg} transform={`translate(${x}, ${y}) rotate(${deg})`}>
                <rect
                  x="-2"
                  y="-2"
                  width="4"
                  height="4"
                  fill="#facc15"
                  stroke="#ec4899"
                  strokeWidth="0.8"
                />
              </g>
            );
          })}
        </svg>
      );

    case "frame_bubble_ring":
      return (
        <svg
          viewBox="-10 -10 120 120"
          className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-[0_0_6px_rgba(56,189,248,0.7)]"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="2"
            strokeOpacity="0.7"
          />
          {/* 12 Floating Glossy Bubbles */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 48.5 * Math.cos(rad);
            const y = 50 + 48.5 * Math.sin(rad);
            const r = i % 3 === 0 ? 3.5 : i % 2 === 0 ? 2.5 : 3;
            return (
              <g key={deg}>
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill="#bae6fd"
                  fillOpacity="0.75"
                  stroke="#38bdf8"
                  strokeWidth="0.75"
                />
                <ellipse
                  cx={x - r * 0.3}
                  cy={y - r * 0.3}
                  rx={r * 0.35}
                  ry={r * 0.25}
                  fill="#ffffff"
                  fillOpacity="0.9"
                />
              </g>
            );
          })}
        </svg>
      );

    case "frame_solar_flare":
      return (
        <svg
          viewBox="-12 -12 124 124"
          className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-[0_0_10px_rgba(249,115,22,0.85)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="solar-corona-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="47.5"
            fill="none"
            stroke="url(#solar-corona-grad)"
            strokeWidth="3.5"
          />
          {/* 12 Radiant Solar Flares */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 49 * Math.cos(rad);
            const y = 50 + 49 * Math.sin(rad);
            const rot = deg + 90;
            return (
              <polygon
                key={deg}
                points="-3,-1 0,5 3,-1"
                fill="#fde047"
                stroke="#ea580c"
                strokeWidth="0.6"
                transform={`translate(${x}, ${y}) rotate(${rot})`}
              />
            );
          })}
        </svg>
      );

    case "frame_rainbow_prism":
      return (
        <svg
          viewBox="-10 -10 120 120"
          className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-[0_0_8px_rgba(234,179,8,0.75)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="rainbow-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="20%" stopColor="#f97316" />
              <stop offset="40%" stopColor="#eab308" />
              <stop offset="60%" stopColor="#22c55e" />
              <stop offset="80%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="url(#rainbow-ring-grad)"
            strokeWidth="3.5"
          />
          <circle
            cx="50"
            cy="50"
            r="45.5"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.8"
          />
          {/* Prismatic Sparkle Stars */}
          {[30, 90, 150, 210, 270, 330].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 48.5 * Math.cos(rad);
            const y = 50 + 48.5 * Math.sin(rad);
            return (
              <g key={deg} transform={`translate(${x}, ${y})`}>
                <path d="M 0 -3 Q 0 0 3 0 Q 0 0 0 3 Q 0 0 -3 0 Q 0 0 0 -3 Z" fill="#ffffff" />
              </g>
            );
          })}
        </svg>
      );

    case "frame_starlight_diamond":
      return (
        <svg
          viewBox="-12 -12 124 124"
          className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-[0_0_12px_rgba(224,242,254,0.95)]"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="#e0f2fe" strokeWidth="3" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="#38bdf8" strokeWidth="1" />
          {/* 8 Facet Diamond Twinkle Starbursts */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 48.5 * Math.cos(rad);
            const y = 50 + 48.5 * Math.sin(rad);
            return (
              <g key={deg} transform={`translate(${x}, ${y})`}>
                <polygon points="0,-4.5 1,-1 4.5,0 1,1 0,4.5 -1,1 -4.5,0 -1,-1" fill="#ffffff" />
                <circle cx="0" cy="0" r="1.2" fill="#bae6fd" />
              </g>
            );
          })}
        </svg>
      );

    case "frame_cyber_circuit":
      return (
        <svg
          viewBox="-10 -10 120 120"
          className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-[0_0_8px_rgba(16,185,129,0.85)]"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="#059669"
            strokeWidth="2.8"
            strokeDasharray="14 3 6 3"
          />
          {/* Circuit Nodes */}
          {[15, 60, 105, 150, 195, 240, 285, 330].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 48.5 * Math.cos(rad);
            const y = 50 + 48.5 * Math.sin(rad);
            return (
              <g key={deg}>
                <circle cx={x} cy={y} r="2.2" fill="#34d399" stroke="#022c22" strokeWidth="0.8" />
                <circle cx={x} cy={y} r="0.8" fill="#ffffff" />
              </g>
            );
          })}
        </svg>
      );

    case "frame_gold":
      return (
        <svg
          viewBox="-10 -10 120 120"
          className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="#f59e0b" strokeWidth="3" />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1"
            strokeDasharray="8 4"
          />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 48 * Math.cos(rad);
            const y = 50 + 48 * Math.sin(rad);
            return (
              <circle
                key={deg}
                cx={x}
                cy={y}
                r="1.8"
                fill="#fef08a"
                stroke="#d97706"
                strokeWidth="0.6"
              />
            );
          })}
        </svg>
      );

    case "frame_bronze":
      return (
        <svg
          viewBox="-10 -10 120 120"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="#965a29" strokeWidth="3.2" />
          {/* Metallic Rivet Studs */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 48 * Math.cos(rad);
            const y = 50 + 48 * Math.sin(rad);
            return (
              <circle
                key={deg}
                cx={x}
                cy={y}
                r="1.6"
                fill="#754117"
                stroke="#b87333"
                strokeWidth="0.6"
              />
            );
          })}
        </svg>
      );

    case "frame_silver":
      return (
        <svg
          viewBox="-10 -10 120 120"
          className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-[0_0_5px_rgba(209,213,219,0.5)]"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="#d1d5db" strokeWidth="3" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="#f3f4f6" strokeWidth="1" />
          {[45, 135, 225, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 48 * Math.cos(rad);
            const y = 50 + 48 * Math.sin(rad);
            return (
              <circle
                key={deg}
                cx={x}
                cy={y}
                r="1.6"
                fill="#ffffff"
                stroke="#9ca3af"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>
      );

    case "frame_royal_ruby":
      return (
        <svg
          viewBox="-10 -10 120 120"
          className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="#e11d48" strokeWidth="3.2" />
          <circle cx="50" cy="50" r="45.5" fill="none" stroke="#f59e0b" strokeWidth="1" />
          {/* Faceted Ruby Jewels */}
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 48 * Math.cos(rad);
            const y = 50 + 48 * Math.sin(rad);
            return (
              <g key={deg} transform={`translate(${x}, ${y})`}>
                <polygon
                  points="0,-2.5 2.5,0 0,2.5 -2.5,0"
                  fill="#f43f5e"
                  stroke="#fbbf24"
                  strokeWidth="0.6"
                />
                <circle cx="0" cy="0" r="0.7" fill="#ffffff" />
              </g>
            );
          })}
        </svg>
      );

    case "frame_ocean_coral":
      return (
        <svg
          viewBox="-10 -10 120 120"
          className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="#06b6d4" strokeWidth="3.2" />
          <circle
            cx="50"
            cy="50"
            r="45.5"
            fill="none"
            stroke="#67e8f9"
            strokeWidth="1"
            strokeDasharray="12 4"
          />
          {[20, 65, 110, 155, 200, 245, 290, 335].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 48.5 * Math.cos(rad);
            const y = 50 + 48.5 * Math.sin(rad);
            return (
              <circle
                key={deg}
                cx={x}
                cy={y}
                r={i % 2 === 0 ? 2 : 1.5}
                fill="#ec4899"
                stroke="#0891b2"
                strokeWidth="0.6"
              />
            );
          })}
        </svg>
      );

    default:
      return null;
  }
});
