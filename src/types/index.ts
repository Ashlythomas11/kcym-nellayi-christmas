export type Language = 'en' | 'ml';

export interface Prize {
  id: string;
  rank: number; // 1 = First prize, 2 = Second, etc.
  title: string;
  title_ml?: string;
  category: 'bumper' | 'major' | 'appliance' | 'consolation';
  categoryLabel: string;
  categoryLabel_ml?: string;
  imageUrl: string;
  description: string;
  description_ml?: string;
  sponsor?: string;
  sponsor_ml?: string;
  orderIndex: number;
  badge?: string;
  badge_ml?: string;
}

export interface Winner {
  id: string;
  prizeId: string;
  winningCouponNumber: string; // e.g. "A 1048", "7842"
  winnerName: string;
  winnerLocation?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface DrawSettings {
  drawDateIST: string; // ISO string e.g. "2026-12-24T23:00:00+05:30"
  timezone: string; // "Asia/Kolkata"
  isPublished: boolean;
  publishedAt: string | null;
  publishedBy: string | null;
  drawVenue: string;
  drawVenue_ml: string;
  heroHeadline: string;
  heroHeadline_ml: string;
  heroSubtitle: string;
  heroSubtitle_ml: string;
  announcementText: string;
  announcementText_ml: string;
  contactPhone: string;
  contactEmail: string;
  churchAddress: string;
  churchAddress_ml: string;
  couponPrice: string;
}

export interface AuditLog {
  id: string;
  timestamp: string; // IST ISO string
  action: string;
  details: string;
  adminEmail: string;
}

export interface AdminUser {
  email: string;
  role: 'superadmin' | 'organizer';
  name: string;
}

export interface CouponSearchResult {
  searchedNumber: string;
  isWinner: boolean;
  prize?: Prize;
  winner?: Winner;
}
