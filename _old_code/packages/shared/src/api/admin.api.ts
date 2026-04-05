import { axiosClient } from "./axios-client";
import { API_ENDPOINTS } from "../constants";
import type {
  IDashboard,
  IAdminUsersResponse,
  IGetUsersQuery,
  IUpdatePlanResponse,
  IGetReportQuery,
  ITimeSeriesPoint,
  IRevenueReport,
  ICompareMonthsResponse,
  IFeedbacksResponse,
  ISubmitFeedbackPayload,
  IMessageResponse,
} from "../types/admin.types";

export const adminApi = {
  // ════════════════════════════════════════════════════════════
  // DASHBOARD
  // ════════════════════════════════════════════════════════════

  /**
   * Lấy tổng quan hệ thống: số user, doanh thu, feedback chờ xử lý...
   * GET /admin/dashboard
   */
  getDashboard: async (): Promise<IDashboard> => {
    const res = await axiosClient.get(API_ENDPOINTS.ADMIN.DASHBOARD);
    return res.data;
  },

  // ════════════════════════════════════════════════════════════
  // QUẢN LÝ NGƯỜI DÙNG
  // ════════════════════════════════════════════════════════════

  /**
   * Lấy danh sách user, hỗ trợ filter và phân trang
   * GET /admin/users?plan=PREMIUM&search=nguyen&page=1&limit=20
   */
  getUsers: async (query?: IGetUsersQuery): Promise<IAdminUsersResponse> => {
    const res = await axiosClient.get(API_ENDPOINTS.ADMIN.USERS, {
      params: query,
    });
    return res.data;
  },

  /**
   * Admin cập nhật gói cho user (tặng PREMIUM/VIP hoặc hạ về FREE)
   * PATCH /admin/users/:id/plan
   */
  updateUserPlan: async (
    userId: string,
    plan: "FREE" | "PREMIUM" | "VIP",
  ): Promise<IUpdatePlanResponse> => {
    const res = await axiosClient.patch(API_ENDPOINTS.ADMIN.USER_PLAN(userId), {
      plan,
    });
    return res.data;
  },

  // ════════════════════════════════════════════════════════════
  // BÁO CÁO
  // ════════════════════════════════════════════════════════════

  /**
   * Báo cáo người dùng mới đăng ký theo ngày/tháng
   * GET /admin/reports/users?from=2026-01-01&to=2026-03-31&groupBy=day
   */
  getNewUsersReport: async (
    query: IGetReportQuery,
  ): Promise<ITimeSeriesPoint[]> => {
    const res = await axiosClient.get(API_ENDPOINTS.ADMIN.REPORTS.USERS, {
      params: query,
    });
    return res.data;
  },

  /**
   * Báo cáo doanh thu theo ngày/tháng, có breakdown theo gói PREMIUM/VIP
   * GET /admin/reports/revenue?from=2026-01-01&to=2026-03-31&groupBy=month
   */
  getRevenueReport: async (query: IGetReportQuery): Promise<IRevenueReport> => {
    const res = await axiosClient.get(API_ENDPOINTS.ADMIN.REPORTS.REVENUE, {
      params: query,
    });
    return res.data;
  },

  /**
   * So sánh số liệu giữa 2 tháng bất kỳ (trả về % thay đổi)
   * GET /admin/reports/compare?month1=2026-01-01&month2=2026-02-01
   */
  compareMonths: async (
    month1: string,
    month2: string,
  ): Promise<ICompareMonthsResponse> => {
    const res = await axiosClient.get(API_ENDPOINTS.ADMIN.REPORTS.COMPARE, {
      params: { month1, month2 },
    });
    return res.data;
  },

  // ════════════════════════════════════════════════════════════
  // XUẤT FILE BÁO CÁO
  // ════════════════════════════════════════════════════════════

  /**
   * Tải file CSV doanh thu về máy
   * GET /admin/export/revenue?from=...&to=...
   *
   * Cách dùng ở frontend:
   *   const blob = await adminApi.exportRevenueCsv('2026-01-01', '2026-03-31');
   *   const url = URL.createObjectURL(blob);
   *   const a = document.createElement('a'); a.href = url; a.click();
   */
  exportRevenueCsv: async (from: string, to: string): Promise<Blob> => {
    const res = await axiosClient.get(API_ENDPOINTS.ADMIN.EXPORT.REVENUE, {
      params: { from, to },
      responseType: "blob",
    });
    return res.data;
  },

  /**
   * Tải file CSV danh sách user mới đăng ký về máy
   * GET /admin/export/users?from=...&to=...
   */
  exportUsersCsv: async (from: string, to: string): Promise<Blob> => {
    const res = await axiosClient.get(API_ENDPOINTS.ADMIN.EXPORT.USERS, {
      params: { from, to },
      responseType: "blob",
    });
    return res.data;
  },

  // ════════════════════════════════════════════════════════════
  // FEEDBACK
  // ════════════════════════════════════════════════════════════

  /**
   * Người dùng gửi feedback (chỉ cần đăng nhập, không cần quyền ADMIN)
   * POST /feedback
   */
  submitFeedback: async (
    data: ISubmitFeedbackPayload,
  ): Promise<IMessageResponse & { id: string }> => {
    const res = await axiosClient.post(API_ENDPOINTS.ADMIN.FEEDBACK.BASE, data);
    return res.data;
  },

  /**
   * Admin lấy danh sách feedback, filter theo status
   * GET /admin/feedbacks?status=PENDING&page=1&limit=20
   */
  getFeedbacks: async (
    status?: "PENDING" | "REPLIED",
    page = 1,
    limit = 20,
  ): Promise<IFeedbacksResponse> => {
    const res = await axiosClient.get(API_ENDPOINTS.ADMIN.FEEDBACK.LIST, {
      params: { status, page, limit },
    });
    return res.data;
  },

  /**
   * Admin trả lời feedback của user
   * POST /admin/feedbacks/:id/reply
   */
  replyFeedback: async (
    feedbackId: string,
    reply: string,
  ): Promise<IMessageResponse> => {
    const res = await axiosClient.post(
      API_ENDPOINTS.ADMIN.FEEDBACK.REPLY(feedbackId),
      { reply },
    );
    return res.data;
  },

  /**
   * Lấy lịch sử phản hồi của chính User đang đăng nhập
   * GET /feedback
   */
  getMyFeedbacks: async (page = 1, limit = 20): Promise<IFeedbacksResponse> => {
    const res = await axiosClient.get(API_ENDPOINTS.ADMIN.FEEDBACK.BASE, {
      params: { page, limit },
    });
    return res.data;
  },
};
