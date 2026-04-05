"use client";

import React from "react";
import { ShieldCheck, Sprout, Users } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

export function FeaturesSection() {
  const features = [
    {
      icon: <ShieldCheck size={32} />,
      title: "AI Diagnosis",
      description:
        "Nhận diện bệnh cây qua ảnh chụp tức thời với độ chính xác cao nhờ mô hình Computer Vision tiên tiến.",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: <Sprout size={32} />,
      title: "Smart Treatment",
      description:
        "Đưa ra phác đồ điều trị chi tiết, ưu tiên các giải pháp sinh học và thân thiện với môi trường.",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: <Users size={32} />,
      title: "Community Knowledge",
      description:
        "Thư viện mở về kỹ thuật canh tác và cộng đồng chuyên gia hỗ trợ giải đáp thắc mắc.",
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-primary font-semibold tracking-wide uppercase mb-2 text-sm sm:text-base">
            Giải Pháp Toàn Diện
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Công nghệ tiên phong cho nông nghiệp bền vững
          </h3>
          <p className="text-gray-600 text-base sm:text-lg">
            Hệ thống tích hợp đa tính năng giúp bạn quản lý vườn cây một cách
            khoa học và hiệu quả nhất.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
