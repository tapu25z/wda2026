"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle,
  Edit2,
  MessageSquare,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { formatDate, pageVariants } from "./utils";
import { adminApi } from "@agri-scan/shared";
import type { IFeedback } from "@agri-scan/shared";

type FeedbackStatusFilter = "ALL" | "PENDING" | "REPLIED";

export default function FeedbacksTab() {
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [feedbackStatus, setFeedbackStatus] =
    useState<FeedbackStatusFilter>("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<IFeedback | null>(
    null
  );
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError("");

      const status =
        feedbackStatus === "ALL" ? undefined : feedbackStatus;

      const res = await adminApi.getFeedbacks(status, 1, 50);
      setFeedbacks(res.data ?? []);
    } catch (err: any) {
      console.error("Failed to fetch admin feedbacks:", err);
      setError(
        err?.response?.data?.message || "Không thể tải danh sách phản hồi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFeedbacks();
  }, [feedbackStatus]);

  const handleOpenReplyModal = (fb: IFeedback) => {
    setSelectedFeedback(fb);
    setReplyContent(fb.adminReply || "");
    setReplyModalOpen(true);
  };

  const handleCloseReplyModal = () => {
    if (submittingReply) return;
    setReplyModalOpen(false);
    setReplyContent("");
    setSelectedFeedback(null);
  };

  const handleReplyFeedback = async () => {
    if (!selectedFeedback || !replyContent.trim()) return;

    try {
      setSubmittingReply(true);

      await adminApi.replyFeedback(selectedFeedback._id, replyContent.trim());

      setFeedbacks((prev) =>
        prev.map((fb) =>
          fb._id === selectedFeedback._id
            ? {
                ...fb,
                status: "REPLIED",
                adminReply: replyContent.trim(),
              }
            : fb
        )
      );

      handleCloseReplyModal();
    } catch (err: any) {
      console.error("Failed to reply feedback:", err);
      alert(
        err?.response?.data?.message || "Không thể gửi phản hồi cho người dùng."
      );
    } finally {
      setSubmittingReply(false);
    }
  };

  const pendingCount = useMemo(
    () => feedbacks.filter((fb) => fb.status === "PENDING").length,
    [feedbacks]
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Quản lý Phản hồi
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {pendingCount > 0
              ? `Hiện có ${pendingCount} phản hồi đang chờ xử lý`
              : "Không có phản hồi chờ xử lý"}
          </p>
        </div>

        <select
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm font-medium text-slate-700"
          value={feedbackStatus}
          onChange={(e) =>
            setFeedbackStatus(e.target.value as FeedbackStatusFilter)
          }
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="REPLIED">Đã trả lời</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl px-4 py-3 flex items-start gap-2">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
            <Loader2 size={28} className="mx-auto text-emerald-600 animate-spin mb-3" />
            <p className="text-slate-600 font-medium">
              Đang tải danh sách phản hồi...
            </p>
          </div>
        ) : feedbacks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">
              Không có phản hồi nào
            </h3>
            <p className="text-slate-500">
              Không có dữ liệu phù hợp với bộ lọc hiện tại.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {feedbacks.map((fb) => (
              <motion.div
                key={fb._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-start hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-bold tracking-wider uppercase ${
                        fb.category === "BUG"
                          ? "bg-red-100 text-red-700"
                          : fb.category === "FEATURE"
                          ? "bg-blue-100 text-blue-700"
                          : fb.category === "COMPLAINT"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {fb.category}
                    </span>

                    <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                      <Clock size={14} /> {formatDate(fb.createdAt)}
                    </span>

                    {fb.status === "PENDING" ? (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/50">
                        Chờ xử lý
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/50 flex items-center gap-1">
                        <CheckCircle size={14} /> Đã trả lời
                      </span>
                    )}
                  </div>

                  <h4 className="text-slate-900 font-semibold text-lg mb-2">
                    {fb.content}
                  </h4>

                  <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 inline-flex px-3 py-1.5 rounded-lg flex-wrap">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {fb.userId?.fullName?.charAt(0) || "U"}
                    </div>
                    <span className="font-medium text-slate-700">
                      {fb.userId?.fullName || "Người dùng"}
                    </span>
                    {fb.userId?.email && <span>({fb.userId.email})</span>}
                  </div>

                  {fb.status === "REPLIED" && fb.adminReply && (
                    <div className="mt-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                      <p className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle size={14} /> Phản hồi từ Admin:
                      </p>
                      <p className="text-sm text-slate-800 font-medium leading-relaxed">
                        {fb.adminReply}
                      </p>
                    </div>
                  )}
                </div>

                {fb.status === "PENDING" && (
                  <button
                    onClick={() => handleOpenReplyModal(fb)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-all duration-300 text-sm font-bold whitespace-nowrap shadow-sm"
                  >
                    <Edit2 size={16} />
                    Trả lời ngay
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {replyModalOpen && selectedFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={handleCloseReplyModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 border border-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Edit2 size={20} className="text-emerald-600" />
                  Trả lời phản hồi
                </h3>
                <button
                  onClick={handleCloseReplyModal}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {selectedFeedback.userId?.fullName?.charAt(0) || "U"}
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {selectedFeedback.userId?.fullName || "Người dùng"}
                    </p>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {selectedFeedback.content}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nội dung trả lời của bạn
                  </label>
                  <textarea
                    className="w-full border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none shadow-sm"
                    rows={4}
                    placeholder="Nhập câu trả lời chi tiết..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleCloseReplyModal}
                    className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleReplyFeedback}
                    disabled={!replyContent.trim() || submittingReply}
                    className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-500/20 inline-flex items-center gap-2"
                  >
                    {submittingReply && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    Gửi phản hồi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}