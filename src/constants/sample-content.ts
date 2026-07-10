// Phase 1 placeholder content — replace with real CMS / Firestore data later.
import type { Article, CatEvent } from "@/types/content";

// ─── Articles ────────────────────────────────────────────────────────────────

export const ALL_ARTICLES: (Article & {
  featured?: boolean;
  editorsPick?: boolean;
  likes?: number;
})[] = [
  {
    slug: "vaccination-basics",
    title: "A Gentle Guide to Kitten Vaccinations",
    excerpt: "What to expect, when to schedule, and how to keep your kitten comfortable.",
    category: "vaccination",
    image: "https://cataas.com/cat?width=600&height=450&t=vaccination-basics",
    readMinutes: 4,
    featured: true,
    editorsPick: true,
    likes: 124,
  },
  {
    slug: "heat-cycle-101",
    title: "Understanding Your Cat's Heat Cycle",
    excerpt: "Signs to watch for and how to support your cat with patience and care.",
    category: "heat-cycle",
    image: "https://cataas.com/cat?width=600&height=450&t=heat-cycle-101",
    readMinutes: 5,
    featured: true,
    likes: 98,
  },
  {
    slug: "nutrition-fundamentals",
    title: "Nutrition Fundamentals for Every Life Stage",
    excerpt: "Building healthy habits from kittenhood through their golden years.",
    category: "nutrition",
    image: "https://cataas.com/cat?width=600&height=450&t=nutrition-fundamentals",
    readMinutes: 6,
    featured: true,
    editorsPick: true,
    likes: 215,
  },
  {
    slug: "cat-behavior-kneading",
    title: "Why Does My Cat Knead? The Science of Comfort",
    excerpt: "Kneading is more than a habit — it is a sign of deep trust and contentment.",
    category: "behavior",
    image: "https://cataas.com/cat?width=600&height=450&t=cat-behavior-kneading",
    readMinutes: 3,
    likes: 187,
  },
  {
    slug: "breeding-readiness",
    title: "Is Your Cat Ready to Breed? A Complete Checklist",
    excerpt: "Health, timing, and emotional readiness — everything to consider before breeding.",
    category: "breeding",
    image: "https://cataas.com/cat?width=600&height=450&t=breeding-readiness",
    readMinutes: 7,
    editorsPick: true,
    likes: 76,
  },
  {
    slug: "annual-health-checkup",
    title: "The Annual Health Checkup: What to Expect",
    excerpt: "A calm, complete guide to what your vet checks and why it matters every year.",
    category: "health",
    image: "https://cataas.com/cat?width=600&height=450&t=annual-health-checkup",
    readMinutes: 5,
    likes: 143,
  },
  {
    slug: "raw-food-diet",
    title: "Raw Food Diet for Cats: Benefits and Risks",
    excerpt: "A balanced look at raw feeding — what the science says and how to do it safely.",
    category: "nutrition",
    image: "https://cataas.com/cat?width=600&height=450&t=raw-food-diet",
    readMinutes: 8,
    likes: 92,
  },
  {
    slug: "vaccination-schedule",
    title: "The Complete Vaccination Schedule (0–12 Months)",
    excerpt: "Month-by-month guide to keeping your kitten protected during the critical first year.",
    category: "vaccination",
    image: "https://cataas.com/cat?width=600&height=450&t=vaccination-schedule",
    readMinutes: 4,
    likes: 201,
  },
  {
    slug: "heat-cycle-care",
    title: "Caring for Your Cat During Her Heat Cycle",
    excerpt: "Practical, compassionate tips to keep your cat comfortable and stress-free.",
    category: "heat-cycle",
    image: "https://cataas.com/cat?width=600&height=450&t=heat-cycle-care",
    readMinutes: 5,
    likes: 88,
  },
  {
    slug: "cat-stress-signs",
    title: "10 Signs Your Cat Is Stressed (And What to Do)",
    excerpt: "Learning to read your cat's body language could change everything.",
    category: "behavior",
    image: "https://cataas.com/cat?width=600&height=450&t=cat-stress-signs",
    readMinutes: 6,
    editorsPick: true,
    likes: 312,
  },
  {
    slug: "breeding-genetics",
    title: "Understanding Basic Cat Genetics for Breeders",
    excerpt: "Coat colors, patterns, and what hereditary health means for responsible breeding.",
    category: "breeding",
    image: "https://cataas.com/cat?width=600&height=450&t=breeding-genetics",
    readMinutes: 9,
    likes: 54,
  },
  {
    slug: "senior-cat-health",
    title: "Senior Cat Health: What Changes After 10 Years",
    excerpt: "How to adjust care, diet, and vet visits as your cat enters their golden years.",
    category: "health",
    image: "https://cataas.com/cat?width=600&height=450&t=senior-cat-health",
    readMinutes: 6,
    likes: 167,
  },
];

// Backward-compat: homepage imports FEATURED_ARTICLES
export const FEATURED_ARTICLES = ALL_ARTICLES.filter((a) => a.featured);

// ─── Events ──────────────────────────────────────────────────────────────────

export const ALL_EVENTS: (CatEvent & {
  isoDate: string;
  type: "online" | "bangkok" | "chiangmai" | "other";
})[] = [
  {
    slug: "bangkok-meetup",
    title: "Catinder Community Live — Online Meetup",
    date: "Aug 16, 2026",
    isoDate: "2026-08-16",
    location: "Live on Zoom (link sent on join)",
    image: "https://cataas.com/cat?width=200&height=200&t=evt-community-live",
    type: "online",
  },
  {
    slug: "vet-talk-live",
    title: "Live Vet Q&A: Breeding Health Basics",
    date: "Aug 23, 2026",
    isoDate: "2026-08-23",
    location: "Online via Zoom",
    image: "https://cataas.com/cat?width=200&height=200&t=evt-vet-talk",
    type: "online",
  },
  {
    slug: "cat-expo-2026",
    title: "Cat Photo Contest Online 2026",
    date: "Sep 5, 2026",
    isoDate: "2026-09-05",
    location: "Submit via catinder.com",
    image: "https://cataas.com/cat?width=200&height=200&t=evt-photo-contest",
    type: "online",
  },
  {
    slug: "chiangmai-cat-walk",
    title: "Cat Trivia Night — Online",
    date: "Sep 14, 2026",
    isoDate: "2026-09-14",
    location: "Online via Discord",
    image: "https://cataas.com/cat?width=200&height=200&t=evt-trivia-night",
    type: "online",
  },
  {
    slug: "online-nutrition-workshop",
    title: "Online Cat Nutrition Workshop",
    date: "Sep 20, 2026",
    isoDate: "2026-09-20",
    location: "Online via Zoom",
    image: "https://cataas.com/cat?width=200&height=200&t=evt-nutrition",
    type: "online",
  },
];

// Backward-compat: homepage imports UPCOMING_EVENTS
export const UPCOMING_EVENTS = ALL_EVENTS.slice(0, 2);

// ─── Breeds ──────────────────────────────────────────────────────────────────

export const CAT_BREED_KEYS = [
  { key: "scottish-fold", image: "https://cataas.com/cat?width=500&height=500&t=breed-fold" },
  { key: "british-shorthair", image: "https://cataas.com/cat?width=500&height=500&t=breed-british" },
  { key: "persian", image: "https://cataas.com/cat?width=500&height=500&t=breed-persian" },
  { key: "maine-coon", image: "https://cataas.com/cat?width=500&height=500&t=breed-maine" },
  { key: "siamese", image: "https://cataas.com/cat?width=500&height=500&t=breed-siamese" },
] as const;

// ─── Article body content (paragraphs) ───────────────────────────────────────

const DEFAULT_BODY: string[] = [
  "Every cat parent knows the feeling: something changes, and you are not quite sure what it means. Building confidence starts with knowledge — and that is exactly what this guide is designed to give you.",
  "The most important thing to understand is that cats communicate differently from us. What looks like a small behaviour shift can carry significant meaning, and learning to read these signals is one of the most valuable skills a cat parent can develop.",
  "Veterinary experts recommend a proactive, not just reactive, approach to cat care. This means regular check-ins, consistent routines, and staying informed about what is normal for your specific cat's breed, age, and personality.",
  "Community wisdom matters too. Many of the best insights come from cat parents who have lived through similar situations. Catinder's community is here to share real experiences, ask questions, and support one another without judgment.",
  "Remember: you do not need to have all the answers. You just need to know where to find them — and to trust that asking questions is always the right choice.",
];

const ARTICLE_BODY_MAP: Record<string, string[]> = {
  "vaccination-basics": [
    "Your kitten's first year is the most important for building lifelong immunity. Vaccinations during this window protect against diseases that are entirely preventable — and the process is gentler than most new cat parents expect.",
    "The core vaccines recommended for all kittens include protection against Feline Panleukopenia (FPV), Feline Herpesvirus (FHV-1), and Feline Calicivirus (FCV). These are typically given in a series starting at 6 to 8 weeks of age, with boosters every 3–4 weeks until 16 weeks old.",
    "Your vet may also recommend non-core vaccines based on your cat's lifestyle. Indoor cats have different risk profiles than cats with outdoor access. Rabies vaccination requirements also vary by location and local law.",
    "Preparing your kitten for the vet visit is half the battle. Practice gentle handling at home, make the carrier a comfortable familiar space, and bring a favourite toy or blanket. Most kittens handle vaccinations well when their owner stays calm and reassuring.",
    "After vaccination, mild side effects like temporary drowsiness or reduced appetite are normal and usually resolve within 24 hours. Contact your vet if you notice swelling at the injection site, difficulty breathing, or symptoms lasting more than 48 hours.",
  ],
  "nutrition-fundamentals": [
    "Good nutrition is the single most controllable factor in your cat's long-term health. Unlike genetics or environment, what you feed your cat every day is entirely within your hands — and that is both a responsibility and an opportunity.",
    "Cats are obligate carnivores, meaning they require animal-based protein to survive and thrive. Unlike dogs or humans, cats cannot synthesise certain amino acids like taurine on their own — they must get them from their food.",
    "Life stage matters enormously. Kitten food is formulated with higher protein and calorie density to support rapid growth. Adult formulas balance maintenance needs. Senior formulas often address joint health, kidney function, and lower caloric requirements.",
    "Whether you choose wet food, dry food, or a combination depends on your cat, your vet's guidance, and your lifestyle. Wet food supports hydration — important since cats have a naturally low thirst drive. Dry food offers convenience and potential dental benefits.",
    "When in doubt, look for food that meets AAFCO or equivalent nutritional standards, appropriate for your cat's life stage. Reading ingredient labels, understanding protein sources, and watching for filler ingredients are skills worth developing as a cat parent.",
  ],
};

export function getArticleBody(slug: string): string[] {
  return ARTICLE_BODY_MAP[slug] ?? DEFAULT_BODY;
}

// ─── Quiz content per category ────────────────────────────────────────────────

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

const CATEGORY_QUIZZES: Record<string, QuizQuestion[]> = {
  vaccination: [
    {
      question: "At what age should kittens typically receive their first vaccination?",
      options: ["2–3 weeks", "6–8 weeks", "12–16 weeks", "6 months"],
      correct: 1,
    },
    {
      question: "Which is a core vaccine recommended for all cats?",
      options: ["Bordetella", "Feline Panleukopenia (FPV)", "Leptospirosis", "Giardia"],
      correct: 1,
    },
    {
      question: "How long might mild side effects last after vaccination?",
      options: ["1 week", "3–5 days", "Up to 48 hours", "Side effects never occur"],
      correct: 2,
    },
  ],
  nutrition: [
    {
      question: "Why are cats called 'obligate carnivores'?",
      options: [
        "They prefer the taste of meat",
        "They cannot digest vegetables at all",
        "They require animal protein to synthesise essential nutrients like taurine",
        "They evolved in desert environments",
      ],
      correct: 2,
    },
    {
      question: "Which nutrient must cats obtain from their food (they cannot produce it themselves)?",
      options: ["Glycine", "Taurine", "Glutamine", "Alanine"],
      correct: 1,
    },
    {
      question: "Why is wet food often recommended for cats?",
      options: [
        "It tastes better to them",
        "It supports hydration since cats have a low thirst drive",
        "It is cheaper than dry food",
        "It requires no refrigeration",
      ],
      correct: 1,
    },
  ],
  "heat-cycle": [
    {
      question: "At what age do female cats typically experience their first heat cycle?",
      options: ["2–3 months", "4–6 months", "9–12 months", "1.5 years"],
      correct: 1,
    },
    {
      question: "Which is NOT a typical sign of a cat in heat?",
      options: ["Loud vocalisation", "Increased affection", "Weeks-long loss of appetite", "Restlessness"],
      correct: 2,
    },
    {
      question: "What is the most responsible option if you do not intend to breed your cat?",
      options: ["Keep her strictly indoors", "Spaying before first heat", "Giving mild sedatives", "Waiting out each cycle"],
      correct: 1,
    },
  ],
  behavior: [
    {
      question: "What does kneading typically indicate in cats?",
      options: ["Hunger signals", "Territorial aggression", "Contentment and feeling safe", "Marking with scent"],
      correct: 2,
    },
    {
      question: "Which is a common stress signal to watch for in cats?",
      options: ["Slow blinking at you", "Hiding more than usual", "Grooming in front of you", "Sleeping near you"],
      correct: 1,
    },
    {
      question: "How can you best help a stressed cat feel safer at home?",
      options: [
        "Force interaction and cuddles",
        "Remove all toys from the environment",
        "Provide hiding spots and maintain a consistent daily routine",
        "Play loud music to distract them",
      ],
      correct: 2,
    },
  ],
  health: [
    {
      question: "How often should a healthy adult cat visit the vet for a routine check-up?",
      options: ["Every 5 years", "Every 2–3 years", "Once a year", "Only when visibly sick"],
      correct: 2,
    },
    {
      question: "At what age is a cat generally considered 'senior'?",
      options: ["5 years", "7 years", "10 years", "12 years"],
      correct: 1,
    },
    {
      question: "Which change is most important to report to a vet in a senior cat?",
      options: [
        "Sleeping more than as a kitten",
        "Sudden unexplained weight loss or gain",
        "Preferring one favourite sleeping spot",
        "Being calmer than in younger years",
      ],
      correct: 1,
    },
  ],
  breeding: [
    {
      question: "What is the minimum recommended age for a female cat's first breeding?",
      options: ["6 months", "8 months", "12–18 months", "3 years"],
      correct: 2,
    },
    {
      question: "Which health screening is most commonly recommended before breeding?",
      options: [
        "Dental X-rays",
        "HCM (hypertrophic cardiomyopathy) cardiac screening",
        "Blood pressure monitoring",
        "Spleen ultrasound",
      ],
      correct: 1,
    },
    {
      question: "What does 'responsible breeding' primarily mean?",
      options: [
        "Maximising the number of litters per year",
        "Prioritising health, genetics, and welfare of parents and kittens",
        "Only breeding internationally recognised pedigree cats",
        "Achieving the largest possible litter size",
      ],
      correct: 1,
    },
  ],
};

export function getQuizForArticle(category: string): QuizQuestion[] {
  return CATEGORY_QUIZZES[category] ?? CATEGORY_QUIZZES["health"]!;
}
