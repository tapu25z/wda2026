import React from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Trash2,
  Apple,
  Flower2,
  Leaf,
  ScanLine,
  Sun,
  Droplets,
  Thermometer,
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Calendar,
  Scissors,
  Sparkles,
  Plus,
} from "lucide-react";
import type { IMyGardenPlant } from "@agri-scan/shared";
import { containerVariants, itemVariants } from "../../../utils/animation";

interface ResultViewProps {
  selectedPlant: IMyGardenPlant | null;
  isViewingTracked: boolean;
  handleReset: () => void;
  handleRemovePlant: (id: string) => void;
  handleAddToGarden: () => void;
}

export function ResultView({
  selectedPlant,
  isViewingTracked,
  handleReset,
  handleRemovePlant,
  handleAddToGarden,
}: ResultViewProps) {
  if (!selectedPlant) return null;

  const displayName =
    selectedPlant.customName?.trim() ||
    selectedPlant.plantInfo?.commonName?.trim() ||
    selectedPlant.aiLabel?.trim() ||
    "Cây trồng";

  const subTitle =
    selectedPlant.plantInfo?.commonName?.trim() ||
    selectedPlant.aiLabel?.trim() ||
    "Chưa có thông tin chi tiết";

  const imageSrc =
    selectedPlant.imageUrl ||
    selectedPlant.plantInfo?.images?.[0] ||
    "/placeholder-plant.png";

  const conditionText =
    selectedPlant.currentCondition?.trim() || "Chưa có chẩn đoán";

  const isHealthy = [
    "khỏe mạnh",
    "khoe manh",
    "healthy",
    "normal",
  ].includes(conditionText.toLowerCase());

  const health: "GOOD" | "NEEDS_ATTENTION" = isHealthy
    ? "GOOD"
    : "NEEDS_ATTENTION";

  const getHealthColors = (value: "GOOD" | "NEEDS_ATTENTION" | "BAD") => {
    if (value === "GOOD") {
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-800",
        icon: "text-emerald-500",
        glow: "shadow-emerald-500/20",
      };
    }

    if (value === "NEEDS_ATTENTION") {
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-800",
        icon: "text-amber-500",
        glow: "shadow-amber-500/20",
      };
    }

    return {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-500",
      glow: "shadow-red-500/20",
    };
  };

  const healthStyle = getHealthColors(health);

  const renderFruitSpecific = () => (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-orange-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-100/50 to-transparent rounded-bl-full -z-10 transition-transform duration-700 group-hover:scale-110"></div>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
            <Calendar size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dự kiến ngày ra trái
          </h2>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm font-bold text-gray-400 mb-4 px-2">
            <span>Gieo hạt</span>
            <span className="text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              Ra hoa (Hiện tại)
            </span>
            <span>Thu hoạch</span>
          </div>
          <div className="h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner p-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "60%" }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full relative shadow-sm"
            >
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/40 animate-pulse rounded-r-full"></div>
            </motion.div>
          </div>
          <p className="text-center mt-6 text-gray-600 text-lg">
            Dự kiến thu hoạch trong{" "}
            <span className="font-extrabold text-orange-600 text-2xl mx-1">
              25-30
            </span>{" "}
            ngày nữa
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Apple size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Bí quyết ép cây ra trái
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              step: 1,
              title: "Siết nước",
              desc: "Ngừng tưới nước từ 5-7 ngày để cây chuyển sang trạng thái sinh sản, kích thích ra hoa đậu quả.",
            },
            {
              step: 2,
              title: "Bón phân Kali cao",
              desc: "Sử dụng phân bón NPK tỷ lệ Kali cao (vd: 15-5-20) để tăng tỷ lệ đậu trái và giúp trái ngọt hơn.",
            },
            {
              step: 3,
              title: "Thụ phấn nhân tạo",
              desc: "Dùng cọ mềm quét phấn từ hoa đực sang hoa cái vào buổi sáng sớm (7h-9h) để tăng tỷ lệ đậu.",
            },
            {
              step: 4,
              title: "Tỉa cành vượt",
              desc: "Cắt bỏ các cành tăm, cành vượt không có khả năng ra trái để tập trung dinh dưỡng nuôi quả.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-6 border border-gray-100 rounded-3xl hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all bg-white group"
            >
              <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-sm group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  {item.step}
                </span>
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFlowerSpecific = () => (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-pink-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-100/50 to-transparent rounded-bl-full -z-10 transition-transform duration-700 group-hover:scale-110"></div>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 shadow-inner">
            <Calendar size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dự kiến ngày ra hoa
          </h2>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm font-bold text-gray-400 mb-4 px-2">
            <span>Nảy mầm</span>
            <span className="text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
              Đóng nụ (Hiện tại)
            </span>
            <span>Nở rộ</span>
          </div>
          <div className="h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner p-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "80%" }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full relative shadow-sm"
            >
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/40 animate-pulse rounded-r-full"></div>
            </motion.div>
          </div>
          <p className="text-center mt-6 text-gray-600 text-lg">
            Dự kiến hoa sẽ nở rộ trong{" "}
            <span className="font-extrabold text-pink-600 text-2xl mx-1">
              5-7
            </span>{" "}
            ngày nữa
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
            <Flower2 size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Chăm sóc để hoa nở to & bền
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              icon: Sun,
              color: "text-amber-500",
              bg: "bg-amber-50",
              title: "Tăng cường ánh sáng",
              desc: "Đảm bảo cây nhận đủ 6-8 tiếng nắng trực tiếp mỗi ngày. Thiếu nắng nụ sẽ nhỏ và dễ rụng.",
            },
            {
              icon: Droplets,
              color: "text-blue-500",
              bg: "bg-blue-50",
              title: "Tưới nước đúng cách",
              desc: "Chỉ tưới vào gốc, tuyệt đối không tưới lên nụ và hoa để tránh làm úng nụ và thối hoa.",
            },
            {
              icon: Sparkles,
              color: "text-purple-500",
              bg: "bg-purple-50",
              title: "Bón phân Lân (P) cao",
              desc: "Bổ sung phân bón giàu Lân (như siêu lân) để kích thích mầm hoa phát triển mạnh, màu sắc rực rỡ.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex gap-6 p-6 bg-gray-50/50 border border-gray-100 rounded-3xl hover:bg-white hover:shadow-md hover:border-pink-100 transition-all group"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform`}
              >
                <item.icon size={28} className={item.color} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrnamentalSpecific = () => (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-full -z-10 transition-transform duration-700 group-hover:scale-110"></div>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
            <Scissors size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Hướng dẫn cắt tỉa tạo dáng
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="relative rounded-3xl overflow-hidden mb-6 shadow-md group-hover:shadow-xl transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1599598425947-330026296904?auto=format&fit=crop&q=80&w=600"
                alt="Pruning guide"
                className="w-full h-56 object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <span className="text-white font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Vị trí
                  cắt chuẩn
                </span>
              </div>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Góc cắt lý tưởng
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Cắt cách mắt lá khoảng 1-2cm, cắt xéo 45 độ để nước không đọng lại
              trên vết cắt gây nấm mốc.
            </p>
          </div>
          <div className="space-y-4 flex flex-col justify-center">
            {[
              {
                title: "Tỉa thưa (Thinning)",
                desc: "Cắt bỏ các cành mọc chen chúc bên trong tán để tạo độ thông thoáng.",
              },
              {
                title: "Bấm ngọn (Pinching)",
                desc: "Ngắt bỏ phần ngọn non để kích thích cây đâm chồi nách, giúp tán lá sum suê.",
              },
              {
                title: "Vệ sinh lá",
                desc: "Thường xuyên lau bụi trên mặt lá bằng khăn ẩm để cây quang hợp tốt nhất.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 border border-gray-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
              >
                <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Leaf size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Chăm sóc lá xanh bóng
          </h2>
        </div>

        <div className="grid gap-4">
          {[
            {
              icon: Droplets,
              color: "text-teal-600",
              bg: "bg-teal-100",
              title: "Độ ẩm không khí",
              desc: "Cây kiểng lá thường ưa ẩm (60-80%). Hãy phun sương lên lá 1-2 lần/ngày hoặc đặt cạnh máy phun sương.",
            },
            {
              icon: Sun,
              color: "text-amber-500",
              bg: "bg-amber-100",
              title: "Ánh sáng tán xạ",
              desc: "Tránh ánh nắng gắt trực tiếp làm cháy lá. Đặt cây ở nơi có ánh sáng hắt qua cửa sổ hoặc dùng lưới che.",
            },
            {
              icon: Sparkles,
              color: "text-emerald-500",
              bg: "bg-emerald-100",
              title: "Phân bón giàu Đạm (N)",
              desc: "Sử dụng phân bón lá hoặc phân NPK tỷ lệ Đạm cao để giúp lá to, dày và xanh mướt.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex gap-5 items-start p-5 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 shadow-sm`}
              >
                <item.icon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      key="result"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-8">
        <motion.button
          variants={itemVariants}
          onClick={handleReset}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors group bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 w-fit"
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {isViewingTracked ? "Quay lại khu vườn" : "Quét cây khác"}
        </motion.button>

        {isViewingTracked && (
          <motion.button
            variants={itemVariants}
            onClick={() => handleRemovePlant(selectedPlant._id)}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 font-bold transition-colors px-4 py-2 rounded-full"
          >
            <Trash2 size={18} /> Xóa khỏi vườn
          </motion.button>
        )}
      </div>

      <motion.div
        variants={itemVariants}
        className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-10 relative"
      >
        <div
          className="absolute top-0 right-0 w-1/2 h-full opacity-10 blur-3xl pointer-events-none"
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: "cover",
          }}
        ></div>

        <div className="flex flex-col md:flex-row relative z-10">
          <div className="md:w-2/5 h-80 md:h-auto relative p-4">
            <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-inner relative group">
              <img
                src={imageSrc}
                alt={displayName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80"></div>
              <div className="absolute bottom-6 left-6 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-sm font-bold text-gray-900 shadow-xl flex items-center gap-2">
                {selectedPlant.userGoal === "GET_FRUIT" && (
                  <>
                    <Apple size={16} className="text-orange-500" /> Nhóm Ăn Quả
                  </>
                )}
                {selectedPlant.userGoal === "GET_FLOWER" && (
                  <>
                    <Flower2 size={16} className="text-pink-500" /> Nhóm Cây Hoa
                  </>
                )}
                {(selectedPlant.userGoal === "MAINTAIN" ||
                  selectedPlant.userGoal === "HEAL_DISEASE") && (
                  <>
                    <Leaf size={16} className="text-emerald-500" /> Nhóm Cây
                    Kiểng
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 md:w-3/5 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <ScanLine size={16} className="text-emerald-600" />
              </div>
              <span className="text-emerald-600 font-bold text-sm tracking-widest uppercase">
                Đã nhận diện thành công
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3"
            >
              {displayName}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-500 text-xl italic mb-10 font-serif"
            >
              {subTitle}
            </motion.p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                {
                  icon: Sun,
                  color: "text-amber-500",
                  bg: "bg-amber-50",
                  label: "Ánh sáng",
                  value: "Cao",
                },
                {
                  icon: Droplets,
                  color: "text-blue-500",
                  bg: "bg-blue-50",
                  label: "Tưới nước",
                  value: "2 ngày/lần",
                },
                {
                  icon: Thermometer,
                  color: "text-red-400",
                  bg: "bg-red-50",
                  label: "Nhiệt độ",
                  value: "22-28°C",
                },
                {
                  icon: Activity,
                  color: "text-emerald-500",
                  bg: "bg-emerald-50",
                  label: "Độ khó",
                  value: "Trung bình",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <item.icon size={24} className={item.color} />
                  </div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="font-extrabold text-gray-900 text-lg">
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-lg shadow-gray-900/20">
                <Activity size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Chẩn đoán</h2>
            </div>

            <div
              className={`p-6 rounded-3xl mb-8 border shadow-lg ${healthStyle.bg} ${healthStyle.border} ${healthStyle.glow}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm ${healthStyle.icon}`}
                >
                  {health === "GOOD" ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <AlertCircle size={24} />
                  )}
                </div>
                <div>
                  <p
                    className={`text-xl font-extrabold mb-2 ${healthStyle.text}`}
                  >
                    {health === "GOOD" ? "Cây khỏe mạnh" : "Cần chú ý"}
                  </p>
                  <p
                    className={`text-sm leading-relaxed ${healthStyle.text} opacity-90 font-medium`}
                  >
                    {conditionText}
                  </p>
                </div>
              </div>
            </div>

            {health !== "GOOD" && (
              <div className="space-y-5">
                <h3 className="font-bold text-gray-900 text-lg">
                  Phác đồ điều trị:
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-4 items-start group">
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center font-bold text-gray-900 shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Cách ly cây khỏi các cây khác để tránh lây nhiễm chéo.
                    </p>
                  </li>
                  <li className="flex gap-4 items-start group">
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center font-bold text-gray-900 shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Cắt bỏ các lá/cành bị bệnh nặng bằng kéo đã sát trùng.
                    </p>
                  </li>
                  <li className="flex gap-4 items-start group">
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center font-bold text-gray-900 shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Sử dụng thuốc đặc trị sinh học phun đều lên 2 mặt lá vào
                      buổi chiều mát.
                    </p>
                  </li>
                </ul>

                <button className="w-full mt-6 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-gray-900/20 flex items-center justify-center gap-2 group">
                  Mua thuốc đặc trị
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            )}

            {!isViewingTracked && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <button
                  onClick={handleAddToGarden}
                  className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                >
                  <Plus size={20} /> Thêm vào khu vườn của tôi
                </button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  Lưu lại để theo dõi lịch tưới nước và chăm sóc
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          {selectedPlant.userGoal === "GET_FRUIT" && renderFruitSpecific()}
          {selectedPlant.userGoal === "GET_FLOWER" && renderFlowerSpecific()}
          {(selectedPlant.userGoal === "MAINTAIN" ||
            selectedPlant.userGoal === "HEAL_DISEASE") &&
            renderOrnamentalSpecific()}
        </motion.div>
      </div>
    </motion.div>
  );
}