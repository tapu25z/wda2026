import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Camera,
  Droplets,
  Sun,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  Activity,
  Thermometer,
  Circle,
  Award,
  ChevronDown,
  Info,
  Leaf
} from "lucide-react";
import type { IMyGardenPlant } from "@agri-scan/shared";
import { containerVariants, itemVariants } from "../../../utils/animation";

interface TrackingViewProps {
  plant: IMyGardenPlant | null;
  onBack: () => void;
  onUpdatePhoto: () => void;
}

const DEFAULT_STAGES = ["Phân tích", "Nảy mầm", "Cây non", "Phát triển", "Ra hoa"];
const DEFAULT_TASKS = [
  {
    day: 1,
    date: new Date().toISOString(),
    weatherContext: "Trời nhiều mây, 24-26°C",
    waterAction: "Tưới nước vừa phải để giữ ẩm đất",
    fertilizerAction: "Chưa cần bón phân lúc này",
    careAction: "Loại bỏ lá úa và kiểm tra sâu bệnh",
    isCompleted: false,
  },
  {
    day: 2,
    date: new Date(Date.now() + 86400000).toISOString(),
    weatherContext: "Nắng nhẹ, 26-28°C",
    waterAction: "Tưới đẫm nếu bề mặt đất khô 2cm",
    fertilizerAction: "Bón lót nhẹ phân hữu cơ",
    careAction: "Quan sát rệp sáp dưới mặt lá",
    isCompleted: false,
  },
  {
    day: 3,
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    weatherContext: "Mưa rào, 23-25°C",
    waterAction: "Ngưng tưới nước, chú ý thoát nước",
    fertilizerAction: "Không bón phân",
    careAction: "Tránh để cây bị úng nước",
    isCompleted: false,
  }
];

export function TrackingView({ plant, onBack, onUpdatePhoto }: TrackingViewProps) {
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  if (!plant) return null;

  const displayName = plant.customName?.trim() || plant.plantInfo?.commonName?.trim() || "Cây trồng";
  const imageSrc = plant.imageUrl || plant.plantInfo?.images?.[0] || "/placeholder-plant.png";
  const conditionText = plant.currentCondition?.trim() || "Cây đang phát triển ổn định";
  
  const stages = plant.growthStages?.length ? plant.growthStages : DEFAULT_STAGES;
  const currentStageIndex = plant.currentStageIndex >= 0 ? plant.currentStageIndex : 2; 
  const roadmap = plant.careRoadmap?.length ? plant.careRoadmap : DEFAULT_TASKS;

  const todayTask = roadmap.find(t => !t.isCompleted) || roadmap[0];
  const upcomingTasks = roadmap.filter(t => t !== todayTask);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-6 py-8 pb-32 bg-[#F8FAFC] min-h-screen"
    >
      {/* TRÌNH ĐIỀU HƯỚNG */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-600 hover:text-emerald-600 border border-gray-200 shadow-sm transition-all hover:shadow">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{displayName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md text-[11px] font-bold uppercase tracking-wider">
                <Activity size={12} /> Đang theo dõi
              </span>
              <span className="text-sm text-gray-500">• {plant.plantInfo?.commonName || "Chưa có định danh"}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ===================== LỆCH TRÁI: TỔNG QUAN ===================== */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          
          <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-emerald-50">
            <div className="relative h-64 md:h-80 rounded-[1.5rem] overflow-hidden group">
              <img src={imageSrc} alt={displayName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-medium leading-relaxed drop-shadow-md">
                  {conditionText}
                </p>
              </div>

              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <Thermometer size={14} className="text-orange-500" /> 24°C
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wider">Tiến độ</span>
                <span className="text-2xl font-black text-emerald-700">{plant.progressPercentage || 0}%</span>
              </div>
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wider">Cập nhật</span>
                <span className="text-sm font-bold text-blue-900 mt-1">{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-emerald-800 opacity-30">
               <Leaf size={100} />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">Cập nhật hôm nay</h3>
                <p className="text-emerald-100/80 text-sm mt-1">Chụp ảnh để AI phân tích</p>
              </div>
              <button
                onClick={onUpdatePhoto}
                className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition-colors hover:scale-105 active:scale-95"
              >
                <Camera size={20} />
              </button>
            </div>
          </div>
        </motion.div>


        {/* ===================== LỆCH PHẢI ===================== */}
        <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
          
          {/* TIMELINE */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-emerald-50">
            <h2 className="text-lg font-bold text-emerald-900 mb-6 flex items-center gap-2">
              <Award className="text-emerald-500" size={20} /> Lộ trình sinh trưởng
            </h2>
            
            <div className="relative flex items-center justify-between w-full px-2">
              <div className="absolute left-[5%] right-[5%] top-[14px] h-[3px] bg-gray-100 rounded-full z-0" />
              <div 
                className="absolute left-[5%] top-[14px] h-[3px] bg-emerald-500 rounded-full z-0 transition-all duration-1000"
                style={{ width: `${(currentStageIndex / (stages.length - 1)) * 90}%` }}
              />

              {stages.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center group w-[20%]">
                    <div className={`w-8 h-8 rounded-full border-[3px] flex items-center justify-center bg-white transition-all duration-300 ${
                      isCompleted ? "border-emerald-500" : isCurrent ? "border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" : "border-gray-200"
                    }`}>
                      {isCompleted && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                      {isCurrent && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />}
                    </div>
                    <p className={`mt-3 text-[11px] md:text-sm font-semibold text-center ${
                      isCurrent ? "text-emerald-800" : isCompleted ? "text-emerald-600/80" : "text-gray-400"
                    }`}>
                      {stage}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NHIỆM VỤ HÔM NAY - ĐÃ TỐI ƯU GIAO DIỆN NHẮC NHỞ */}
          <div>
            <h2 className="text-lg font-bold text-emerald-900 mb-4 ml-2 flex items-center gap-2">
              <CalendarDays className="text-emerald-600" size={20} /> Nhiệm vụ Hôm nay
            </h2>
            
            <div className="bg-white border border-emerald-100 p-6 md:p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
              {/* Nền xanh nhạt tạo cảm giác thiên nhiên */}
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-emerald-100/60">
                <div>
                  <h3 className="text-2xl font-black text-emerald-950 flex items-center gap-2">
                    Ngày {todayTask.day} 
                    <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">Hôm nay</span>
                  </h3>
                  <p className="text-emerald-800/60 mt-1 font-medium">{new Date(todayTask.date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-100/50 px-4 py-2 rounded-xl">
                  <Sun size={16} className="text-amber-500" />
                  {todayTask.weatherContext}
                </div>
              </div>

              {/* THẺ NHẮC NHỞ - KHÔNG CÓ NÚT BUTTON */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                
                {/* Thẻ nhắc nhở Tưới nước (Watering Reminder) */}
                <div className="relative bg-gradient-to-br from-blue-50/80 to-white border border-blue-100/80 p-6 rounded-[1.5rem] overflow-hidden group">
                  <div className="absolute right-[-10%] bottom-[-10%] text-blue-500 opacity-[0.03] transition-transform duration-500 group-hover:scale-110 pointer-events-none">
                    <Droplets size={120} />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white shadow-sm text-blue-500 rounded-xl flex items-center justify-center border border-blue-50">
                      <Droplets size={20} />
                    </div>
                    <h4 className="font-extrabold text-blue-900 text-[15px]">Tưới nước</h4>
                  </div>
                  <p className="text-blue-900/70 text-sm leading-relaxed font-medium">
                    {todayTask.waterAction}
                  </p>
                </div>

                {/* Thẻ nhắc nhở Chăm sóc & Bón phân (Care & Fertilizer Reminder) */}
                <div className="relative bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100/80 p-6 rounded-[1.5rem] overflow-hidden group">
                  <div className="absolute right-[-10%] bottom-[-10%] text-emerald-600 opacity-[0.03] transition-transform duration-500 group-hover:scale-110 pointer-events-none">
                    <Leaf size={120} />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white shadow-sm text-amber-500 rounded-xl flex items-center justify-center border border-emerald-50">
                      <Sparkles size={20} />
                    </div>
                    <h4 className="font-extrabold text-emerald-900 text-[15px]">Bón phân & Chăm sóc</h4>
                  </div>
                  <div className="text-emerald-900/70 text-sm leading-relaxed font-medium">
                    {todayTask.fertilizerAction !== "Chưa cần bón phân" && (
                      <span className="block mb-1 font-semibold text-emerald-800">{todayTask.fertilizerAction}.</span>
                    )}
                    <span>{todayTask.careAction}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ACCORDION CÁC NGÀY TIẾP THEO */}
          <div className="mt-8">
            <h2 className="text-sm font-bold text-emerald-800/50 mb-4 ml-2 uppercase tracking-wider">Lịch trình các ngày tới</h2>
            <div className="space-y-3">
              {upcomingTasks.map((task, idx) => {
                const isExpanded = expandedTask === idx;
                return (
                  <div key={idx} className="bg-white border border-emerald-50 rounded-2xl overflow-hidden shadow-sm hover:border-emerald-100 transition-colors">
                    <button 
                      onClick={() => setExpandedTask(isExpanded ? null : idx)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-white focus:outline-none"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold border border-emerald-100/50">
                          {task.day}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-emerald-950 text-base">Nhiệm vụ Ngày {task.day}</p>
                          <p className="text-xs text-emerald-800/50 mt-0.5">{new Date(task.date).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      <ChevronDown size={20} className={`text-emerald-600/50 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    <div className={`transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100 border-t border-emerald-50" : "max-h-0 opacity-0"}`}>
                      <div className="p-6 bg-emerald-50/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex gap-3">
                            <Droplets size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-emerald-900 mb-1">Tưới nước</p>
                              <p className="text-sm text-emerald-800/70">{task.waterAction}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-emerald-900 mb-1">Chăm sóc</p>
                              <p className="text-sm text-emerald-800/70">{task.fertilizerAction}. {task.careAction}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
}