"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Activity } from "lucide-react";

export function FloatingCards() {
  return (
    <>
      {/* Floating Card 1 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute top-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg max-w-[200px]"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 rounded-lg text-green-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Trạng thái</p>
            <p className="font-bold text-gray-900">Đã bảo vệ</p>
          </div>
        </div>
      </motion.div>

      {/* Floating Card 2 */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Phân tích AI</p>
            <p className="text-xs text-gray-500">Đang xử lý dữ liệu...</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
