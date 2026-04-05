"use client";

import React from "react";
import { motion } from "framer-motion";

interface HeroStatsProps {
  stats: Array<{
    value: string;
    label: string;
  }>;
}

export function HeroStats({ stats }: HeroStatsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 border-t border-gray-200/50">
      {stats.map((stat, index) => (
        <div key={index} className="text-center sm:text-left">
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {stat.value}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
