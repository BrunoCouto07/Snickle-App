# Star Token Store & Avatar Customization Gamification

Comprehensive gamification upgrade introducing a Star Token Store with 40+ avatar frames, backgrounds, and gem adornments, progressive token pricing, instant item equipping, teacher multiplication + PIN gate bypass, and manual token adjustments.

> [!IMPORTANT]
> **User Review & Critical Decisions (Confirmed in Phase 1):**
>
> - **Store Access**: Available both as a direct "Star Store" quick button on student roster cards and inside the Avatar Customizer modal.
> - **Economy & Pricing**: Progressive pricing model with standard items (1–2 stars), rare items (3–4 stars), epic items (5–7 stars), and elite items (8–10 stars).
> - **Teacher Controls**: Teacher manual star token adjustment (+/- counter) and teacher PIN bypass gate are implemented both in the item purchase modal (to gift items directly) and in the Teacher Admin Dashboard.

---

## 1. Overview & Core Concept

- **What It Does**: Replaces floating accessory emojis with integrated, stylized **Avatar Frames**, **Avatar Backgrounds**, and **Frame Gems & Adornments**. Students earn star tokens during learning preference rounds, browse an engaging store catalog with over 40 collectible items, and customize their identity.
- **Target Audience / Persona**: Pre-K through 5th-grade students (who receive high-agency, visual rewards) and classroom teachers (who can reward positive participation by modifying stars or gifting items through a secure math + PIN gate).
- **Key Value**: Provides clear, motivating goals for completing game rounds. Eliminates awkward accessory clipping in favor of polished concentric layers (Background $\to$ Avatar / Photo $\to$ Frame $\to$ Adornment Crest).

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Earning Stars in Choice Rounds**:
   - Students earn star tokens upon finishing game rounds, accompanied by fanfare, star animations, and celebratory balance updates.
2. **Browsing & Previewing in the Star Store**:
   - Tapping the **Star Store** button on a student card or inside the customizer opens the full-screen modal with categories: `Frames`, `Backgrounds`, and `Adornments`.
   - Real-time live avatar preview updates immediately when tapping any item.
   - Clear progressive pricing tags: Common (1–2 ★), Rare (3–4 ★), Epic (5–7 ★), and Elite (8–10 ★).
3. **Purchasing & Equipping**:
   - If the student has sufficient star tokens: One-tap purchase with a delightful star particle effect, deducting tokens and automatically equipping the item.
   - If owned: Instant "Equip" toggle.
4. **Teacher Gift Bypass (Math + PIN)**:
   - If a student wants an item but lacks stars, the teacher can tap **Teacher Gift / Bypass**.
   - Opens the math gate (`7 × 8 = ?`), followed by the teacher's secret PIN pad.
   - On success, the item is unlocked immediately for the student with zero star deduction.
5. **Teacher Manual Token Adjustment**:
   - In both the Student Customizer and Teacher Admin Dashboard, teachers can freely increment (`+1`, `+5`) or decrement (`-1`) star token balances.

### Visual Identity & Theme

- **Dominant Canvas**: Warm classroom paper (`#FFFDF8`) and card cream with playful honey-gold star accents (`#FFC63F`).
- **Frame Materials**:
  - _Default Starter_: Polished Bronze Frame (`#CD7F32` metallic gradient).
  - _Progression_: Silver Sparkle, Golden Laurel, Cosmic Aurora, Royal Ruby, Deep Sea Coral, Neon Circuit, Starlight Diamond.
- **Backgrounds**: High-resolution CSS gradient patterns and atmospheric thematic motifs (Starry Midnight, Sunny Meadow, Dino Jungle, Cyberpunk Grid, Tropical Reef).
- **Frame Gems**: Clean anchored crests positioned at the cardinal points (top crown, side winglets, or bottom medallion), never obscuring the avatar's face or student photo.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Concentric Layered Rendering vs Floating Accessories**:
  - _Approach_: Re-architect the `Avatar` component into 4 coordinated concentric SVG/CSS layers:
    1. Background surface (patterned circle)
    2. Face / Character / Uploaded Photo
    3. Structural Frame (Bronze baseline $\to$ upgraded metallic/elemental rings)
    4. Adornment Crest (pinned top/corner gems and laurels)
  - _Why_: Eliminates arbitrary floating accessories that previously clipped avatars, producing consistent, beautiful badges at all sizes (`sm`, `md`, `lg`).
- **Decision 2: Student Inventory Persistence**:
  - _Approach_: Extend the `Student` interface in `src/lib/app-types.ts` with `unlockedItems: string[]`, `activeFrame: string`, `activeBackground: string`, and `activeAdornment: string`.
  - _Why_: Ensures full backward compatibility with existing rosters while preserving student purchases across browser sessions and JSON backup/sync exports.
- **Decision 3: Dual Gate for Teacher Bypass**:
  - _Approach_: Re-use the existing math gate (`a × b`) plus PIN keypad from `TeacherLock.tsx` for teacher gifts.
  - _Why_: Prevents young learners from accidentally or intentionally bypassing star costs while giving teachers a frictionless in-context way to reward effort.

---

## 4. Technical Architecture & Data Strategy

### System & Component Architecture

```
┌────────────────────────────────────────────────────────┐
│                   App State Store                      │
│        (students: Student[], pin: string, etc.)         │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│     StudentRoster     │       │     AvatarBuilder     │
│  - Quick Store Button │       │  - Wardrobe & Colors  │
│  - Student Avatar     │       │  - "Star Store" Tab   │
└───────────┬───────────┘       └───────────┬───────────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                    StarStoreModal                      │
│  - Categories: Frames (14), Bgs (14), Adornments (14)  │
│  - Progressive Star Cost (1–10 ★)                     │
│  - Live Avatar Preview Stage                           │
│  - Direct Star Purchase or Teacher PIN Bypass          │
└───────────┬───────────────────────────────┬────────────┘
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│     Avatar Layer      │       │     TeacherLock       │
│  1. Background Ring   │       │  - Math Problem Gate  │
│  2. Face / Photo      │       │  - Shuffled PIN Pad   │
│  3. Upgraded Frame    │       │  - Instant Gift Grant │
│  4. Gem / Adornment   │       └───────────────────────┘
└───────────────────────┘
```

### Store Catalog Data (42 Items Total)

- **Avatar Frames (14 Items)**:
  1. `frame_bronze` (Starter, 0 ★)
  2. `frame_silver` (Common, 2 ★)
  3. `frame_gold` (Common, 3 ★)
  4. `frame_forest_vine` (Rare, 4 ★)
  5. `frame_ocean_coral` (Rare, 4 ★)
  6. `frame_bubble_ring` (Rare, 4 ★)
  7. `frame_neon_arcade` (Epic, 5 ★)
  8. `frame_royal_ruby` (Epic, 6 ★)
  9. `frame_solar_flare` (Epic, 7 ★)
  10. `frame_cosmic_nebula` (Epic, 7 ★)
  11. `frame_rainbow_prism` (Elite, 8 ★)
  12. `frame_cyber_circuit` (Elite, 8 ★)
  13. `frame_dragon_scale` (Elite, 9 ★)
  14. `frame_starlight_diamond` (Elite, 10 ★)

- **Avatar Backgrounds (14 Items)**:
  1. `bg_parchment` (Starter, 0 ★)
  2. `bg_meadow_green` (Common, 1 ★)
  3. `bg_sky_clouds` (Common, 2 ★)
  4. `bg_sunset_peach` (Common, 2 ★)
  5. `bg_candy_swirl` (Rare, 3 ★)
  6. `bg_campfire_woods` (Rare, 4 ★)
  7. `bg_ocean_reef` (Rare, 4 ★)
  8. `bg_dino_jungle` (Rare, 4 ★)
  9. `bg_fairy_grove` (Epic, 5 ★)
  10. `bg_volcano_glow` (Epic, 6 ★)
  11. `bg_starry_galaxy` (Epic, 6 ★)
  12. `bg_cyber_grid` (Elite, 8 ★)
  13. `bg_castle_sunrise` (Elite, 9 ★)
  14. `bg_supernova_burst` (Elite, 10 ★)

- **Frame Gems & Adornments (14 Items)**:
  1. `adorn_none` (Clean / None, 0 ★)
  2. `adorn_little_star` (Common, 1 ★)
  3. `adorn_lucky_clover` (Common, 2 ★)
  4. `adorn_golden_laurel` (Common, 3 ★)
  5. `adorn_sapphire_crest` (Rare, 4 ★)
  6. `adorn_ruby_top` (Rare, 4 ★)
  7. `adorn_emerald_wings` (Rare, 4 ★)
  8. `adorn_lightning_sigil` (Epic, 5 ★)
  9. `adorn_crystal_spire` (Epic, 6 ★)
  10. `adorn_moon_charm` (Epic, 6 ★)
  11. `adorn_phoenix_spark` (Elite, 8 ★)
  12. `adorn_butterfly_perch` (Elite, 8 ★)
  13. `adorn_royal_crown` (Elite, 9 ★)
  14. `adorn_diamond_starburst` (Elite, 10 ★)

### Data Entities & State Updates

- Update `src/lib/app-types.ts`:
  ```typescript
  export interface Student {
    id: string;
    name: string;
    theme: ThemeKey;
    accessories: string[];
    stars: number;
    face?: string;
    tint?: string;
    customWorldId?: string;
    photoUrl?: string;
    // Store extensions:
    unlockedItems?: string[];
    activeFrame?: string;
    activeBackground?: string;
    activeAdornment?: string;
  }
  ```
- Defaults: Any student without explicit store keys initializes with `unlockedItems: ["frame_bronze", "bg_parchment", "adorn_none"]`, `activeFrame: "frame_bronze"`, `activeBackground: "bg_parchment"`, `activeAdornment: "adorn_none"`.
