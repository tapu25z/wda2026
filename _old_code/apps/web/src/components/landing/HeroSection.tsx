"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { HeroStats } from "./HeroStats";
import { FloatingCards } from "./FloatingCards";

export function HeroSection() {
  const heroStats = [
    { value: "98%", label: "Độ chính xác" },
    { value: "2s", label: "Thời gian xử lý" },
    { value: "500+", label: "Loại bệnh" },
  ];

  return (
    <section className="relative overflow-hidden bg-bg-soft min-h-[100vh] sm:min-h-[90vh] flex items-center py-8 sm:py-0">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-green-100/50 to-transparent transform skew-x-12 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-yellow-100/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-green-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-600">
                AI Innovation Contest 2026
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              Bác Sĩ <br />
              <span className="text-primary">Cây Trồng</span> <br />
              Thông Minh
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-lg leading-relaxed">
              Chẩn đoán bệnh cây trồng tức thì bằng AI. Nhận phác đồ điều trị
              khoa học và lộ trình chăm sóc bền vững chỉ với một lần quét.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/scan"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-full font-semibold text-base sm:text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group w-full sm:w-auto"
              >
                Chẩn đoán ngay
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-semibold text-base sm:text-lg hover:bg-gray-50 transition-all w-full sm:w-auto text-center"
              >
                Tìm hiểu thêm
              </Link>
            </div>

            <HeroStats stats={heroStats} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mt-8 lg:mt-0 order-first lg:order-last"
          >
            <div className="relative z-10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 sm:border-8 border-white">
              <img
                src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Farmer using technology"
                className="w-full h-64 sm:h-80 lg:h-auto object-cover"
              />

              <FloatingCards />
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
