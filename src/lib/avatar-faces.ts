export interface CharacterAvatarOption {
  emoji: string;
  label: string;
  category: "animal" | "kid" | "fantasy";
}

/**
 * Dedicated Kid Character Avatars (distinct from Team / World / Group Emblems).
 * Learners are kid personas, animals, and friendly characters.
 */
export const STUDENT_CHARACTER_AVATARS: CharacterAvatarOption[] = [
  // Animals
  { emoji: "🐱", label: "Cat", category: "animal" },
  { emoji: "🐶", label: "Puppy", category: "animal" },
  { emoji: "🦊", label: "Fox", category: "animal" },
  { emoji: "🐻", label: "Bear", category: "animal" },
  { emoji: "🐼", label: "Panda", category: "animal" },
  { emoji: "🐨", label: "Koala", category: "animal" },
  { emoji: "🐰", label: "Bunny", category: "animal" },
  { emoji: "🐯", label: "Tiger", category: "animal" },
  { emoji: "🦁", label: "Lion", category: "animal" },
  { emoji: "🐵", label: "Monkey", category: "animal" },
  { emoji: "🐸", label: "Frog", category: "animal" },
  { emoji: "🦄", label: "Unicorn", category: "fantasy" },
  { emoji: "🐧", label: "Penguin", category: "animal" },
  { emoji: "🦉", label: "Owl", category: "animal" },
  { emoji: "🐙", label: "Octopus", category: "animal" },
  { emoji: "🐢", label: "Turtle", category: "animal" },
  { emoji: "🦔", label: "Hedgehog", category: "animal" },
  { emoji: "🦥", label: "Sloth", category: "animal" },
  { emoji: "🐝", label: "Bee", category: "animal" },
  { emoji: "🦋", label: "Butterfly", category: "animal" },
  // Fantasy & Tech
  { emoji: "🤖", label: "Robot", category: "fantasy" },
  { emoji: "👾", label: "Pixel Buddy", category: "fantasy" },
  { emoji: "🧙", label: "Wizard", category: "fantasy" },
  { emoji: "🦸", label: "Superhero", category: "fantasy" },
  { emoji: "🧑‍🚀", label: "Astronaut Kid", category: "fantasy" },
  { emoji: "🤠", label: "Explorer", category: "fantasy" },
  // Kids & Learners
  { emoji: "🧒", label: "Kid", category: "kid" },
  { emoji: "👧", label: "Girl", category: "kid" },
  { emoji: "👦", label: "Boy", category: "kid" },
  { emoji: "🧑‍🦱", label: "Curly Hair", category: "kid" },
  { emoji: "🧑‍🦰", label: "Red Hair", category: "kid" },
  { emoji: "🎨", label: "Artist", category: "kid" },
];

/**
 * Team / World / Group Emblems.
 * These represent classrooms, teams, and environments (flags/bases).
 */
export const TEAM_WORLD_EMBLEMS = [
  "🛸", // Galactic Explorers
  "🚀", // Space Orbiters
  "🚜", // Farm Fields
  "🌲", // Enchanted Forest
  "🌊", // Deep Sea
  "⚡", // Hero Squad
  "🦕", // Dino Diggers
  "🌴", // Jungle Safari
  "⭐", // Super Stars
  "🌋", // Volcano Valley
  "🏰", // Kingdom Quest
  "🏕️", // Camp Rangers
  "🪐", // Planet Ring
  "🌈", // Rainbow Crest
  "🛡️", // Guardian Shield
  "🏆", // Champions
];

/**
 * Resolves a student's avatar face so it is guaranteed to be a distinct
 * character face and CANNOT be the same as the group/team emblem.
 */
export function resolveStudentFace(
  face: string | undefined,
  studentKey: string,
  worldEmoji?: string,
): string {
  // If face is valid and does NOT match the world emblem or known team flags
  if (face && face.trim() && face !== worldEmoji && !TEAM_WORLD_EMBLEMS.includes(face)) {
    return face;
  }

  // Fallback: pick a deterministic character avatar based on studentKey, excluding worldEmoji
  const candidates = STUDENT_CHARACTER_AVATARS.map((c) => c.emoji).filter(
    (e) => e !== worldEmoji && !TEAM_WORLD_EMBLEMS.includes(e),
  );

  let hash = 0;
  const key = studentKey || "student";
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }

  return candidates[hash % candidates.length] || "🧒";
}
