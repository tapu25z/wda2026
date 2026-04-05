// BUG FIX: Login.tsx và Register.tsx là các component CŨ dùng useAuth() stub (không gọi API thật)
// Đã thay thế bằng LoginForm và RegisterForm (kết nối đầy đủ với backend)
// Xóa Login.tsx và Register.tsx nếu không còn dùng nữa để tránh nhầm lẫn

export { default as LoginForm } from './LoginForm';
export { default as RegisterForm } from './RegisterForm';
export { default as ForgotPasswordForm } from './ForgotPasswordForm';
