'use client';
import React from 'react';
import { Users, Hammer, ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export function Community() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />

        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
          >
            <Users className="w-12 h-12 text-primary" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Cộng đồng <span className="text-primary">Agri-Scan</span>
          </h1>
          
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Nơi giao lưu, chia sẻ kinh nghiệm chăm sóc cây trồng và kết nối những người yêu thiên nhiên. Tính năng này đang được chúng tôi nỗ lực hoàn thiện!
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-3 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200/50 py-3 px-6 rounded-2xl mb-10 w-fit mx-auto shadow-sm"
          >
            <Hammer className="w-5 h-5 animate-bounce" />
            <span>Đang trong quá trình phát triển...</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </motion.div>

          <button
            onClick={() => router.push('/')}
            className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto py-3.5 px-8 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Quay lại trang chủ
          </button>
        </div>
      </motion.div>

      {/* Feature preview cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="max-w-4xl w-full mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-xl">
            💬
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Hỏi đáp chuyên gia</h3>
          <p className="text-sm text-gray-500">Đặt câu hỏi và nhận tư vấn trực tiếp từ các chuyên gia nông nghiệp.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-green-600 font-bold text-xl">
            📸
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Chia sẻ khoảnh khắc</h3>
          <p className="text-sm text-gray-500">Khoe thành quả khu vườn của bạn và truyền cảm hứng cho người khác.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-purple-600 font-bold text-xl">
            🏆
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Thử thách trồng cây</h3>
          <p className="text-sm text-gray-500">Tham gia các sự kiện, thử thách để nhận huy hiệu và phần thưởng.</p>
        </div>
      </motion.div>
    </div>
  );
}
