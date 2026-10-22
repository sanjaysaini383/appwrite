import type { Models } from 'appwrite';
import { Car, HeartHandshake, Laptop, PawPrint, ShoppingCart, Sparkles, UtensilsCrossed, Wrench, type LucideIcon } from 'lucide-react';

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

export const CATEGORIES: { id: Category; label: string; icon: LucideIcon; color: string }[] = [
  { id: 'groceries', label: 'Groceries', icon: ShoppingCart, color: '#16a34a' },
  { id: 'tools', label: 'Tools', icon: Wrench, color: '#ca8a04' },
  { id: 'rides', label: 'Rides', icon: Car, color: '#2563eb' },
  { id: 'tech', label: 'Tech help', icon: Laptop, color: '#7c3aed' },
  { id: 'care', label: 'Care', icon: HeartHandshake, color: '#db2777' },
  { id: 'food', label: 'Food', icon: UtensilsCrossed, color: '#ea580c' },
  { id: 'pets', label: 'Pets', icon: PawPrint, color: '#0891b2' },
  { id: 'other', label: 'Other', icon: Sparkles, color: '#64748b' },
];

export const categoryMeta = (id: Category) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
