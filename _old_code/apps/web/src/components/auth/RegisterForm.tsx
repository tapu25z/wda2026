"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Leaf,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { registerSchema, type RegisterFormData } from "@agri-scan/shared";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterForm() {
  const router = useRouter();
  const { register: registerApi, loginWithGoogle, loginWithFacebook } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // BUG FIX: đã xóa dòng `0` lạ gây syntax error ở đây
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema as Zod.ZodType<RegisterFormData>),
  });

  const password = watch("password", "");
  const isPasswordLengthValid = password.length >= 8;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // BUG FIX: trước chỉ gọi registerApi(data.email, data.fullName) → password không được gửi lên BE
      await registerApi(data.email, data.fullName, data.password);
      // Đăng ký xong chuyển về login với thông báo thành công
      router.push("/login?message=registration_success");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
      setError("root", { type: "server", message: errorMessage });
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto mb-4">
            <Leaf size={28} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-gray-600">
            Bắt đầu hành trình quản lý vườn cây thông minh
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={20} />
                </div>
                <input
                  {...register("fullName")}
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={20} />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}

              {/* Yêu cầu mật khẩu */}
              <div className="mt-3 text-sm space-y-1">
                <p className="font-medium text-gray-700 mb-1">
                  Yêu cầu mật khẩu:
                </p>
                {[
                  [isPasswordLengthValid, "Ít nhất 8 ký tự"],
                  [hasUpperCase, "Chứa chữ in hoa"],
                  [hasLowerCase, "Chứa chữ thường"],
                  [hasNumber, "Chứa số"],
                  [hasSpecialChar, "Chứa ký tự đặc biệt"],
                ].map(([valid, label]) => (
                  <p
                    key={label as string}
                    className={`text-xs flex items-center gap-1 ${valid ? "text-green-600" : "text-gray-400"
                      }`}
                  >
                    <span className="w-1 h-1 bg-current rounded-full" />
                    {label as string}
                  </p>
                ))}
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-primary/30 text-primary cursor-pointer  accent-primary "
                  appearance-none="true"
                  {...register("terms")}
                />
              </div>

              <div className="ml-3 text-sm">
                <label
                  htmlFor="terms"
                  className="font-medium text-gray-600 cursor-pointer"
                >
                  Tôi đồng ý với{" "}
                  <Link
                    href="/terms"
                    className="text-primary hover:text-primary-dark hover:underline"
                  >
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:text-primary-dark hover:underline"
                  >
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>
            </div>
          </div>

          {errors.terms && (
            <p className="mt-1 text-sm text-red-500">{errors.terms.message}</p>
          )}

          {/* Lỗi backend */}
          {errors.root && (
            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center border border-red-100">
              {errors.root.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2" size={20} />
                Đang xử lý...
              </>
            ) : (
              <>
                Tạo tài khoản <ArrowRight className="ml-2" size={20} />
              </>
            )}
          </button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Hoặc đăng ký bằng
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all"
                onClick={loginWithGoogle}>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all"
                onClick={loginWithFacebook}
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="#1877F2"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </motion.button>
            </div>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-500">Đã có tài khoản? </span>
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Đăng nhập
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
