
export type Language = 'vi' | 'en';
export type Currency = 'VND' | 'USD';

export interface Location {
  id: string;
  name: { vi: string; en: string };
  type: string;
  region: string;
  tags: string[];
  image: string;
  description?: { vi: string; en: string };
  introduction?: { vi: string; en: string }; // Added introduction
  history?: { vi: string; en: string }; // Added history
  significance?: { vi: string; en: string }; // Added significance
}

export interface Tour {
  id: string;
  title: { vi: string; en: string };
  description: { vi: string; en: string };
  introduction: { vi: string; en: string }; // Added introduction
  meaning: { vi: string; en: string }; // Added meaning
  price_vnd: number;
  duration_days: number;
  level: 'light' | 'moderate' | 'deep';
  suitable_for: { vi: string; en: string };
  locations: string[]; // IDs of locations
  images: string[];
  schedule: Schedule[];
}

export interface Schedule {
  id: string;
  startDate: string;
  slots: number;
  slotsLeft: number;
}

export interface Review {
  id: string;
  tourId: string;
  bookingId?: string; // Added to link review to specific booking
  user: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface Course {
  id: string;
  title: { vi: string; en: string };
  description: { vi: string; en: string };
  price_vnd: number;
  duration: string;
  group_link: string;
  image: string;
}

export interface Discount {
  code: string;
  percent: number; // 0-100
  valid_until: string;
  usage_limit: number;
  used_count: number;
}

export interface Booking {
  id: string;
  userId?: string | null;
  tourId: string;
  scheduleId: string;
  guests: number;
  totalPrice: number;
  currency: Currency;
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED';
  date: string;
  discountCode?: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface User {
  id: string;
  name: string;
  phone?: string | null;
  email: string;
  role: 'USER' | 'ADMIN' | 'SALE';
  active: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}
