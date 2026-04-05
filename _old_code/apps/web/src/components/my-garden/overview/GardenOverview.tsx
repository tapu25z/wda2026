import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Plus,
  Home,
  Leaf,
  ScanLine,
  Activity,
  AlertCircle,
  Droplets,
  Trash2,
} from "lucide-react";
// THAY BẰNG:
import type { IMyGardenPlant } from "@agri-scan/shared";
import { MOCK_PLANTS } from "../../data/gardenData";

interface GardenOverviewProps {
  activeTab: "TRACKING" | "FRUIT" | "FLOWER" | "ORNAMENTAL";
  setActiveTab: (tab: "TRACKING" | "FRUIT" | "FLOWER" | "ORNAMENTAL") => void;
  setStep: (
    step: "OVERVIEW" | "UPLOAD" | "ANALYZING" | "RESULT" | "TRACKING",
  ) => void;
  setIsViewingTracked: (isViewing: boolean) => void;
  navigate: (path: string) => void;
  // THAY BẰNG:
  trackedPlants: IMyGardenPlant[];
  handleRemovePlant: (id: string) => void;
  handleTrackPlant: (plant: IMyGardenPlant) => void;
  handleViewTrackedPlant: (plant: IMyGardenPlant) => void;
  setSelectedPlant: (plant: IMyGardenPlant | null) => void;
  isLoading?: boolean;
}

export function GardenOverview({
  trackedPlants,
  activeTab,
  setActiveTab,
  setStep,
  setSelectedPlant,
  setIsViewingTracked,
  handleRemovePlant,
  handleTrackPlant,
  handleViewTrackedPlant,
  navigate,
}: GardenOverviewProps) {
  const totalPlants = trackedPlants.length;
  const healthyPlants = trackedPlants.filter(
    (p) => p.currentCondition === "Khỏe mạnh",
  ).length;

  const attentionPlants = totalPlants - healthyPlants;

  return (
    <motion.div
      key="overview-populated"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto px-4 py-8 md:py-12"
    >
      {/* Header & Stats - Compact Web Layout */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8 mb-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          {/* Left: Title & Location */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/")}
              className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:scale-105 transition-all shrink-0"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-1">
                Vườn của tôi
              </h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                <MapPin size={16} className="text-emerald-500" /> Ho Chi Minh
                City • 33.4°C
              </div>
            </div>
          </div>

          {/* Right: Stats & Action */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
            {/* Compact Stats */}
            <div className="flex items-center gap-6 px-6 py-3 bg-gray-50 rounded-2xl w-full sm:w-auto justify-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-gray-900 leading-none">
                  {totalPlants}
                </span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                  Tổng cây
                </span>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-emerald-500 leading-none">
                  {healthyPlants}
                </span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                  Khỏe mạnh
                </span>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-red-500 leading-none">
                  {attentionPlants}
                </span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                  Cần chú ý
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setStep("UPLOAD")}
              className="w-full sm:w-auto bg-emerald-500 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 font-bold"
            >
              <Plus size={20} /> Thêm cây mới
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide px-2">
        <button
          onClick={() => setActiveTab("TRACKING")}
          className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
            activeTab === "TRACKING"
              ? "bg-gray-900 text-white shadow-md"
              : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
          }`}
        >
          Cây đang theo dõi
        </button>
        <button
          onClick={() => setActiveTab("FRUIT")}
          className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
            activeTab === "FRUIT"
              ? "bg-gray-900 text-white shadow-md"
              : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
          }`}
        >
          Cây ăn quả
        </button>
        <button
          onClick={() => setActiveTab("FLOWER")}
          className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
            activeTab === "FLOWER"
              ? "bg-gray-900 text-white shadow-md"
              : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
          }`}
        >
          Cây hoa
        </button>
        <button
          onClick={() => setActiveTab("ORNAMENTAL")}
          className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
            activeTab === "ORNAMENTAL"
              ? "bg-gray-900 text-white shadow-md"
              : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
          }`}
        >
          Cây kiểng
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "TRACKING" ? (
        trackedPlants.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-20">
            {/* 3D-like Illustration Composition */}
            <div className="relative w-48 h-48 mb-10">
              <div className="absolute inset-0 bg-emerald-100 rounded-[2.5rem] rotate-6 opacity-60 transition-transform hover:rotate-12 duration-500"></div>
              <div className="absolute inset-0 bg-teal-100 rounded-[2.5rem] -rotate-6 opacity-60 transition-transform hover:-rotate-12 duration-500"></div>
              <div className="absolute inset-0 bg-white rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center border border-gray-50 z-10">
                <Home
                  size={56}
                  className="text-emerald-500 mb-2"
                  strokeWidth={1.5}
                />
                <div className="flex gap-1">
                  <Leaf size={20} className="text-teal-400" strokeWidth={2} />
                  <Leaf
                    size={24}
                    className="text-emerald-400 -mt-2"
                    strokeWidth={2}
                  />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-gray-900 mb-3 leading-tight">
              Khu vườn của bạn đang trống
              <br />
              hãy lấp đầy nó nhé!
            </h2>
            <p className="text-gray-500 mb-10 text-lg leading-relaxed">
              Chụp ảnh bất kỳ cây nào—chúng tôi sẽ nhận diện và theo dõi quá
              trình chăm sóc, cực kỳ dễ dàng.
            </p>

            <button
              onClick={() => setStep("UPLOAD")}
              className="bg-emerald-500 text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-500/30 w-full justify-center max-w-xs"
            >
              <Plus size={24} /> Thêm cây mới
            </button>
          </div>
        ) : (
          <>
            {/* List Header */}
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-xl font-bold text-gray-900">
                Cây đang theo dõi
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-medium text-gray-500">
                  Cập nhật theo thời gian thực
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {trackedPlants.map((plant) => (
                  <motion.div
                    key={plant._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all group flex flex-col sm:flex-row gap-5 relative overflow-hidden"
                  >
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTrackedPlant(plant);
                        }}
                        className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-600 transition-colors shadow-md w-48 flex items-center justify-center gap-2"
                      >
                        <ScanLine size={18} /> Chi tiết
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrackPlant(plant);
                        }}
                        className="px-6 py-2.5 bg-white text-emerald-600 border-2 border-emerald-500 font-bold rounded-full hover:bg-emerald-50 transition-colors shadow-md w-48 flex items-center justify-center gap-2"
                      >
                        <Activity size={18} /> Theo dõi
                      </button>
                    </div>

                    {/* Image */}
                    <div className="w-full sm:w-40 h-48 sm:h-40 rounded-2xl overflow-hidden shrink-0 relative">
                      <img
                        src={plant.imageUrl || plant.plantInfo?.images?.[0] || '/placeholder-plant.png'}
                        alt={plant.customName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 py-1 flex flex-col justify-center min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-xl text-gray-900 pr-6 break-words">
                          {plant.customName}
                        </h3>
                        {plant.currentCondition !== "Khỏe mạnh" && (
                          <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center shrink-0 absolute top-4 right-4 sm:static">
                            <AlertCircle size={16} className="text-red-500" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <span>Giai đoạn:</span>
                        <span className="font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                          {plant.growthStages[plant.currentStageIndex]}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-3 mb-5 w-full">
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex-1">
                          <div
                            className={`h-full rounded-full relative ${plant.currentCondition === "Khỏe mạnh" ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-amber-400 to-amber-500"}`}
                            style={{ width: `${plant.progressPercentage}%` }}
                          >
                            <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 animate-pulse rounded-r-full"></div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-gray-500 w-8 shrink-0 text-right">
                          {plant.progressPercentage}%
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-auto">
                        <div className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-100/50">
                          <Droplets size={14} />
                          {(() => {
                            const nextTask = plant.careRoadmap?.find(
                              (t) => !t.isCompleted,
                            );
                            const days = nextTask
                              ? Math.max(
                                  1,
                                  Math.ceil(
                                    (new Date(nextTask.date).getTime() -
                                      Date.now()) /
                                      86400000,
                                  ),
                                )
                              : 1;
                            return days <= 1
                              ? "Tưới: Hôm nay"
                              : days === 2
                                ? "Tưới: Ngày mai"
                                : `Tưới: ${days} ngày tới`;
                          })()}
                        </div>
                        <div
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                            plant.currentCondition === "Khỏe mạnh"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                              : "bg-red-50 text-red-600 border-red-100/50"
                          }`}
                        >
                          {plant.currentCondition === "Khỏe mạnh" ? (
                            <Leaf size={14} />
                          ) : (
                            <AlertCircle size={14} />
                          )}
                          {plant.currentCondition === "Khỏe mạnh"
                            ? "Tốt"
                            : "Cảnh báo bệnh"}
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePlant(plant._id);
                      }}
                      className="absolute top-4 right-4 p-2.5 bg-white/90 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full shadow-sm backdrop-blur-md transition-all z-30 opacity-0 group-hover:opacity-100 hover:scale-110"
                      title="Xóa khỏi vườn"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )
      ) : (
        <>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === "FRUIT"
                ? "Danh sách Cây ăn quả hỗ trợ"
                : activeTab === "FLOWER"
                  ? "Danh sách Cây hoa hỗ trợ"
                  : "Danh sách Cây kiểng hỗ trợ"}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(MOCK_PLANTS as any[])
              .filter((p) => p.group === activeTab)
              .map((plant) => (
                <motion.div
                  key={plant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all flex flex-col gap-4"
                >
                  <div className="w-full h-48 rounded-2xl overflow-hidden relative">
                    <img
                      src={plant.image}
                      alt={plant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-2 pb-2">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {plant.name}
                    </h3>
                    <p className="text-sm text-gray-500 italic mb-3">
                      {plant.species}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedPlant(plant);
                        setIsViewingTracked(false);
                        setStep("RESULT");
                      }}
                      className="w-full py-2.5 bg-gray-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors text-sm"
                    >
                      Xem chi tiết mẫu
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
