"use client";

import React from "react";
import {
  Leaf,
  Target,
  Users,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sprout,
  Microscope,
  Globe2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function AboutPage() {
  const router = useRouter();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 pt-16">
      {/* Hero Section - Split Layout */}
      <section className="relative overflow-hidden bg-emerald-900 text-white">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
          style={{
            backgroundImage: "url('https://picsum.photos/seed/farm/1920/1080')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-emerald-900/50 to-emerald-900" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeIn}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-800/80 border border-emerald-700 mb-6 text-emerald-200 text-sm font-medium backdrop-blur-sm">
                <Sprout size={16} />
                <span>Nông nghiệp thông minh 4.0</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Mang chuyên gia <br />
                <span className="text-emerald-400">đến từng mảnh vườn</span>
              </h1>
              <p className="text-emerald-100 text-lg mb-8 leading-relaxed max-w-xl">
                Agri-Scan AI kết hợp trí tuệ nhân tạo và kiến thức nông nghiệp
                chuyên sâu, giúp bà con nông dân chẩn đoán bệnh cây trồng chỉ
                trong vài giây qua camera điện thoại.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push("/scan")}
                  className="bg-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-400 transition-colors inline-flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                  Trải nghiệm AI ngay <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-700/50 aspect-4/3">
                <img
                  src="https://picsum.photos/seed/agriculture-tech/800/600"
                  alt="Nông dân sử dụng app"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-emerald-900/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-white font-bold">
                        Đã phân tích 100,000+ mẫu bệnh
                      </p>
                      <p className="text-emerald-200 text-sm">
                        Độ chính xác lên đến 98%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-emerald-800 border-b border-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "98%", label: "Độ chính xác" },
              { number: "50+", label: "Loại cây trồng" },
              { number: "2s", label: "Thời gian chẩn đoán" },
              { number: "24/7", label: "Hỗ trợ liên tục" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <h4 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </h4>
                <p className="text-emerald-200 font-medium uppercase tracking-wider text-sm">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Câu chuyện & Sứ mệnh */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeIn} className="order-2 lg:order-1 relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://picsum.photos/seed/farmer1/400/500"
                  alt="Nông dân"
                  className="rounded-3xl object-cover w-full h-64 md:h-80 shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <img
                  src="https://picsum.photos/seed/farmer2/400/500"
                  alt="Cánh đồng"
                  className="rounded-3xl object-cover w-full h-64 md:h-80 shadow-lg mt-8"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-gray-50">
                <Leaf size={40} className="text-emerald-600" />
              </div>
            </motion.div>

            <motion.div {...fadeIn} className="order-1 lg:order-2">
              <h2 className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-2">
                Câu chuyện của chúng tôi
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Từ nỗi trăn trở trên cánh đồng đến giải pháp công nghệ
              </h3>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  Việt Nam là một quốc gia nông nghiệp, nhưng hàng năm bà con
                  nông dân vẫn phải đối mặt với thiệt hại lớn do sâu bệnh gây
                  ra. Việc chẩn đoán sai, lạm dụng thuốc trừ sâu hoặc phát hiện
                  muộn thường dẫn đến hậu quả nghiêm trọng cho mùa màng và môi
                  trường.
                </p>
                <p>
                  Nhận thấy vấn đề đó, đội ngũ Agri-Scan AI đã phát triển một
                  giải pháp đột phá:{" "}
                  <strong>Ứng dụng AI nhận diện hình ảnh</strong> để chẩn đoán
                  bệnh cây trồng ngay lập tức chỉ qua một bức ảnh chụp từ điện
                  thoại.
                </p>
                <p>
                  Chúng tôi không chỉ cung cấp công cụ, chúng tôi mang đến một
                  &quot;chuyên gia nông nghiệp&quot; luôn túc trực 24/7 trong
                  túi áo của mỗi người nông dân.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Công nghệ cốt lõi */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-2">
              Công nghệ
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sức mạnh đằng sau Agri-Scan
            </h3>
            <p className="text-gray-600 text-lg">
              Hệ thống của chúng tôi được xây dựng trên nền tảng công nghệ tiên
              tiến nhất, đảm bảo độ chính xác và tốc độ vượt trội.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Microscope size={32} />,
                title: "Computer Vision",
                desc: "Mô hình học sâu (Deep Learning) được huấn luyện trên hàng triệu hình ảnh lá cây bị bệnh, có khả năng nhận diện các dấu hiệu nhỏ nhất.",
              },
              {
                icon: <Globe2 size={32} />,
                title: "Xử lý ngôn ngữ tự nhiên",
                desc: "Tích hợp LLM giúp AI giao tiếp tự nhiên, giải thích nguyên nhân và hướng dẫn cách điều trị một cách dễ hiểu cho bà con.",
              },
              {
                icon: <Zap size={32} />,
                title: "Xử lý thời gian thực",
                desc: "Kiến trúc Cloud Native cho phép xử lý ảnh và trả về kết quả chẩn đoán chỉ trong vòng chưa tới 2 giây.",
              },
            ].map((tech, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {tech.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  {tech.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Giá trị cốt lõi */}
      <section className="py-24 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <h2 className="text-emerald-400 font-bold tracking-wider uppercase text-sm mb-2">
                Giá trị cốt lõi
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Kim chỉ nam cho mọi hành động
              </h3>
              <p className="text-emerald-100 text-lg mb-8">
                Chúng tôi cam kết mang lại những giá trị thiết thực nhất cho nền
                nông nghiệp Việt Nam.
              </p>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
              {[
                {
                  icon: <Target size={28} />,
                  title: "Chính xác & Minh bạch",
                  desc: "Kết quả chẩn đoán dựa trên dữ liệu khoa học, luôn đưa ra cảnh báo nếu độ tin cậy thấp.",
                },
                {
                  icon: <Users size={28} />,
                  title: "Lấy nông dân làm trung tâm",
                  desc: "Giao diện đơn giản, dễ sử dụng, phù hợp với mọi lứa tuổi và trình độ công nghệ.",
                },
                {
                  icon: <Shield size={28} />,
                  title: "Phát triển bền vững",
                  desc: "Khuyến khích các phương pháp điều trị sinh học, hạn chế hóa chất độc hại.",
                },
                {
                  icon: <Leaf size={28} />,
                  title: "Đồng hành dài lâu",
                  desc: "Không chỉ chẩn đoán, chúng tôi theo dõi và tư vấn suốt chu kỳ phát triển của cây.",
                },
              ].map((val, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-emerald-800/50 p-6 rounded-2xl border border-emerald-700/50 backdrop-blur-sm"
                >
                  <div className="text-emerald-400 mb-4">{val.icon}</div>
                  <h4 className="text-xl font-bold mb-2">{val.title}</h4>
                  <p className="text-emerald-100/80 leading-relaxed">
                    {val.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-emerald-50 rounded-[3rem] p-8 md:p-12 border border-emerald-100"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Sẵn sàng bảo vệ mùa màng của bạn?
            </h2>
            <p className="text-gray-600 mb-10 text-lg max-w-xl mx-auto">
              Trải nghiệm sức mạnh của AI trong việc chẩn đoán và điều trị bệnh
              cây trồng ngay hôm nay. Hoàn toàn miễn phí cho các tính năng cơ
              bản.
            </p>
            <button
              onClick={() => router.push("/scan")}
              className="bg-emerald-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition-colors inline-flex items-center gap-2 shadow-xl shadow-emerald-600/20 hover:scale-105 transform duration-200"
            >
              Bắt đầu quét ảnh ngay <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
