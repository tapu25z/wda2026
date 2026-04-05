"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Zap,
  Shield,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { userApi } from "@agri-scan/shared";
import { useAuth } from "@/hooks/useAuth";

const DEFAULT_PLAN = {
  name: "Plus",
  price: "129,000",
  subtotal: "117.273",
  vat: "11.727",
  features: [
    "Mô hình AI nâng cao",
    "Tăng giới hạn tin nhắn & tải ảnh",
    "Tạo hình ảnh chất lượng cao",
    "Bộ nhớ mở rộng",
  ],
};

function formatCard(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + " / " + digits.slice(2);
  return digits;
}

export function Payment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const name = searchParams.get("name") || DEFAULT_PLAN.name;
  const price = searchParams.get("price") || DEFAULT_PLAN.price;
  const subtotal = searchParams.get("subtotal") || DEFAULT_PLAN.subtotal;
  const vat = searchParams.get("vat") || DEFAULT_PLAN.vat;
  const featuresRaw = searchParams.get("features");
  const features: string[] = featuresRaw
    ? JSON.parse(featuresRaw)
    : DEFAULT_PLAN.features;

  const plan = { name, price, subtotal, vat, features };

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [holderName, setHolderName] = useState("");
  const [address, setAddress] = useState("");
  const [paid, setPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const PLAN_MAP: Record<string, 'PREMIUM' | 'VIP'> = {
        PLUS: 'PREMIUM',
        PREMIUM: 'PREMIUM',
        PRO: 'VIP',
        VIP: 'VIP',
      };
      const planKey = PLAN_MAP[plan.name.toUpperCase()];
      if (!planKey) throw new Error('Gói không hợp lệ');

      // Gọi lại /auth/profile để đồng bộ user state trong context
      await refreshUser();

      setPaid(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Thanh toán thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-emerald-50/20 to-gray-100 font-sans text-gray-900 pb-20 relative">
      {/* Background blob */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center mb-10"
        >
          <motion.button
            onClick={() => router.push("/upgrade")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm"
          >
            <ArrowLeft size={18} />
            Quay lại chọn gói
          </motion.button>
        </motion.div>

        {/* Success overlay */}
        <AnimatePresence>
          {paid && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-sm mx-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.25, type: "spring", stiffness: 250 }}
                  className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle2 size={40} className="text-emerald-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Thanh toán thành công!
                </h2>
                <p className="text-gray-500 text-sm mb-7">
                  Gói{" "}
                  <span className="text-emerald-600 font-semibold">
                    {plan.name}
                  </span>{" "}
                  đã được kích hoạt cho tài khoản của bạn.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/scan")}
                  className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200"
                >
                  Bắt đầu sử dụng
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Thông tin thanh toán
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card info */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-gray-900">
                    Phương thức thanh toán
                  </h3>
                  <div className="flex gap-2">
                    <div className="h-6 w-10 bg-blue-600 rounded flex items-center justify-center text-white text-[8px] font-bold italic">
                      VISA
                    </div>
                    <div className="h-6 w-10 bg-red-500 rounded flex items-center justify-center text-white text-[8px] font-bold">
                      MC
                    </div>
                    <div className="h-6 w-10 bg-blue-400 rounded flex items-center justify-center text-white text-[8px] font-bold">
                      AMEX
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Số thẻ
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        required
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCard(e.target.value))
                        }
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all text-sm"
                      />
                      <CreditCard
                        className="absolute left-3.5 top-3.5 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Ngày hết hạn
                      </label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        required
                        value={expiry}
                        onChange={(e) =>
                          setExpiry(formatExpiry(e.target.value))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mã CVC
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="123"
                          required
                          maxLength={4}
                          value={cvc}
                          onChange={(e) =>
                            setCvc(
                              e.target.value.replace(/\D/g, "").slice(0, 4),
                            )
                          }
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all text-sm"
                        />
                        <Lock
                          className="absolute left-3.5 top-3.5 text-gray-400"
                          size={18}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing address */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-5">
                  Địa chỉ thanh toán
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      required
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Quốc gia / Khu vực
                    </label>
                    <div className="relative">
                      <select className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all appearance-none bg-white text-sm">
                        <option>Việt Nam</option>
                        <option>United States</option>
                        <option>Singapore</option>
                      </select>
                      <Globe
                        className="absolute left-3.5 top-3.5 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      placeholder="Số nhà, tên đường..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              {/* Submit (mobile only shows here) */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className="w-full lg:hidden bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang xử lý..." : `Đăng ký ngay — ₫${plan.price}`}
              </motion.button>
            </form>
          </motion.div>

          {/* Right: Order summary */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 sticky top-28"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <Zap size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Gói {plan.name}
                  </h3>
                  <p className="text-xs text-gray-400">Thanh toán hàng tháng</p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-7">
                {plan.features.map((f, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    className="flex items-start text-sm text-gray-600 gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Zap size={11} className="text-emerald-600" />
                    </div>
                    {f}
                  </motion.li>
                ))}
              </ul>

              {/* Price breakdown */}
              <div className="border-t border-gray-100 pt-5 space-y-3 mb-7">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Giá gói hàng tháng</span>
                  <span>₫{plan.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>VAT (10%)</span>
                  <span>₫{plan.vat}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span>Thanh toán hôm nay</span>
                  <span className="text-emerald-600">₫{plan.price}</span>
                </div>
              </div>

              {/* CTA */}
              <motion.button
                onClick={handleSubmit}
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.97 } : {}}
                className="hidden lg:block w-full bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang xử lý..." : "Đăng ký ngay"}
              </motion.button>

              <p className="text-xs text-gray-400 mt-5 text-center leading-relaxed">
                Tự động gia hạn ₫{plan.price}/tháng.{" "}
                <span className="text-emerald-600 cursor-pointer hover:underline">
                  Hủy bất kỳ lúc nào
                </span>{" "}
                trong Cài đặt. Bằng việc đăng ký, bạn đồng ý với{" "}
                <span className="text-emerald-600 cursor-pointer hover:underline">
                  Điều khoản sử dụng
                </span>
                .
              </p>

              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400">
                <Shield size={12} />
                <span>Thanh toán bảo mật & mã hóa SSL</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
