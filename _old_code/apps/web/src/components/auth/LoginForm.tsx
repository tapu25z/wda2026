"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Leaf,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { loginSchema, type LoginFormData } from "@agri-scan/shared";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: loginApi, loginWithGoogle, loginWithFacebook } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const isRegistrationSuccess =
    searchParams.get("message") === "registration_success";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // BUG FIX: trước chỉ gọi login(data.email) → mật khẩu không bao giờ được gửi lên BE
      const res = await loginApi(data.email, data.password);
      if (res.role === 'ADMIN') {
        router.push("/admin/dashboard");
        console.log("Đăng nhập thành công với vai trò ADMIN");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại sau.";
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
            Chào mừng trở lại
          </h2>
          <p className="mt-2 text-gray-600">
            Đăng nhập để tiếp tục quản lý vườn cây của bạn
          </p>
        </div>

        {isRegistrationSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-200">
            <CheckCircle size={18} className="shrink-0" />
            <span>Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:text-primary-dark"
                >
                  Quên mật khẩu?
                </Link>
              </div>
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
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
            </div>
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

          {errors.terms && (
            <p className="mt-1 text-sm text-red-500">{errors.terms.message}</p>
          )}

          {/* Lỗi từ backend */}
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
                Đăng nhập <ArrowRight className="ml-2" size={20} />
              </>
            )}
          </button>

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
              onClick={loginWithGoogle}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all"
            >
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
              onClick={loginWithFacebook}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all"
            >
              <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </motion.button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-500">Chưa có tài khoản? </span>
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Đăng ký ngay
            </Link>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
