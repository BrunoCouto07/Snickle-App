import type { UiTheme } from "./app-types";

export const UI_THEMES: { key: UiTheme; label: string; emoji: string; swatch: string[] }[] = [
  { key: "standard", label: "Standard", emoji: "🧺", swatch: ["#fdf6ec", "#ffc63f", "#ff6b69"] },
  { key: "dark", label: "Dark", emoji: "🌙", swatch: ["#211d1b", "#ffc63f", "#ff8f8d"] },
  { key: "vaporwave", label: "Vaporwave", emoji: "🌴", swatch: ["#1b1035", "#ff77e9", "#61e8ff"] },
  { key: "space", label: "Space", emoji: "🚀", swatch: ["#0f1330", "#8f9bff", "#ffd479"] },
  { key: "sea", label: "Sea", emoji: "🐬", swatch: ["#e8f7fb", "#3fb0c8", "#ff9e5b"] },
  { key: "forest", label: "Forest", emoji: "🦊", swatch: ["#f3f6ea", "#5fa06d", "#e07a3f"] },
  { key: "farm", label: "Farm", emoji: "🐮", swatch: ["#fdf3e0", "#e2a13a", "#8bbf6a"] },
  { key: "superhero", label: "Superhero", emoji: "🦸", swatch: ["#fff1f1", "#e33d3d", "#2f6fd0"] },
];

export function applyTheme(theme: UiTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}
