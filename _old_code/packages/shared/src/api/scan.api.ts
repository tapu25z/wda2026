/**
 * scan.api.ts — API layer cho tính năng Scan & Chat
 * Dùng chung cho Web (Next.js) và Mobile (React Native / Expo)
 *
 * THAY ĐỔI LỚN SO VỚI TRƯỚC (team frontend cần đọc):
 *
 * 1. scanImage() — vẫn gọi POST /scan/analyze như cũ, NHƯNG:
 *    - Trước: trả về kết quả predictions ngay lập tức
 *    - Giờ:   trả về { scanHistoryId, status: 'PROCESSING' } → cần poll tiếp
 *
 * 2. chatWithAi() — vẫn gọi POST /scan/chat như cũ, NHƯNG:
 *    - Trước: trả về answer ngay lập tức
 *    - Giờ:   trả về { sessionId, answer: null, status: 'PROCESSING' } → cần poll tiếp
 *
 * 3. [MỚI] scanApi.pollScanResult(scanHistoryId) — gọi lặp cho đến khi có kết quả scan
 * 4. [MỚI] scanApi.pollChatAnswer(sessionId)     — gọi lặp cho đến khi có câu trả lời
 * 5. [MỚI] scanApi.scanImageAndWait(file)        — wrapper tiện lợi: submit + poll trong 1 lần gọi
 * 6. [MỚI] scanApi.chatAndWait(question, ...)    — wrapper tiện lợi: submit + poll trong 1 lần gọi
 */

import { axiosClient } from './axios-client';
import { getTokenStorage } from './token-manager';
import { API_ENDPOINTS } from '../constants';
import type {
  IScanSubmitResponse,
  IScanStatusResponse,
  IChatSubmitResponse,
  IChatStatusResponse,
  IChatSession,
  IChatSessionDetail,
  IScanHistoryListItem,
  IScanHistoryDetail,
  // Aliases cũ — vẫn export để không break code đang dùng
  IScanResult,
  IChatResponse,
} from '../types/scan-history.types';

// Re-export types để các component chỉ cần import từ scan.api
export type {
  IScanSubmitResponse,
  IScanStatusResponse,
  IChatSubmitResponse,
  IChatStatusResponse,
  IScanResult,
  IChatResponse,
};

// ─────────────────────────────────────────────────────────────────────────────
// POLLING CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 2000;   // Gọi lại mỗi 2 giây
const POLL_MAX_ATTEMPTS = 30;    // Tối đa 30 lần = 60 giây timeout

// ─────────────────────────────────────────────────────────────────────────────
// SCAN API
// ─────────────────────────────────────────────────────────────────────────────

export const scanApi = {
  /**
   * Bước 1 — Gửi ảnh lên hàng đợi xử lý.
   *
   * THAY ĐỔI: Trước đây trả về predictions ngay. Giờ trả về PROCESSING + scanHistoryId.
   * → Sau khi gọi hàm này, dùng pollScanResult(scanHistoryId) hoặc scanImageAndWait() thay thế.
   *
   * POST /api/scan/analyze
   */
  scanImage: async (file: File | Blob | any): Promise<IScanSubmitResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await axiosClient.post<IScanSubmitResponse>(
      API_ENDPOINTS.SCAN.ANALYZE,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 },
    );
    return res.data;
  },

  /**
   * Bước 2 — Poll kết quả scan cho đến khi có kết quả hoặc timeout.
   *
   * MỚI HOÀN TOÀN.
   * Throws nếu timeout hoặc status = FAILED.
   *
   * GET /api/scan/status/:scanHistoryId
   */
  pollScanResult: async (scanHistoryId: string): Promise<IScanStatusResponse> => {
    for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const res = await axiosClient.get<IScanStatusResponse>(
        API_ENDPOINTS.SCAN.STATUS(scanHistoryId),
      );
      const data = res.data;

      if (data.status === 'COMPLETED') return data;
      if (data.status === 'FAILED') {
        throw new Error(data.message || 'AI không nhận diện được ảnh, vui lòng thử lại.');
      }
      // PENDING | PROCESSING → tiếp tục vòng lặp
    }
    throw new Error('Hệ thống phân tích quá thời gian. Vui lòng thử lại sau.');
  },

  /**
   * Wrapper tiện lợi: gửi ảnh + tự động poll → trả về kết quả thật trong 1 lần gọi.
   *
   * MỚI HOÀN TOÀN.
   * Dùng hàm này thay thế scanImage() trong đa số trường hợp.
   * Chỉ dùng scanImage() riêng lẻ khi cần tách UI "đang upload" và "đang phân tích".
   */
  scanImageAndWait: async (file: File | Blob | any): Promise<IScanStatusResponse> => {
    const submitted = await scanApi.scanImage(file);
    return scanApi.pollScanResult(submitted.scanHistoryId);
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CHAT API
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Bước 1 — Gửi câu hỏi vào hàng đợi.
   *
   * THAY ĐỔI: Trước đây trả về answer ngay. Giờ trả về answer: null + PROCESSING + sessionId.
   * → Sau khi gọi hàm này, dùng pollChatAnswer(sessionId) hoặc chatAndWait() để lấy câu trả lời.
   *
   * POST /api/scan/chat        (đã đăng nhập — lưu lịch sử)
   * POST /api/scan/guest-chat  (khách vãng lai — không lưu lịch sử, trả về COMPLETED ngay)
   */
  chatWithAi: async (
    question: string,
    label?: string,
    sessionId?: string,
  ): Promise<IChatSubmitResponse> => {
    const tokenStorage = getTokenStorage();
    const token = tokenStorage ? await tokenStorage.getAccessToken() : null;

    if (!token) {
      // Khách vãng lai: backend gọi AI trực tiếp không qua queue → trả về COMPLETED ngay
      const res = await axiosClient.post<IChatSubmitResponse>(
        API_ENDPOINTS.SCAN.GUEST_CHAT,
        { question, label },
      );
      return res.data;
    }

    const res = await axiosClient.post<IChatSubmitResponse>(
      API_ENDPOINTS.SCAN.CHAT,
      { question, label, sessionId },
    );
    return res.data;
  },

  /**
   * Bước 2 — Poll câu trả lời cho đến khi AI xử lý xong hoặc timeout.
   *
   * MỚI HOÀN TOÀN.
   * Throws nếu timeout hoặc status = FAILED.
   * Không cần gọi nếu chatWithAi() trả về status = COMPLETED (trường hợp guest).
   *
   * GET /api/scan/chat/sessions/:sessionId/status
   */
  pollChatAnswer: async (sessionId: string): Promise<IChatStatusResponse> => {
    for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const res = await axiosClient.get<IChatStatusResponse>(
        API_ENDPOINTS.HISTORY.SESSION_STATUS(sessionId),
      );
      const data = res.data;

      if (data.status === 'COMPLETED') return data;
      if (data.status === 'FAILED') {
        throw new Error(data.message || 'Trợ lý ảo gặp lỗi, vui lòng thử lại.');
      }
      // PROCESSING → tiếp tục vòng lặp
    }
    throw new Error('Trợ lý ảo phản hồi quá chậm. Vui lòng thử lại sau.');
  },

  /**
   * Wrapper tiện lợi: gửi câu hỏi + tự động poll → trả về câu trả lời thật trong 1 lần gọi.
   *
   * MỚI HOÀN TOÀN.
   * Dùng hàm này thay thế chatWithAi() trong đa số trường hợp.
   * Với khách vãng lai, không cần poll vì backend trả về COMPLETED ngay.
   */
  chatAndWait: async (
    question: string,
    label?: string,
    sessionId?: string,
  ): Promise<IChatStatusResponse> => {
    const submitted = await scanApi.chatWithAi(question, label, sessionId);

    // Khách vãng lai hoặc trường hợp đặc biệt backend trả về ngay
    if (submitted.status === 'COMPLETED') {
      return {
        status: 'COMPLETED',
        answer: submitted.answer ?? '',
        sessionId: submitted.sessionId ?? undefined,
      };
    }

    // Người dùng đã đăng nhập — sessionId luôn có
    return scanApi.pollChatAnswer(submitted.sessionId!);
  },

  // ───────────────────────────────────────────────────────────────────────────
  // HISTORY API (không thay đổi so với trước)
  // ───────────────────────────────────────────────────────────────────────────

  /** GET /api/scan/history */
  getScanHistory: async (): Promise<IScanHistoryListItem[]> => {
    const res = await axiosClient.get<IScanHistoryListItem[]>(API_ENDPOINTS.HISTORY.SCAN_BASE);
    return res.data;
  },

  /** GET /api/scan/history/:id */
  getScanDetail: async (scanId: string): Promise<IScanHistoryDetail> => {
    const res = await axiosClient.get<IScanHistoryDetail>(
      `${API_ENDPOINTS.HISTORY.SCAN_BASE}/${scanId}`,
    );
    return res.data;
  },

  /** GET /api/scan/chat/history */
  getChatHistory: async (): Promise<IChatSession[]> => {
    const res = await axiosClient.get<IChatSession[]>(API_ENDPOINTS.HISTORY.CHAT_BASE);
    return res.data;
  },

  /** GET /api/scan/chat/sessions/:sessionId */
  getSessionMessages: async (sessionId: string): Promise<IChatSessionDetail> => {
    const res = await axiosClient.get<IChatSessionDetail>(
      API_ENDPOINTS.HISTORY.SESSION(sessionId),
    );
    return res.data;
  },

  /** PATCH /api/scan/history/:id/feedback */
  sendFeedback: async (scanId: string, isAccurate: boolean): Promise<void> => {
    await axiosClient.patch(API_ENDPOINTS.SCAN.FEEDBACK(scanId), { isAccurate });
  },

  // Giữ lại để không break code cũ đang gọi riêng lẻ
  getScanStatus: async (scanId: string): Promise<IScanStatusResponse> => {
    const res = await axiosClient.get<IScanStatusResponse>(API_ENDPOINTS.SCAN.STATUS(scanId));
    return res.data;
  },

  getChatStatus: async (sessionId: string): Promise<IChatStatusResponse> => {
    const res = await axiosClient.get<IChatStatusResponse>(
      API_ENDPOINTS.HISTORY.SESSION_STATUS(sessionId),
    );
    return res.data;
  },
};