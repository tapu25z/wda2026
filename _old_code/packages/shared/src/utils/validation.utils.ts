/**
 * Validation Utilities - Dùng chung cho Web và Mobile
 */

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '../constants/app.constants';

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Yêu cầu: Ít nhất 8 ký tự, có chữ hoa, chữ thường và số
 */
export const isStrongPassword = (password: string): boolean => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return minLength && hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * Get password strength level
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak';

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score >= 5) return 'strong';
  if (score >= 3) return 'medium';
  return 'weak';
};

/**
 * Validate image file
 */
export const isValidImageFile = (file: File | Blob): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'Vui lòng chọn file ảnh' };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: `Kích thước file vượt quá ${MAX_IMAGE_SIZE / 1024 / 1024}MB` };
  }

  // Bỏ qua kiểm tra MIME type trên React Native (type có thể rỗng hoặc không chuẩn)
  const mimeType = file.type;
  if (mimeType && !ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return { valid: false, error: 'Chỉ chấp nhận file ảnh JPG, PNG hoặc WebP' };
  }

  return { valid: true };
};

/**
 * Validate Vietnamese phone number
 */
export const isValidVietnamPhone = (phone: string): boolean => {
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};
