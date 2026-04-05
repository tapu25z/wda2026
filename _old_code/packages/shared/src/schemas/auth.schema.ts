import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, { message: "Email không được để trống" })
    .email({ message: "Email không hợp lệ" }),
  password: z.string()
    .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  terms: z.boolean().refine(val => val === true, { message: "Bạn phải đồng ý với Điều khoản và Chính sách bảo mật" })
});

export const registerSchema = z.object({
  fullName: z.string()
    .min(2, { message: "Họ tên phải có ít nhất 2 ký tự" })
    .max(50, { message: "Họ tên không được quá 50 ký tự" })
    .refine(val => /^[\p{L}\p{M}\s]+$/u.test(val.normalize('NFC').trim()), {
    message: "Họ tên chỉ được chứa chữ cái và khoảng trắng"
  }),
  email: z.string()
    .min(1, { message: "Email không được để trống" })
    .email({ message: "Email không hợp lệ" }),
  password: z.string()
    .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
    .regex(/[A-Z]/, { message: "Mật khẩu phải chứa ít nhất 1 chữ hoa" })
    .regex(/[a-z]/, { message: "Mật khẩu phải chứa ít nhất 1 chữ thường" })
    .regex(/[0-9]/, { message: "Mật khẩu phải chứa ít nhất 1 số" })
    .regex(/[^A-Za-z0-9]/, { message: "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt" }),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, { message: "Bạn phải đồng ý với Điều khoản và Chính sách bảo mật" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, { message: "Email không được để trống" })
    .email({ message: "Email không hợp lệ" })
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token không hợp lệ" }),
  password: z.string()
    .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
    .regex(/[A-Z]/, { message: "Mật khẩu phải chứa ít nhất 1 chữ hoa" })
    .regex(/[a-z]/, { message: "Mật khẩu phải chứa ít nhất 1 chữ thường" })
    .regex(/[0-9]/, { message: "Mật khẩu phải chứa ít nhất 1 số" })
    .regex(/[^A-Za-z0-9]/, { message: "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export const setPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
    .regex(/[A-Z]/, { message: "Mật khẩu phải chứa ít nhất 1 chữ hoa" })
    .regex(/[a-z]/, { message: "Mật khẩu phải chứa ít nhất 1 chữ thường" })
    .regex(/[0-9]/, { message: "Mật khẩu phải chứa ít nhất 1 số" })
    .regex(/[^A-Za-z0-9]/, { message: "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt" }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});



// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type SetPasswordFormData = z.infer<typeof setPasswordSchema>;