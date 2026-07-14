export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  readMinutes: number;
  likes?: number;
}

export interface CatEvent {
  slug: string;
  title: string;
  date: string;
  location: string;
  image: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}
