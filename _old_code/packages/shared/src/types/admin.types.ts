import type { SubscriptionPlan, UserRole } from './user.types';

// ════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════

export interface IDashboard {
  users: {
    total: number;
    newToday: number;
    newThisMonth: number;
    byPlan: {
      FREE: number;
      PREMIUM: number;
      VIP: number;
    };
  };
  revenue: {
    total: number;     // tổng doanh thu từ trước đến nay (VND)
    thisMonth: number; // doanh thu tháng Ahiện tại (VND)
  };
  pendingFeedbacks: number;
  totalScans: number;
}

// ════════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════════

export interface IAdminUser {
  _id: string;
  email: string;
  fullName: string;
  role: UserRole;
  plan: SubscriptionPlan;
  planExpiresAt: string | null;
  authProviders: string[];
  isPasswordSet: boolean;
  dailyImageCount: number;
  dailyPromptCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminUsersResponse {
  data: IAdminUser[];
  pagination: IPagination;
}

export interface IGetUsersQuery {
  plan?: 'FREE' | 'PREMIUM' | 'VIP';
  role?: 'FARMER' | 'EXPERT' | 'ADMIN';
  search?: string;
  page?: number;
  limit?: number;
}

export interface IUpdatePlanResponse {
  plan: string;
  planExpiresAt: string | null;
}

// ════════════════════════════════════════════════════════════
// REPORTS
// ════════════════════════════════════════════════════════════

export type GroupBy = 'day' | 'month';

export interface IGetReportQuery {
  from: string;   // 'YYYY-MM-DD'
  to: string;     // 'YYYY-MM-DD'
  groupBy?: GroupBy;
}

// Time-series: mỗi điểm là 1 ngày hoặc 1 tháng
export interface ITimeSeriesPoint {
  date: string; // 'YYYY-MM-DD' hoặc 'YYYY-MM'
  count: number;
}

// Doanh thu theo plan trong 1 ngày/tháng
export interface IRevenuePlanBreakdown {
  plan: 'PREMIUM' | 'VIP';
  revenue: number;
  count: number;
}

export interface IRevenueTimePoint {
  _id: string;                            // 'YYYY-MM-DD' hoặc 'YYYY-MM'
  totalRevenue: number;
  totalTransactions: number;
  byPlan: IRevenuePlanBreakdown[];
}

export interface IRevenueReport {
  summary: {
    totalRevenue: number;
    totalTransactions: number;
  };
  data: IRevenueTimePoint[];
}

// ════════════════════════════════════════════════════════════
// SO SÁNH THÁNG
// ════════════════════════════════════════════════════════════

export interface IMonthStats {
  period: string;        // 'YYYY-MM'
  newUsers: number;
  revenue: number;
  transactions: number;
  scans: number;
  newPremiumUsers: number;
  newVipUsers: number;
}

export interface ICompareMonthsResponse {
  month1: IMonthStats;
  month2: IMonthStats;
  changes: {
    newUsers: number;    // % thay đổi (dương = tăng, âm = giảm)
    revenue: number;
    scans: number;
    transactions: number;
  };
}

// ════════════════════════════════════════════════════════════
// FEEDBACK
// ════════════════════════════════════════════════════════════

export type FeedbackCategory = 'BUG' | 'FEATURE' | 'COMPLAINT' | 'GENERAL';
export type FeedbackStatus = 'PENDING' | 'REPLIED';

export interface IFeedback {
  _id: string;
  userId: {
    _id: string;
    email: string;
    fullName: string;
  };
  content: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  adminReply: string | null;
  repliedBy: {
    _id: string;
    email: string;
    fullName: string;
  } | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IFeedbacksResponse {
  data: IFeedback[];
  pagination: IPagination;
}

export interface ISubmitFeedbackPayload {
  category: FeedbackCategory;
  content: string;
}

// ════════════════════════════════════════════════════════════
// COMMON
// ════════════════════════════════════════════════════════════

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IMessageResponse {
  message: string;
}