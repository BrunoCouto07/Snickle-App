# Snickle: full teacher dashboard, smart items, and classroom polish

## What you get

### 1. Teacher dashboard, finished

- **Roster**: add students one by one, bulk-paste or CSV upload, and a **batch edit table** — tick several children and change world, clear stars, or remove them at once; every name, ID, world and avatar is editable inline.
- **Class settings**: editable class name and teacher name (shown on screen and on every printout), replacing the fixed "Ms. Rivera · Room 4".
- **Categories**: turn categories on/off, create new ones, rename questions in all three languages, add/remove/reorder options.
- **Charts**: a bar breakdown per category (share of the class picking each option), participation counts, and a "most divided" highlight.
- **Group builder**: automatically clumps children into groups of 3-4 by shared picks, with a control to choose which category drives the grouping, plus a printable group sheet.
- **All About Me poster**: one-page printable per child with their current favourites, star count, avatar, and a timeline of past choices.

### 2. "Smart" fresh items (so it doesn't get stale)

- A **Keep it fresh** toggle at two levels: per category, and per individual item ("swap this one out").
- Offline: a large built-in library of kid-safe items (animals, foods, play, colours, weather, vehicles, feelings, pets…) rotates in new options each round, never repeating until the pool is exhausted.
- Online: an extra "invent new ones" step asks Lovable AI for fresh, age-appropriate items matching the category, filtered against a safe-word list and against items already used. If the app is offline or AI is unavailable, it silently falls back to the built-in library.

### 3. Picture library with search + photo import

- Searchable built-in picture library (hundreds of friendly icons/emoji tagged with words like "dog", "puppy", "hamster") — type and pick.
- **Photo search** online for real photos, and **import from camera roll / files** on any device, with a simple crop-to-square step.
- Every option everywhere now shows the **word spelled underneath the picture** plus a **speaker button that reads the word aloud** in the chosen language, for non-readers.

### 4. Look and feel controls

- A small, unobtrusive control cluster in the corner: **full-screen button** and a **theme picker** (Standard, Dark, Vaporwave, plus Space / Sea / Forest / Farm / Superhero themes matching the avatar worlds). Themes only re-tint colours; layout and craft aesthetic stay the same.
- **Avatar customisation**: pick the character emoji itself from a searchable set (not just the world), skin/colour tint, up to 3 accessories, and a background pattern — with a live preview.

## Technical notes

- New `src/lib/item-library.ts` (curated pools + tags), `src/lib/picture-library.ts` (searchable icon index), `src/lib/themes.ts` (CSS-variable theme sets applied via a `data-theme` attribute on `<html>`).
- State model extends `Category` with `smart: boolean` and `usedOptionIds`, `CategoryOption` with `smart?: boolean`, `Student` with `face`, `tint`, `pattern`, and `AppState` with `className`, `teacherName`, `theme`.
- Smart top-up and photo search run through Lovable Cloud server functions (`openai/gpt-5.6-sol` for item generation and image generation for pictures) so no keys touch the browser; results are cached into local state so they work offline afterwards. Enabling Lovable Cloud is part of this work.
- Word audio reuses the existing speech helper (browser voices, offline) with per-language locales.
- Existing localStorage state is migrated forward with defaults so nothing is lost.
