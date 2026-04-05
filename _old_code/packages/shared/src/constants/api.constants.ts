export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    PROFILE: "/api/auth/profile",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    VERIFY_OTP: "/api/auth/verify-otp",
    RESET_PASSWORD: "/api/auth/reset-password",
    GOOGLE_LOGIN: "/api/auth/google",
    FACEBOOK_LOGIN: "/api/auth/facebook",
    SET_PASSWORD: "/api/auth/set-password",
  },

  // Users
  USERS: {
    BASE: "/api/users",
    BY_ID: (id: string) => `/api/users/${id}`,
    PROFILE: "/api/users/profile",
    UPGRADE: "/api/users/upgrade",
  },

  // Plants (Từ điển thực vật học)
  PLANTS: {
    BASE: "/api/plants",
    BY_ID: (id: string) => `/api/plants/${id}`,
    SEARCH: "/api/plants/search",
    BY_DISEASE: (diseaseId: string) => `/api/plants/by-disease/${diseaseId}`,
  },

  // Diseases (Từ điển bệnh lý)
  DISEASES: {
    BASE: "/api/diseases",
    BY_ID: (id: string) => `/api/diseases/${id}`,
    SEARCH: "/api/diseases/search",
    BY_TYPE: (type: string) => `/api/diseases/by-type/${type}`,
  },

  // AI Scan (Chẩn đoán bằng AI)
  SCAN: {
    ANALYZE: "/api/scan/analyze",
    CHAT: "/api/scan/chat",
    GUEST_CHAT: "/api/scan/guest-chat",
    FEEDBACK: (id: string) => `/api/scan/history/${id}/feedback`,
    // FIX: Thêm endpoint polling kết quả scan ảnh (RabbitMQ async)
    STATUS: (scanId: string) => `/api/scan/status/${scanId}`,
  },

  // Scan History (Lịch sử quét)
  HISTORY: {
    SCAN_BASE: "/api/scan/history",
    CHAT_BASE: "/api/scan/chat/history",
    SESSION: (id: string) => `/api/scan/chat/sessions/${id}`,
    // FIX: Thêm endpoint polling status tin nhắn chat (RabbitMQ async)
    SESSION_STATUS: (id: string) => `/api/scan/chat/sessions/${id}/status`,
  },

  // Weather
  WEATHER: {
    GET_WEATHER: "/api/weather",
  },

  // ── ADMIN ────────────────────────────────────────────────────────────────────
  ADMIN: {
    DASHBOARD: "/api/admin/dashboard",

    // Quản lý user
    USERS: "/api/admin/users",
    USER_PLAN: (userId: string) => `/api/admin/users/${userId}/plan`,

    // Báo cáo
    REPORTS: {
      USERS: "/api/admin/reports/users",
      REVENUE: "/api/admin/reports/revenue",
      COMPARE: "/api/admin/reports/compare",
    },

    // Xuất file CSV
    EXPORT: {
      REVENUE: "/api/admin/export/revenue",
      USERS: "/api/admin/export/users",
    },

    // Feedback
    FEEDBACK: {
      BASE: "/api/feedback", // POST (user gửi)
      LIST: "/api/admin/feedbacks", // GET (admin xem)
      REPLY: (feedbackId: string) => `/api/admin/feedbacks/${feedbackId}/reply`, // POST (admin reply)
    },
  },

  // ── MARKETPLACE (SẢN PHẨM & GIAN HÀNG) ──────────────────────────────────────
  PRODUCTS: {
    BASE: "/api/products", // Lấy danh sách & Tạo mới
    BY_ID: (id: string) => `/api/products/${id}`, // Xem chi tiết, Cập nhật, Xóa
    APPROVE: (id: string) => `/api/products/${id}/approve`, // (Tùy chọn cho Admin)
  },

  // ── ORDERS (ĐƠN HÀNG) ────────────────────────────────────────────────────────
  ORDERS: {
    BASE: "/api/orders", // Khách bấm đặt hàng
    MY_ORDERS: "/api/orders/my-orders", // Khách xem đơn đã mua
    SHOP_ORDERS: "/api/orders/shop-orders", // Chủ shop xem đơn khách đặt
    STATUS: (id: string) => `/api/orders/${id}/status`, // Cập nhật trạng thái đơn
  },
} as const;
