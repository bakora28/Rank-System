export type Role = 'admin' | 'teacher' | 'assistant';

export type Permission =
  | 'categories.view' | 'categories.add' | 'categories.edit' | 'categories.delete'
  | 'books.view' | 'books.add' | 'books.edit' | 'books.delete'
  | 'teachers.view' | 'teachers.add' | 'teachers.edit' | 'teachers.delete'
  | 'requests.view' | 'requests.add' | 'requests.edit' | 'requests.delete'
  | 'gifts.view' | 'gifts.add' | 'gifts.edit' | 'gifts.delete'
  | 'notifications.view' | 'notifications.add' | 'notifications.edit' | 'notifications.delete';

export const PERMISSION_MODULES = ['categories', 'books', 'teachers', 'requests', 'gifts', 'notifications'] as const;
export const PERMISSION_ACTIONS = ['view', 'add', 'edit', 'delete'] as const;

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  is_active: boolean;
  role: Role;
  permissions: Permission[];
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  books_count?: number;
  created_at: string;
}

export interface Book {
  id: number;
  name: string;
  category_id: number;
  category?: Category;
  my_status?: 'pending' | 'approved' | 'rejected' | null;
  created_at: string;
}

export type PurchaseStatus = 'pending' | 'approved' | 'rejected';

export interface PurchaseRequestItem {
  id: number;
  status: PurchaseStatus;
  note: string | null;
  teacher: { id: number; name: string; avatar: string | null };
  book: { id: number; name: string; category: string };
  reviewer?: { id: number; name: string } | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface RankRow {
  position: number;
  points: number;
  delta: number;
  teacher: { id: number; name: string; avatar: string | null };
}

export interface RanksResponse {
  data: RankRow[];
  me: RankRow | null;
}

export interface FullRanksResponse {
  data: RankRow[];
  meta: { total: number; per_page: number; current_page: number; last_page: number };
}

export type GiftCriteriaType = 'manual' | 'period_top1';
export type GiftPeriod = 'none' | '6_months' | 'yearly';

export interface GiftAward {
  id: number;
  gift?: { id: number; name: string; slug: string };
  user: { id: number; name: string; avatar: string | null };
  period_start: string | null;
  period_end: string | null;
  awarded_at: string;
}

export interface Gift {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  criteria_type: GiftCriteriaType;
  period: GiftPeriod;
  is_active: boolean;
  sort_order: number;
  latest_award?: GiftAward | null;
  progress?: {
    period_start: string | null;
    period_end: string | null;
    leader: { id: number; name: string; points: number } | null;
    my_points: number | null;
  };
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  is_active: boolean;
  approved_count: number;
  pending_count: number;
}

export interface Assistant {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  is_active: boolean;
  permissions: Permission[];
  created_at: string;
}

export interface AppNotification {
  id: string;
  type: string;
  data: {
    type: string;
    message: string;
    [key: string]: unknown;
  };
  read_at: string | null;
  created_at: string;
}

export interface Paginated<T> {
  data: T[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SearchResults {
  teachers: { id: number; name: string; email: string; avatar: string | null }[];
  books: (Book & { category: Category })[];
  categories: Category[];
}
