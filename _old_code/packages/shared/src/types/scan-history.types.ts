import { IDisease } from './disease.types';

// ─────────────────────────────────────────────────────────────────────────────
// SCAN — TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface IAIPrediction {
  diseaseId: IDisease | string;  // Đã populate khi COMPLETED, chỉ là string ID khi chưa
  confidence: number;            // 0.0 – 1.0
}

/**
 * Response của POST /scan/analyze (bước 1 — gửi ảnh)
 *
 * THAY ĐỔI: Trước đây trả về predictions ngay lập tức.
 * Giờ backend đẩy job vào RabbitMQ và trả về PROCESSING ngay.
 * Frontend phải dùng scanHistoryId để poll GET /scan/status/:id.
 */
export interface IScanSubmitResponse {
  scanHistoryId: string;
  imageUrl: string;
  status: 'PROCESSING';
  message: string;
}

/**
 * Response của GET /scan/status/:scanHistoryId (bước 2 — poll kết quả)
 *
 * MỚI HOÀN TOÀN: Không có type này trước đây.
 * Poll endpoint này sau 2-3 giây cho đến khi status = COMPLETED | FAILED.
 */
export interface IScanStatusResponse {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  message?: string;
  // Chỉ có khi status = COMPLETED
  scanHistoryId?: string;
  imageUrl?: string;
  predictions?: IAIPrediction[];
  topDisease?: IDisease | null;
}

// Giữ IScanResult như alias để không break code cũ đang dùng
// @deprecated — dùng IScanSubmitResponse thay thế
export type IScanResult = IScanSubmitResponse;

// ─────────────────────────────────────────────────────────────────────────────
// CHAT — TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface IChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: string | Date;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED';
}

/**
 * Response của POST /scan/chat (bước 1 — gửi câu hỏi)
 *
 * THAY ĐỔI: answer giờ là null khi status = PROCESSING.
 * Frontend phải poll GET /scan/chat/sessions/:sessionId/status để lấy câu trả lời thật.
 */
export interface IChatSubmitResponse {
  sessionId: string;
  question: string;
  answer: string | null;          // null khi PROCESSING, string khi COMPLETED
  status: 'PROCESSING' | 'COMPLETED';
  message?: string;
}

/**
 * Response của GET /scan/chat/sessions/:sessionId/status (bước 2 — poll kết quả)
 *
 * MỚI HOÀN TOÀN: Không có type này trước đây.
 */
export interface IChatStatusResponse {
  status: 'PROCESSING' | 'COMPLETED' | 'EMPTY' | 'FAILED';
  answer?: string;
  message?: string;
  sessionId?: string;
  messages?: IChatMessage[];
}

// Giữ IChatResponse như alias để không break code cũ
// @deprecated — dùng IChatSubmitResponse thay thế
export type IChatResponse = IChatSubmitResponse;

// ─────────────────────────────────────────────────────────────────────────────
// SESSION / HISTORY — TYPES (giữ nguyên, không thay đổi)
// ─────────────────────────────────────────────────────────────────────────────

export interface IChatSession {
  sessionId: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IChatSessionDetail {
  sessionId: string;
  title: string | null;
  messages: IChatMessage[];
}

export interface IScanHistory {
  id: string;
  userId: string;
  imageUrl: string;
  aiPredictions: IAIPrediction[];
  isAccurate?: boolean;
  scannedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IScanHistoryListItem {
  id: string;
  imageUrl: string;
  topPrediction: IAIPrediction;
  scannedAt: Date;
}

export interface IScanHistoryDetail extends IScanHistory {
  predictionsWithDetails: Array<{
    disease: IDisease;
    confidence: number;
  }>;
}