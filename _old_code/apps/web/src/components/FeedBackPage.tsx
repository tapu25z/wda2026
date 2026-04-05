"use client";

import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  User,
  Inbox,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";

// Đổi import này theo alias/package thật của project bạn nếu cần
import { adminApi } from "@agri-scan/shared";
import type { IFeedback, FeedbackCategory } from "@agri-scan/shared";

const CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] = [
  { value: "BUG", label: "Báo lỗi" },
  { value: "FEATURE", label: "Đề xuất tính năng" },
  { value: "COMPLAINT", label: "Khiếu nại" },
  { value: "GENERAL", label: "Góp ý chung" },
];

const CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  BUG: "Báo lỗi",
  FEATURE: "Đề xuất tính năng",
  COMPLAINT: "Khiếu nại",
  GENERAL: "Góp ý chung",
};

export function FeedbackPage() {
  const { user } = useAuth();

  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [category, setCategory] = useState<FeedbackCategory>("GENERAL");
  const [content, setContent] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      void fetchFeedbacks();
    } else {
      setFeedbacks([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      setError("");

      const res = await adminApi.getMyFeedbacks(1, 20);
      setFeedbacks(res.data ?? []);
    } catch (err: any) {
      console.error("Failed to fetch feedbacks", err);
      setError(
        err?.response?.data?.message || "Không thể tải lịch sử phản hồi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Vui lòng nhập nội dung phản hồi.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");

      await adminApi.submitFeedback({
        category,
        content: content.trim(),
      });

      setContent("");
      setCategory("GENERAL");
      setSuccessMessage("Phản hồi đã được gửi thành công!");

      await fetchFeedbacks();

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err: any) {
      console.error("Submit feedback failed", err);
      setError(
        err?.response?.data?.message || "Có lỗi xảy ra khi gửi phản hồi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
            Vui lòng đăng nhập
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Bạn cần đăng nhập vào tài khoản để có thể gửi góp ý và theo dõi quá
            trình xử lý phản hồi từ chúng tôi.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center w-full py-3.5 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
          >
            Đăng nhập ngay
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mt-16 h-[calc(100vh-4rem)] bg-gray-50/50 p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 overflow-hidden">
      {/* LEFT PANEL: FORM */}
      <div className="w-full lg:w-[400px] xl:w-[450px] bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col h-full shrink-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gửi phản hồi</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Chúng tôi luôn lắng nghe ý kiến của bạn
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{successMessage}</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form
            id="feedback-form"
            onSubmit={handleSubmit}
            className="flex flex-col h-full space-y-5"
          >
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Loại phản hồi
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as FeedbackCategory)
                }
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-gray-900 text-sm"
              >
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex flex-col min-h-[220px]">
              <div className="flex justify-between items-end mb-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  Nội dung chi tiết
                </label>
                <span className="text-xs font-medium text-gray-400">
                  {content.length}/1000
                </span>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Mô tả chi tiết vấn đề hoặc đề xuất của bạn..."
                maxLength={1000}
                disabled={isSubmitting}
                className="w-full flex-1 p-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none outline-none font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal text-sm"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button
            form="feedback-form"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gửi phản hồi
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: HISTORY */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Lịch sử phản hồi</h2>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
            {feedbacks.length} yêu cầu
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 no-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Chưa có phản hồi nào
              </h3>
              <p className="text-sm text-gray-500">
                Lịch sử trống. Hãy sử dụng biểu mẫu bên trái để gửi góp ý hoặc
                báo cáo sự cố cho chúng tôi nhé.
              </p>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              <AnimatePresence>
                {feedbacks.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-gray-900 text-base leading-tight">
                                {CATEGORY_LABEL[item.category]}
                              </h3>
                              <span className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                {item.category}
                              </span>
                            </div>

                            <div className="text-xs font-medium text-gray-400 mt-0.5">
                              {new Date(item.createdAt).toLocaleString("vi-VN")}
                            </div>
                          </div>
                        </div>

                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 shrink-0",
                            item.status === "REPLIED"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100",
                          )}
                        >
                          {item.status === "REPLIED" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {item.status === "REPLIED"
                            ? "Đã trả lời"
                            : "Đang xử lý"}
                        </span>
                      </div>

                      <p className="text-gray-700 text-sm leading-relaxed pl-11">
                        {item.content}
                      </p>
                    </div>

                    {item.adminReply && (
                      <div className="bg-primary/5 p-5 sm:p-6 border-t border-primary/10 pl-11 sm:pl-17">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0 shadow-sm">
                            <ShieldCheck className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-primary text-sm mb-1">
                              Admin Agri-Scan
                            </div>
                            <p className="text-gray-800 text-sm leading-relaxed">
                              {item.adminReply}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
