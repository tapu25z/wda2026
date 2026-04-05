"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@agri-scan/shared";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  color,
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all"
    >
      <div
        className={cn(
          "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6",
          color,
        )}
      >
        {icon}
      </div>
      <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
        {title}
      </h4>
      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
        {description}
      </p>
    </motion.div>
  );
}
