"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Sparkles,
  Camera,
  Upload,
  Apple,
  Flower2,
  Leaf,
} from "lucide-react";

interface UploadViewProps {
  onBack: () => void;
  handleRealUpload: (file: File) => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function UploadView({
  onBack,
  handleRealUpload,
  fileInputRef,
}: UploadViewProps) {
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await handleRealUpload(file);
    event.target.value = "";
  };

  return (
    <motion.div
      key="upload"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto mt-12 px-4"
    >
      <div className="text-center mb-12 relative">
        <button
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={28} />
        </button>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm mb-6 shadow-sm"
        >
          <Sparkles size={16} className="animate-pulse" />
          <span>AI Plant Doctor 2.0</span>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Bác sĩ cây trồng{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
            thông minh
          </span>
        </h1>

        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Chụp ảnh cây của bạn. AI sẽ nhận diện loại cây, chẩn đoán sức khỏe và
          đưa ra phác đồ chăm sóc cá nhân hóa chỉ trong vài giây.
        </p>
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white p-2 rounded-[2.5rem] shadow-xl shadow-emerald-500/10 border border-emerald-100/50 max-w-2xl mx-auto"
      >
        <div
          className="relative overflow-hidden border-2 border-dashed border-emerald-200 rounded-[2rem] p-12 md:p-16 text-center bg-gradient-to-b from-emerald-50/50 to-teal-50/50 cursor-pointer group transition-all hover:border-emerald-400 hover:bg-emerald-50/80"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-1/2 translate-y-1/2"></div>

          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
          />

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-white shadow-lg shadow-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300"
          >
            <Camera size={40} className="text-emerald-500" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <Sparkles size={14} className="text-white" />
            </div>
          </motion.div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 relative z-10">
            Chụp hoặc Tải ảnh lên
          </h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto relative z-10">
            Hỗ trợ định dạng JPG, PNG. Kích thước tối đa 10MB. Đảm bảo ảnh rõ
            nét, đủ sáng.
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="relative z-10 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center gap-3 mx-auto shadow-lg shadow-gray-900/20 group-hover:shadow-gray-900/40 group-hover:-translate-y-1"
          >
            <Upload
              size={20}
              className="group-hover:-translate-y-1 transition-transform"
            />
            Chọn ảnh từ thiết bị
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
