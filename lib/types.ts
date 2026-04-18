export type Language = "vi" | "en";
export type Currency = "VND" | "USD";
export type JourneyState = "UPCOMING" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";

export interface Location {
  id: string;
  name: { vi: string; en: string };
  type: string;
  region: string;
  tags: string[];
  image: string;
  description?: { vi: string; en: string };
  introduction?: { vi: string; en: string };
  history?: { vi: string; en: string };
  significance?: { vi: string; en: string };
}

export interface Tour {
  id: string;
  title: { vi: string; en: string };
  description: { vi: string; en: string };
  introduction: { vi: string; en: string };
  meaning: { vi: string; en: string };
  price_vnd: number;
  duration_days: number;
  level: "light" | "moderate" | "deep";
  suitable_for: { vi: string; en: string };
  locations: string[];
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
  bookingId?: string;
  user: string;
  rating: number;
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
  percent: number;
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
  status: "PENDING" | "PAID" | "COMPLETED" | "CANCELLED";
  date: string;
  discountCode?: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  departureDate?: string;
  durationDays?: number;
  journeyState?: JourneyState;
}

export interface User {
  id: string;
  name: string;
  phone?: string | null;
  email: string;
  role: "USER" | "ADMIN" | "SALE";
  active: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: number;
}

export interface JourneyCarePrompt {
  followUpId: string;
  bookingId: string;
  tourId: string;
  kind: "DAILY_CHECKIN" | "POST_TRIP_REVIEW";
  dayNumber: number;
  dueAt: string;
  autoOpen: boolean;
  ctaHref: string;
  ctaLabel: { vi: string; en: string };
  message: { vi: string; en: string };
}

export interface JourneyCareResponse {
  id: string;
  bookingId: string;
  followUpId: string;
  userId?: string | null;
  authorName?: string | null;
  message: string;
  createdAt: string;
  followUp: {
    kind: "DAILY_CHECKIN" | "POST_TRIP_REVIEW";
    dayNumber: number;
  };
}

export interface ActiveJourneyPromptContext {
  followUpId: string;
  bookingId: string;
  userId?: string | null;
  authorName?: string | null;
}
