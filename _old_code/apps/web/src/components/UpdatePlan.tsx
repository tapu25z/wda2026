"use client";

import React, { useState } from "react";
import { Check, ArrowLeft, Zap, Star, Crown, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export function UpdatePlan() {
  const router = useRouter();
  const { user } = useAuth();
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  // Plan của user hiện tại (FREE / PREMIUM / VIP), mặc định FREE nếu chưa đăng nhập
  const currentPlan = user?.plan?.toUpperCase() ?? "FREE";

  const plans = [
    {
      name: "Free",
      planKey: "FREE",
      price: "0",
      period: "tháng",
      description: "Khám phá sức mạnh của AI",
      features: [
        "3 ảnh/ngày (tải lên hoặc chụp)",
        "10 tin nhắn (prompts)/ngày",
        "Mô hình AI chẩn đoán cơ bản",
        "Hỗ trợ từ cộng đồng",
      ],
      buttonText: currentPlan === "FREE" ? "Gói hiện tại" : "Hạ xuống Free",
      current: currentPlan === "FREE",
      highlight: false,
      tag: undefined as string | undefined,
      theme: "gray" as const,
      icon: <Zap className="w-6 h-6" />,
    },
    {
      name: "Premium",
      planKey: "PREMIUM",
      price: "129,000",
      period: "tháng",
      description: "Mở khóa trải nghiệm đầy đủ",
      features: [
        "10 ảnh/ngày (tải lên hoặc chụp)",
        "50 tin nhắn (prompts)/ngày",
        "Mô hình AI nông nghiệp nâng cao",
        "Thời hạn sử dụng: 30 ngày",
      ],
      buttonText:
        currentPlan === "PREMIUM" ? "Gói hiện tại" : "Nâng cấp lên Plus",
      current: currentPlan === "PREMIUM",
      highlight: true,
      tag: "PHỔ BIẾN",
      theme: "purple" as const,
      icon: <Star className="w-6 h-6" />,
    },
    {
      name: "Vip",
      planKey: "VIP",
      price: "499,000",
      period: "tháng",
      description: "Tối đa hóa năng suất của bạn",
      features: [
        "20 ảnh/ngày (tải lên hoặc chụp)",
        "Vô hạn tin nhắn (prompts)/ngày",
        "Mô hình AI chuyên gia",
        "Thời hạn sử dụng: 30 ngày",
      ],
      buttonText: currentPlan === "VIP" ? "Gói hiện tại" : "Nâng cấp lên Pro",
      current: currentPlan === "VIP",
      highlight: false,
      tag: undefined as string | undefined,
      theme: "yellow" as const,
      icon: <Crown className="w-6 h-6" />,
    },
  ];

  const getThemeStyles = (theme: string, isCurrent: boolean) => {
    switch (theme) {
      case "purple":
        return {
          card: "bg-white border-purple-500 shadow-xl ring-1 ring-purple-500 scale-105 z-10",
          tag: "bg-purple-500 text-white",
          iconBg: "bg-purple-100 text-purple-600",
          button:
            "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200",
          check: "text-purple-500",
        };
      case "yellow":
        return {
          card: "bg-white border-amber-400 shadow-lg ring-1 ring-amber-400",
          tag: "bg-amber-500 text-white",
          iconBg: "bg-amber-100 text-amber-600",
          button:
            "bg-white text-amber-700 border border-amber-400 hover:bg-amber-50 hover:border-amber-500",
          check: "text-amber-500",
        };
      case "gray":
      default:
        return {
          card: "bg-white border-gray-200 shadow-sm hover:shadow-md",
          tag: "bg-gray-500 text-white",
          iconBg: "bg-gray-100 text-gray-600",
          button: isCurrent
            ? "bg-gray-100 text-gray-400 cursor-default border border-gray-200"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
          check: "text-gray-400",
        };
    }
  };

  const handleUpgrade = (plan: (typeof plans)[number]) => {
    const priceNumber = parseInt(plan.price.replace(/,/g, ""));
    const vat = Math.round(priceNumber * 0.1);
    const subtotal = priceNumber - vat;
    const features = plan.features
      .filter((f) => !f.startsWith("Tất cả tính năng"))
      .slice(0, 4);
    const params = new URLSearchParams({
      name: plan.name,
      price: plan.price,
      subtotal: subtotal.toLocaleString("vi-VN"),
      vat: vat.toLocaleString("vi-VN"),
      features: JSON.stringify(features),
    });
    router.push(`/payment?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-emerald-50/30 to-gray-100 text-gray-900 font-sans overflow-y-auto pb-20 relative">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center mb-14"
        >
          <motion.button
            onClick={() => router.push("/scan")}
            whileHover={{ scale: 1.1, backgroundColor: "#d1fae5" }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-full transition-colors mr-4 text-gray-600 bg-white shadow-sm border border-gray-100"
          >
            <ArrowLeft size={22} />
          </motion.button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={20} className="text-emerald-500" />
              <h1 className="text-3xl font-bold text-gray-900">
                Nâng cấp gói dịch vụ
              </h1>
            </div>
            <p className="text-gray-500">
              Chọn gói phù hợp với nhu cầu canh tác của bạn
            </p>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => {
            const styles = getThemeStyles(plan.theme, plan.current);
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.12,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                whileHover={
                  plan.theme !== "purple"
                    ? {
                        y: -6,
                        boxShadow: "0 20px 40px -12px rgba(16,185,129,0.15)",
                      }
                    : { y: -6 }
                }
                onHoverStart={() => setHoveredPlan(plan.name)}
                onHoverEnd={() => setHoveredPlan(null)}
                className={`flex flex-col p-8 rounded-3xl border transition-all duration-300 ${styles.card} relative overflow-hidden cursor-default`}
              >
                {/* Shimmer overlay on highlighted card */}
                {plan.theme === "purple" && (
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 2,
                    }}
                    className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-100/30 to-transparent skew-x-12 pointer-events-none z-0"
                  />
                )}

                {/* Tag badge */}
                {plan.tag && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.12 + 0.3,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className={`absolute top-0 right-0 text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-md ${styles.tag}`}
                  >
                    {plan.tag}
                  </motion.div>
                )}

                {/* Icon */}
                <motion.div
                  animate={
                    hoveredPlan === plan.name
                      ? { rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10 ${styles.iconBg}`}
                >
                  {plan.icon}
                </motion.div>

                <h3 className="text-2xl font-bold mb-2 relative z-10">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6 min-h-10 relative z-10">
                  {plan.description}
                </p>

                {/* Price */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.12 + 0.2 }}
                  className="mb-6 flex items-baseline relative z-10"
                >
                  <span className="text-sm align-top mr-1 font-medium text-gray-400">
                    ₫
                  </span>
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 ml-2 text-sm">
                    / {plan.period}
                  </span>
                </motion.div>

                {/* CTA Button */}
                <motion.button
                  onClick={() => !plan.current && handleUpgrade(plan)}
                  disabled={plan.current}
                  whileHover={!plan.current ? { scale: 1.03 } : {}}
                  whileTap={!plan.current ? { scale: 0.97 } : {}}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm mb-8 transition-all relative z-10 ${styles.button}`}
                >
                  {plan.buttonText}
                </motion.button>

                {/* Features */}
                <div className="flex-1 border-t border-gray-100 pt-6 relative z-10">
                  {plan.name === "Pro" && (
                    <p className="text-sm font-bold mb-4 text-gray-900">
                      Bao gồm mọi thứ của Plus và:
                    </p>
                  )}
                  <ul className="space-y-3.5">
                    {plan.features.map((feature, i) =>
                      feature.startsWith("Tất cả tính năng") ? null : (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: index * 0.12 + 0.2 + i * 0.06,
                            duration: 0.35,
                          }}
                          className="flex items-start text-sm text-gray-600"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: index * 0.12 + 0.2 + i * 0.06 + 0.1,
                              type: "spring",
                              stiffness: 300,
                            }}
                            className={`mr-3 mt-0.5 shrink-0 ${styles.check}`}
                          >
                            <Check size={18} strokeWidth={2.5} />
                          </motion.div>
                          <span className="leading-relaxed">{feature}</span>
                        </motion.li>
                      ),
                    )}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 text-sm">
            Bạn cần gói doanh nghiệp tùy chỉnh?{" "}
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              className="text-emerald-600 font-medium hover:underline inline-block"
            >
              Liên hệ với chúng tôi
            </motion.a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
