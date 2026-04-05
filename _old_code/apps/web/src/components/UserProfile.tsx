"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  Settings,
  Leaf,
  Zap,
  Star,
  Crown,
  Calendar,
  Loader2,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { scanApi } from "@agri-scan/shared";

type StatsState = {
  scanCount: number;
  chatCount: number;
  diseaseCount: number;
};

export function UserProfile() {
  const { user, logout, setPassword } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<StatsState>({
    scanCount: 0,
    chatCount: 0,
    diseaseCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoadingStats(false);
      return;
    }

    let isMounted = true;
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const [scans, chats] = await Promise.all([
          scanApi.getScanHistory(),
          scanApi.getChatHistory(),
        ]);

        const diseases = new Set(
          scans.flatMap(
            (scan: any) =>
              scan.aiPredictions
                ?.map((prediction: any) => prediction?.diseaseId?.name)
                .filter(Boolean) ?? [],
          ),
        );

        if (!isMounted) return;
        setStats({
          scanCount: scans.length,
          chatCount: chats.length,
          diseaseCount: diseases.size,
        });
      } catch (error) {
        console.error("Load profile stats failed:", error);
        if (isMounted)
          setStats({ scanCount: 0, chatCount: 0, diseaseCount: 0 });
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    };

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu phải ít nhất 8 ký tự");
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordError(
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, thường và 1 số và ký tự đặc biệt",
      );
      return;
    }
    setIsSettingPassword(true);
    try {
      await setPassword(newPassword);
      setPasswordSuccess(true);
      setNewPassword("");
    } catch (err: any) {
      setPasswordError(
        err?.response?.data?.message ?? "Có lỗi xảy ra. Thử lại.",
      );
    } finally {
      setIsSettingPassword(false);
    }
  };

  // Helper cho Badge gói dịch vụ
  const PlanBadge = () => {
    const configs: Record<string, any> = {
      VIP: {
        color: "bg-amber-100 text-amber-700",
        icon: <Crown size={12} fill="currentColor" />,
        label: "VIP",
      },
      PREMIUM: {
        color: "bg-purple-100 text-purple-700",
        icon: <Star size={12} fill="currentColor" />,
        label: "Premium",
      },
      FREE: {
        color: "bg-gray-100 text-gray-700",
        icon: <Zap size={12} fill="currentColor" />,
        label: "Free",
      },
    };
    const config = configs[user?.plan || "FREE"] || configs.FREE;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${config.color}`}
      >
        {config.icon} {config.label}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p>Vui lòng đăng nhập để xem trang này.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header Background */}
          <div className="h-24 bg-gradient-to-r from-primary to-emerald-600 relative">
            <div className="absolute inset-0 opacity-20 pattern-grid-lg"></div>
          </div>

          <div className="px-8 pb-8">
            {/* Avatar & Basic Info */}
            <div className="relative flex flex-col sm:flex-row items-center sm:items-center -mt-12 mb-8 gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden flex items-center justify-center text-gray-400">
                  <User size={40} />
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-100 text-gray-500 hover:text-primary transition-colors">
                  <Settings size={16} />
                </button>
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-3xl font-extrabold text-white drop-shadow-md">
                    {user.fullName}
                  </h1>
                  <PlanBadge />
                </div>
                <p className="text-gray-500 font-medium">{user.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>

            {/* Content Grid - Chỉ dùng 1 thẻ Grid cha ở đây */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* CỘT TRÁI (1/3): Sidebar & Stats */}
              <div className="space-y-6">
                {/* Gói dịch vụ */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-gray-500" />
                    Gói dịch vụ hiện tại
                  </h3>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-800">
                      {user?.plan || "Free"}
                    </span>
                    {user.planExpiresAt && (
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                        <Calendar size={14} />
                        Hết hạn:{" "}
                        {new Date(user.planExpiresAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => router.push("/upgrade")}
                    className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 transition-colors text-sm border border-emerald-200"
                  >
                    Nâng cấp gói
                  </button>
                </div>

                {/* Thống kê */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Leaf size={18} className="text-primary" />
                    Thống kê
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Cây đã quét</span>
                      <span className="font-bold">
                        {loadingStats ? "..." : stats.scanCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Bệnh phát hiện</span>
                      <span className="font-bold">
                        {loadingStats ? "..." : stats.diseaseCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Đoạn chat</span>
                      <span className="font-bold">
                        {loadingStats ? "..." : stats.chatCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI (2/3): Content Area */}
              <div className="md:col-span-2 space-y-6">
                {/* Thiết lập mật khẩu (Nếu chưa có) */}
                {user.isPasswordSet === false && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <Lock size={20} />
                      Thiết lập mật khẩu
                    </h3>
                    <p className="text-amber-700 mb-4 text-sm">
                      Bạn đã đăng nhập bằng Google. Hãy thiết lập mật khẩu để có
                      thể đăng nhập bằng email trong tương lai.
                    </p>
                    {passwordSuccess ? (
                      <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm font-medium">
                        Thiết lập mật khẩu thành công!
                      </div>
                    ) : (
                      <form onSubmit={handleSetPassword} className="space-y-4">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Ít nhất 8 ký tự, có chữ hoa, chữ thường và số"
                          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                        />
                        {passwordError && (
                          <p className="text-red-500 text-sm mt-1">
                            {passwordError}
                          </p>
                        )}
                        <button
                          type="submit"
                          disabled={isSettingPassword}
                          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium text-sm flex items-center gap-2 disabled:opacity-70"
                        >
                          {isSettingPassword && (
                            <Loader2 size={16} className="animate-spin" />
                          )}
                          Lưu mật khẩu
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Hoạt động gần đây */}
                <div className="bg-white border border-gray-100 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Hoạt động gần đây
                  </h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                      >
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-primary shrink-0">
                          <Leaf size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            Chẩn đoán bệnh Đốm lá
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Cây Cà chua • 2 giờ trước
                          </p>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium">
                              Nguy cơ cao
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 py-2 text-sm text-primary font-medium hover:text-primary-dark transition-colors">
                    Xem tất cả hoạt động
                  </button>
                </div>
              </div>
              {/* Kết thúc Cột Phải */}
            </div>
            {/* Kết thúc Grid cha */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
