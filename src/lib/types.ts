import type { Models } from 'appwrite';

export type Kind = 'request' | 'offer';
export type Status = 'open' | 'claimed' | 'done';
export type Urgency = 'low' | 'normal' | 'high';
export type Category = 'groceries' | 'tools' | 'rides' | 'tech' | 'care' | 'food' | 'pets' | 'other';

/** [longitude, latitude] — the order Appwrite point columns use. */
export type LngLat = [number, number];

export type Post = Models.Row & {
  kind: Kind;
  category: Category;
  title: string;
  body: string | null;
  location: LngLat;
  status: Status;
  urgency: Urgency;
  authorId: string;
  authorName: string;
  helperId: string | null;
  helperName: string | null;
  hearts: number;
  replies: number;
  expiresAt: string | null;
};

export type Message = Models.Row & {
  authorId: string;
  authorName: string;
  body: string;
  system: boolean;
};

export type Kudos = Models.Row & {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  points: number;
  note: string | null;
};

export const CATEGORIES: { id: Category; label: string; emoji: string; color: string }[] = [
  { id: 'groceries', label: 'Groceries', emoji: '🛒', color: '#3fb27f' },
  { id: 'tools', label: 'Tools', emoji: '🔧', color: '#e0a526' },
  { id: 'rides', label: 'Rides', emoji: '🚗', color: '#4d8df6' },
  { id: 'tech', label: 'Tech help', emoji: '💻', color: '#8c6cf0' },
  { id: 'care', label: 'Care', emoji: '🤝', color: '#ef5f8b' },
  { id: 'food', label: 'Food', emoji: '🍲', color: '#ff7a3d' },
  { id: 'pets', label: 'Pets', emoji: '🐾', color: '#21b5c4' },
  { id: 'other', label: 'Other', emoji: '✨', color: '#9a8f86' },
];

export const categoryMeta = (id: Category) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
