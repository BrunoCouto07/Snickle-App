export type MasterCategory =
  | "Science & Nature"
  | "Free Choice Centers"
  | "Community & Rules"
  | "Food & Kitchen"
  | "Arts & Hobbies"
  | "Bus & School Safety"
  | "Social-Emotional Learning"
  | "Literacy & Language"
  | "Math & Logic"
  | "Physical Education"
  | "Technology & Media"
  | "Music & Movement"
  | "Cultural Studies"
  | "Health & Wellness"
  | "Daily Routines"
  | "Creative Play"
  | "Building & Construction"
  | "Sensory Exploration"
  | "Outdoor Play"
  | "Dramatic Play";

export interface CategorySuggestion {
  name: string;
  masterCategories: MasterCategory[];
  keywords: string[];
}

export const CATEGORY_SUGGESTIONS: CategorySuggestion[] = [
  {
    name: "Pets",
    masterCategories: ["Science & Nature", "Community & Rules"],
    keywords: ["animals", "dogs", "cats", "fish", "hamsters"],
  },
  {
    name: "Gardening",
    masterCategories: ["Science & Nature", "Outdoor Play"],
    keywords: ["plants", "flowers", "vegetables", "nature", "seeds"],
  },
  {
    name: "Trees",
    masterCategories: ["Science & Nature", "Outdoor Play"],
    keywords: ["nature", "forest", "leaves", "wood"],
  },
  {
    name: "Shapes",
    masterCategories: ["Math & Logic", "Creative Play"],
    keywords: ["geometry", "circles", "squares", "triangles", "patterns"],
  },
  {
    name: "Weather",
    masterCategories: ["Science & Nature"],
    keywords: ["sun", "rain", "snow", "clouds", "storms"],
  },
  {
    name: "Sharing & Manners",
    masterCategories: ["Social-Emotional Learning", "Community & Rules"],
    keywords: ["kindness", "friends", "politeness", "cooperation"],
  },
  {
    name: "Community Helpers",
    masterCategories: ["Community & Rules"],
    keywords: ["firefighter", "police", "doctor", "teacher", "mailman"],
  },
  {
    name: "Clothes",
    masterCategories: ["Daily Routines", "Dramatic Play"],
    keywords: ["fashion", "dressing", "hats", "shoes", "shirts"],
  },
  {
    name: "Cars",
    masterCategories: ["Building & Construction", "Creative Play"],
    keywords: ["vehicles", "transportation", "trucks", "boats", "planes"],
  },
  {
    name: "Colors",
    masterCategories: ["Arts & Hobbies", "Literacy & Language"],
    keywords: ["red", "blue", "yellow", "green", "painting"],
  },
  {
    name: "Cookies",
    masterCategories: ["Food & Kitchen", "Arts & Hobbies"],
    keywords: ["baking", "sweets", "desserts", "cooking"],
  },
  {
    name: "Crafts",
    masterCategories: ["Arts & Hobbies", "Creative Play"],
    keywords: ["art", "making", "drawing", "cutting", "gluing"],
  },
  {
    name: "Farm Animals",
    masterCategories: ["Science & Nature"],
    keywords: ["cow", "pig", "chicken", "sheep", "horse"],
  },
  {
    name: "Ocean Animals",
    masterCategories: ["Science & Nature"],
    keywords: ["fish", "whale", "dolphin", "shark", "sea"],
  },
  {
    name: "Dinosaurs",
    masterCategories: ["Science & Nature"],
    keywords: ["t-rex", "triceratops", "fossils", "prehistoric"],
  },
  {
    name: "Space",
    masterCategories: ["Science & Nature", "Technology & Media"],
    keywords: ["planets", "stars", "astronauts", "rockets"],
  },
  {
    name: "Emotions",
    masterCategories: ["Social-Emotional Learning"],
    keywords: ["happy", "sad", "angry", "scared", "feelings"],
  },
  {
    name: "Music Instruments",
    masterCategories: ["Music & Movement", "Arts & Hobbies"],
    keywords: ["piano", "guitar", "drums", "singing", "band"],
  },
  {
    name: "Sports",
    masterCategories: ["Physical Education", "Outdoor Play"],
    keywords: ["ball", "running", "jumping", "team", "games"],
  },
  {
    name: "Books",
    masterCategories: ["Literacy & Language"],
    keywords: ["reading", "stories", "library", "learning"],
  },
];
