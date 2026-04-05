/**
 * Format Utilities - Dùng chung cho Web và Mobile
 */

/**
 * Format confidence percentage
 * VD: 0.95 -> "95%"
 */
export const formatConfidence = (confidence: number): string => {
  return `${Math.round(confidence * 100)}%`;
};

/**
 * Format date to Vietnamese locale
 */
export const formatDateVN = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date time to Vietnamese locale
 */
export const formatDateTimeVN = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format relative time (VD: "2 giờ trước", "3 ngày trước")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }

  return formatDateVN(date);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
