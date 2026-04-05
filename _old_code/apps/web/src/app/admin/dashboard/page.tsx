"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import DashboardTab from "../../../components/admin/Dashboard";
import UsersTab from "../../../components/admin/Users";
import ReportsTab from "../../../components/admin/Reports";
import FeedbacksTab from "../../../components/admin/Feedbacks";
import { adminApi } from "@agri-scan/shared";

type AdminTabKey = "dashboard" | "users" | "reports" | "feedbacks";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTabKey>("dashboard");
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchPendingFeedbackCount = async () => {
      try {
        const res = await adminApi.getFeedbacks("PENDING", 1, 100);
        setPendingFeedbackCount(res.data?.length ?? 0);
      } catch (error) {
        console.error("Failed to fetch pending feedback count:", error);
        setPendingFeedbackCount(0);
      }
    };

    void fetchPendingFeedbackCount();
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const menuItems = useMemo(
    () => [
      {
        key: "dashboard" as const,
        label: "Tổng quan",
        icon: LayoutDashboard,
      },
      {
        key: "users" as const,
        label: "Người dùng",
        icon: Users,
      },
      {
        key: "reports" as const,
        label: "Báo cáo",
        icon: ShieldAlert,
      },
      {
        key: "feedbacks" as const,
        label: "Phản hồi",
        icon: MessageSquare,
        badge: pendingFeedbackCount,
      },
    ],
    [pendingFeedbackCount]
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "users":
        return <UsersTab />;
      case "reports":
        return <ReportsTab />;
      case "feedbacks":
        return <FeedbacksTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="w-[280px] bg-white border-r border-slate-200 shadow-sm hidden lg:flex lg:flex-col">
          <div className="px-6 py-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-emerald-500"
                >
                  <path
                    d="M8 4H4V8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 4H20V8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 20H4V16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 20H20V16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="leading-tight">
                <h1 className="text-[15px] font-extrabold text-emerald-600">
                  AgriScan
                </h1>
                <p className="text-[11px] tracking-[0.18em] font-bold text-slate-400 uppercase mt-1">
                  Admin Portal
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-5 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-left group ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-600"
                      }
                    />
                    <span className="font-semibold">{item.label}</span>
                  </div>

                  {typeof item.badge === "number" && item.badge > 0 && (
                    <span
                      className={`min-w-[24px] h-6 px-2 rounded-full text-xs font-bold flex items-center justify-center ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogOut size={18} />
              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="font-medium">{item.label}</span>
                    {typeof item.badge === "number" && item.badge > 0 && (
                      <span
                        className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}