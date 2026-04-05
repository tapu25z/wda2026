/**
 * App Constants - Dùng chung cho Web và Mobile
 */

export const APP_NAME = 'Agri-Scan AI';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Bác sĩ cây trồng thông minh - AI Diagnosis for Plants';

// API Configuration
export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_COUNT = 3;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Image upload constraints
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// AI Prediction thresholds
export const MIN_CONFIDENCE_THRESHOLD = 0.3;  // 30% - Hiển thị tối thiểu
export const HIGH_CONFIDENCE_THRESHOLD = 0.8; // 80% - Độ tin cậy cao

// Freemium limits (theo Business Model trong DOC)
export const FREE_SCAN_LIMIT_PER_DAY = 3;
