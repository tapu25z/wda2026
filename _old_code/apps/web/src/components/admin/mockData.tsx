import {
  IUser,
  UserRole,
  SubscriptionPlan,
  AuthProvider,
  adminApi,
} from "@agri-scan/shared";

export const MOCK_DASHBOARD = {
  users: {
    total: 1200,
    newToday: 12,
    newThisMonth: 85,
    byPlan: {
      FREE: 1000,
      PREMIUM: 150,
      VIP: 50,
    },
  },
  revenue: {
    total: 25000000,
    thisMonth: 4200000,
  },
  pendingFeedbacks: 8,
  totalScans: 15432,
};

// export const MOCK_USERS: IUser[] = await adminApi.getUsers

export const MOCK_REVENUE_DATA = [
  { date: "2026-03-01", totalRevenue: 1500000, PREMIUM: 500000, VIP: 1000000 },
  { date: "2026-03-02", totalRevenue: 2000000, PREMIUM: 1000000, VIP: 1000000 },
  { date: "2026-03-03", totalRevenue: 1200000, PREMIUM: 700000, VIP: 500000 },
  { date: "2026-03-04", totalRevenue: 3000000, PREMIUM: 1500000, VIP: 1500000 },
  { date: "2026-03-05", totalRevenue: 2500000, PREMIUM: 1000000, VIP: 1500000 },
  { date: "2026-03-06", totalRevenue: 1800000, PREMIUM: 800000, VIP: 1000000 },
  { date: "2026-03-07", totalRevenue: 4000000, PREMIUM: 2000000, VIP: 2000000 },
];

export const MOCK_USAGE_DATA = [
  { date: "2026-03-01", images: 1200, prompts: 3500 },
  { date: "2026-03-02", images: 1350, prompts: 3800 },
  { date: "2026-03-03", images: 1100, prompts: 3200 },
  { date: "2026-03-04", images: 1600, prompts: 4500 },
  { date: "2026-03-05", images: 1500, prompts: 4100 },
  { date: "2026-03-06", images: 1450, prompts: 3900 },
  { date: "2026-03-07", images: 1800, prompts: 5200 },
];

export const MOCK_FEEDBACKS = [
  {
    _id: "fb1",
    userId: { email: "test1@gmail.com", fullName: "Trần A" },
    category: "BUG",
    content: "Ứng dụng bị văng khi quét lá",
    status: "PENDING",
    createdAt: "2026-03-16T10:00:00Z",
  },
  {
    _id: "fb2",
    userId: { email: "test2@gmail.com", fullName: "Lê B" },
    category: "FEATURE",
    content: "Mong muốn có thêm tính năng dự báo thời tiết 14 ngày",
    status: "REPLIED",
    adminReply:
      "Cảm ơn bạn, chúng tôi sẽ xem xét thêm vào bản cập nhật tới.",
    createdAt: "2026-03-15T14:30:00Z",
  },
];