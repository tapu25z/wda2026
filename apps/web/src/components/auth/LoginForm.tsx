"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { loginSchema, type LoginFormData } from "@agriscan/shared";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
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
    defaultValues: { email: "", password: "", terms: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const u = await login(data.email, data.password);
      if (u.role === "ADMIN") {
        router.push("/");
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const raw = err.response?.data?.message;
      const msg = Array.isArray(raw) ? raw.join(", ") : raw;
      setError("root", {
        type: "server",
        message: msg || "Đăng nhập thất bại. Vui lòng thử lại.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Leaf size={28} className="text-[var(--color-primary)]" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Chào mừng trở lại</h2>
          <p className="mt-2 text-gray-600">Đăng nhập Agri-Scan AI</p>
        </div>

        {isRegistrationSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-200">
            <CheckCircle size={18} className="shrink-0" />
            <span>Đăng ký thành công! Vui lòng đăng nhập.</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("email")}
                  type="email"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-[var(--color-primary)] w-full"
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-[var(--color-primary)] w-full"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input id="terms" type="checkbox" className="mt-1" {...register("terms")} />
            <label htmlFor="terms" className="text-sm text-gray-600">
              Tôi đồng ý với Điều khoản và Chính sách bảo mật
            </label>
          </div>
          {errors.terms && (
            <p className="text-sm text-red-500">{errors.terms.message}</p>
          )}

          {errors.root && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
              {errors.root.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-white font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Đang xử lý...
              </>
            ) : (
              <>
                Đăng nhập <ArrowRight className="ml-2" size={20} />
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-medium text-[var(--color-primary)]">
              Đăng ký
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
