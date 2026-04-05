"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Cloud,
  Wind,
  Droplets,
  ThermometerSun,
  Sprout,
  MapPin,
  Calendar,
  Sunrise,
  Sunset,
  Gauge,
  AlertTriangle,
  Umbrella,
  ChevronDown,
  ChevronUp,
  Loader2,
  Navigation,
  Thermometer,
} from "lucide-react";

// Import API và Types từ shared package của bạn
import { weatherApi } from "@agri-scan/shared";
import { WeatherCategory } from "@agri-scan/shared";

// Danh sách cây trồng khớp với Database của bạn
const CROP_CATEGORIES = [
  { id: "ALL", label: "Tất cả", icon: "🌱" },
  { id: "VEGETABLE", label: "Rau củ", icon: "🥬" },
  { id: "FRUIT", label: "Cây quả", icon: "🍎" },
  { id: "FLOWER", label: "Hoa cảnh", icon: "🌸" },
];

export function WeatherPage() {
  const [activeWeather, setActiveWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");
  const [showMore, setShowMore] = useState(false);

  // 1. FIX LỖI GẠCH ĐỎ: Ép kiểu chuẩn cho selectedCrop
  const [selectedCrop, setSelectedCrop] = useState<WeatherCategory>("ALL");
  const [selectedHourIdx, setSelectedHourIdx] = useState<number | null>(null);

  // --- LOGIC KÉO TRƯỢT (Hourly Scroll) ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  const stopDragging = () => setIsDragging(false);

  // --- LOGIC ĐỊNH VỊ LINH HOẠT (Flexible Geolocation) ---
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        setLoading(true);
        const res = await weatherApi.getWeatherAndAdvice({
          lat,
          lon,
          category: selectedCrop,
        });
        setActiveWeather(res);
      } catch (e) {
        console.error("Lỗi lấy dữ liệu:", e);
      } finally {
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => fetchWeather(p.coords.latitude, p.coords.longitude),
        () => fetchWeather(10.8231, 106.6297), // Fallback TP.HCM nếu bị chặn
      );
    } else {
      fetchWeather(10.8231, 106.6297);
    }

    setCurrentDate(
      new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    );
  }, [selectedCrop]); // Tự động load lại khi đổi loại cây

  // --- HÀM TIỆN ÍCH (Helpers) ---
  const formatLocation = (name: string) =>
    name?.split("/")[1]?.replaceAll("_", " ") || name;

  const getUVStatus = (uvi: number) => {
    const v = Math.round(uvi);
    if (v <= 2)
      return {
        label: "Thấp",
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
      };
    if (v <= 5)
      return {
        label: "Vừa",
        text: "text-yellow-700",
        bg: "bg-yellow-50",
        border: "border-yellow-100",
      };
    if (v <= 7)
      return {
        label: "Cao",
        text: "text-orange-700",
        bg: "bg-orange-50",
        border: "border-orange-100",
      };
    return {
      label: "Gắt",
      text: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-100",
    };
  };

  // --- CORE RULE ENGINE (Dùng Rules từ Database của bạn) ---
  const getDynamicAdvices = (dataPoint: any, rules: any[]) => {
    if (!rules || !dataPoint) return [];
    return rules
      .filter((rule) => {
        const c = rule.conditions;
        if (c.minTemp !== undefined && dataPoint.temp < c.minTemp) return false;
        if (c.maxTemp !== undefined && dataPoint.temp > c.maxTemp) return false;
        if (c.minHumidity !== undefined && dataPoint.humidity < c.minHumidity)
          return false;
        if (c.maxHumidity !== undefined && dataPoint.humidity > c.maxHumidity)
          return false;
        if (c.minPop !== undefined && (dataPoint.pop || 0) < c.minPop)
          return false;
        if (
          c.maxWindSpeed !== undefined &&
          dataPoint.windSpeed > c.maxWindSpeed
        )
          return false;
        return true;
      })
      .sort((a, b) => b.priority - a.priority);
  };

  // --- DỮ LIỆU HIỂN THỊ ĐỘNG ---
  const isCurrent = selectedHourIdx === null;
  const displayData = useMemo(() => {
    if (!activeWeather) return null;
    return isCurrent
      ? activeWeather.weatherData.current
      : activeWeather.weatherData.hourly[selectedHourIdx!];
  }, [activeWeather, selectedHourIdx, isCurrent]);

  const currentAdvices = useMemo(() => {
    if (!activeWeather || !displayData) return [];
    // Nếu ở trạng thái Bây giờ, dùng lời khuyên tổng từ backend. Nếu chọn giờ, tự lọc dynamic.
    return isCurrent
      ? activeWeather.advices
      : getDynamicAdvices(displayData, activeWeather.rules);
  }, [activeWeather, displayData, isCurrent]);

  const warnings = currentAdvices.filter(
    (a: any) => a.adviceType === "WARNING",
  );
  const plantDoctor =
    currentAdvices.find((a: any) => a.adviceType !== "WARNING") ||
    currentAdvices[0];

  const formatTime = (ts: number) =>
    new Date(ts * 1000).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  if (loading || !activeWeather)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-slate-400 font-black animate-pulse tracking-widest text-xs uppercase">
          Đang đồng bộ dữ liệu vệ tinh...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#F8FAFC] text-slate-900 overflow-x-hidden font-sans">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-5 lg:px-8 space-y-8"
      >
        {/* SECTION: ĐỊA ĐIỂM & BỘ CHỌN CÂY (UX MỚI) */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase text-xs tracking-widest">
              <Navigation size={14} fill="currentColor" /> Vị trí hiện tại
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              {formatLocation(activeWeather.location.timezone)}
            </h1>
            <p className="text-slate-400 font-bold text-sm flex items-center gap-2">
              <Calendar size={18} /> {currentDate} •{" "}
              {isCurrent
                ? "Cập nhật ngay"
                : `Dự báo lúc ${formatTime(displayData.timestamp)}`}
            </p>
          </div>

          {/* Selector loại cây - Dùng cho Rule Engine */}
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
            {CROP_CATEGORIES.map((crop) => (
              <button
                key={crop.id}
                onClick={() => setSelectedCrop(crop.id as WeatherCategory)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${selectedCrop === crop.id ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:bg-slate-50"}`}
              >
                <span>{crop.icon}</span> {crop.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* SECTION: CẢNH BÁO ĐỎ (Dựa trên Rule trong DB) */}
        <div className="min-h-[100px]">
          <AnimatePresence mode="wait">
            {warnings.length > 0 ? (
              <motion.div
                key={warnings[0].title + selectedHourIdx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-red-50 border border-red-100 p-6 rounded-[2.5rem] flex items-start gap-5 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
                <div className="p-3 bg-red-100 rounded-2xl text-red-600 shadow-sm">
                  <AlertTriangle size={28} />
                </div>
                <div>
                  <h3 className="text-red-900 font-black text-xl">
                    {warnings[0].title}
                  </h3>
                  <p className="text-red-700 leading-relaxed mt-1 font-semibold">
                    {warnings[0].message}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-emerald-50/30 border-2 border-dashed border-emerald-100 p-6 rounded-[2.5rem] text-center text-emerald-700 font-bold"
              >
                <Sun className="inline mr-2 animate-pulse" size={20} /> Không có
                rủi ro thiên tai trong khung giờ này.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MAIN BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card Thời Tiết Chính */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px]" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[100px] leading-none font-black tracking-tighter drop-shadow-2xl">
                    {Math.round(displayData.temp)}°
                  </div>
                  <div className="text-xl text-slate-400 mt-4 font-bold flex items-center gap-3">
                    {isCurrent ? (
                      <>
                        <Thermometer className="text-emerald-400" /> Cảm giác{" "}
                        {Math.round(
                          activeWeather.weatherData.current.feelsLike,
                        )}
                        °C
                      </>
                    ) : (
                      <>
                        <Umbrella className="text-blue-400" /> Xác suất mưa:{" "}
                        {displayData.pop}%
                      </>
                    )}
                  </div>
                </div>
                <motion.img
                  key={displayData.weatherIcon}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={`https://openweathermap.org/img/wn/${displayData.weatherIcon}@4x.png`}
                  className="w-40 h-40 drop-shadow-2xl"
                />
              </div>
              <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-3xl font-black capitalize tracking-tight">
                  {isCurrent
                    ? activeWeather.weatherData.current.weatherDescription
                    : displayData.weatherMain}
                </div>
                <div className="flex gap-8 px-6 py-3 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 font-bold text-lg">
                  <span className="flex items-center gap-3">
                    <Sunrise className="text-yellow-400" size={24} />{" "}
                    {formatTime(activeWeather.weatherData.current.sunrise)}
                  </span>
                  <span className="flex items-center gap-3">
                    <Sunset className="text-orange-400" size={24} />{" "}
                    {formatTime(activeWeather.weatherData.current.sunset)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* BÁC SĨ CÂY TRỒNG (Lấy từ DB Rules của bạn) */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl flex flex-col justify-center min-h-[350px] relative overflow-hidden"
          >
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl w-fit mb-8 shadow-inner">
              <Sprout size={36} />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mb-4 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              {/* Thêm whitespace-nowrap để ép chữ "Bác sĩ cây trồng" luôn nằm trên 1 dòng */}
              <span className="whitespace-nowrap">Bác sĩ cây trồng</span>

              {/* Tag loại cây */}
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest font-black">
                {selectedCrop}
              </span>
            </h3>
            <AnimatePresence mode="wait">
              <motion.div
                key={plantDoctor?.title + selectedHourIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h4 className="text-emerald-700 font-black text-2xl leading-tight mb-2">
                  {plantDoctor?.title || "Sức khỏe ổn định"}
                </h4>
                <p className="text-slate-500 font-semibold text-lg leading-relaxed italic border-l-4 border-emerald-100 pl-4 mt-4">
                  "
                  {plantDoctor?.message ||
                    "Điều kiện thời tiết đang rất tốt cho cây phát triển khỏe mạnh."}
                  "
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* HOURLY FORECAST (Đã ẩn thanh roll, có hiệu ứng Fade) */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden"
        >
          <h3 className="text-2xl font-black text-slate-800 mb-8 px-2 flex items-center gap-3">
            <div className="w-2 h-8 bg-emerald-500 rounded-full" /> Diễn biến
            chi tiết 24 giờ
          </h3>
          <div className="relative">
            <div
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDragging}
              onMouseLeave={stopDragging}
              className="flex gap-5 overflow-x-auto pb-4 pt-4 -mx-10 px-10 no-scrollbar cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`div::-webkit-scrollbar { display: none; }`}</style>

              <div
                onClick={() => setSelectedHourIdx(null)}
                className={`flex-shrink-0 min-w-[125px] p-7 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer text-center ${isCurrent ? "bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-200 scale-105" : "bg-slate-50 border-transparent hover:border-emerald-100"}`}
              >
                <span className="block text-[10px] font-black uppercase opacity-60 tracking-widest mb-2">
                  Hiện tại
                </span>
                <img
                  src={`https://openweathermap.org/img/wn/${activeWeather.weatherData.current.weatherIcon}.png`}
                  className="mx-auto my-2 w-12 h-12"
                />
                <span className="block text-3xl font-black">
                  {Math.round(activeWeather.weatherData.current.temp)}°
                </span>
              </div>

              {activeWeather.weatherData.hourly.map((h: any, i: number) => (
                <div
                  key={i}
                  onClick={() => setSelectedHourIdx(i)}
                  className={`flex-shrink-0 min-w-[125px] p-7 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer text-center ${selectedHourIdx === i ? "bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-200 scale-105" : "bg-white border-slate-100 hover:border-emerald-200"}`}
                >
                  <span
                    className={`block text-[10px] font-black tracking-widest uppercase ${selectedHourIdx === i ? "text-white/80" : "text-slate-400"}`}
                  >
                    {formatTime(h.timestamp)}
                  </span>
                  <img
                    src={`https://openweathermap.org/img/wn/${h.weatherIcon}.png`}
                    className="mx-auto my-2 w-12 h-12"
                  />
                  <span className="block text-3xl font-black">
                    {Math.round(h.temp)}°
                  </span>
                  <div
                    className={`flex justify-center items-center gap-1 text-[10px] font-black mt-2 ${selectedHourIdx === i ? "text-white/80" : "text-blue-500"}`}
                  >
                    <Umbrella size={14} /> {h.pop}%
                  </div>
                </div>
              ))}
            </div>
            {/* Hiệu ứng Fade chặn 2 đầu */}
            <div className="absolute top-0 left-[-41px] w-24 h-full bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 right-[-41px] w-24 h-full bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
          </div>
        </motion.div>

        {/* DETAILS GRID (Fix làm tròn UV & Đổi màu động) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <DetailCard
            icon={<Wind className="text-blue-500" />}
            label="Tốc độ Gió"
            value={displayData.windSpeed}
            unit="m/s"
          />
          <DetailCard
            icon={<Droplets className="text-cyan-500" />}
            label="Độ ẩm khí"
            value={displayData.humidity}
            unit="%"
          />

          {/* LÀM TRÒN UV INDEX VÀ ĐỔI MÀU DỰA TRÊN THANG ĐO WHO */}
          {(() => {
            const uvIndex = Math.round(
              displayData.uvi ?? activeWeather.weatherData.current.uvi,
            );
            const status = getUVStatus(uvIndex);
            return (
              <DetailCard
                icon={<ThermometerSun className="text-orange-500" />}
                label="Chỉ số UV"
                value={uvIndex}
                unit={status.label}
                className={`${status.bg} ${status.text} border-transparent shadow-none`}
              />
            );
          })()}

          <DetailCard
            icon={<Gauge className="text-purple-500" />}
            label="Áp suất khí"
            value={displayData.pressure ?? 1012}
            unit="hPa"
          />
        </div>

        {/* 8-DAY FORECAST SECTION */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100"
        >
          <h3 className="text-2xl font-black text-slate-800 mb-8 px-2 flex items-center gap-3">
            <div className="w-2 h-8 bg-blue-500 rounded-full" /> Chu kỳ 8 ngày
            tới
          </h3>
          <div className="divide-y divide-slate-50">
            {activeWeather.weatherData.daily.map((day: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-6 rounded-3xl hover:bg-slate-50 transition-colors group"
              >
                <span className="w-32 font-black text-slate-700 text-lg">
                  {i === 0
                    ? "Hôm nay"
                    : new Date(day.timestamp * 1000).toLocaleDateString(
                        "vi-VN",
                        { weekday: "short" },
                      )}
                </span>
                <div className="flex items-center gap-3 w-28">
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weatherIcon}.png`}
                    className="w-10"
                  />
                  {day.pop > 10 && (
                    <span className="text-blue-500 text-sm font-black">
                      {day.pop}%
                    </span>
                  )}
                </div>
                <span className="hidden md:block flex-1 text-slate-400 font-bold capitalize text-center">
                  {day.summary || "Thời tiết ổn định"}
                </span>
                <div className="flex gap-8 font-black text-2xl w-36 justify-end">
                  <span className="text-slate-900">
                    {Math.round(day.tempMax)}°
                  </span>
                  <span className="text-slate-200 group-hover:text-slate-300 transition-colors">
                    {Math.round(day.tempMin)}°
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* PHẦN XEM THÊM (KHÔNG BỚT ĐI) */}
        <div className="flex flex-col items-center justify-center pt-8 gap-4">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Bạn muốn khám phá thêm?
          </p>
          <motion.button
            whileHover={{ y: -3, backgroundColor: "#000" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-3 px-12 py-5 bg-slate-900 text-white rounded-full shadow-2xl font-black uppercase text-xs tracking-[0.2em] transition-all"
          >
            {showMore ? (
              <>
                Thu gọn <ChevronUp size={20} />
              </>
            ) : (
              <>
                Mở rộng bản đồ & Vùng <ChevronDown size={20} />
              </>
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {showMore && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: 20 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: 20 }}
              className="overflow-hidden"
            >
              <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 mt-6 relative">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter">
                    Dữ liệu các khu vực
                  </h3>
                  <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 border border-slate-200">
                    {["Tất cả", "Bắc Bộ", "Nam Bộ"].map((r) => (
                      <button
                        key={r}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${r === "Tất cả" ? "bg-white shadow-sm text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RegionCard
                    city="Hà Nội"
                    status="Trời quang đãng"
                    temp={22}
                  />
                  <RegionCard
                    city="Đà Lạt"
                    status="Có sương mù nhẹ"
                    temp={18}
                  />
                </div>
                <div className="mt-12 p-6 bg-emerald-50 rounded-[2rem] text-center text-emerald-700 font-bold text-xs tracking-widest uppercase border border-emerald-100">
                  Dữ liệu vệ tinh các vùng miền khác đang được trích xuất thời
                  gian thực...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// SUB-COMPONENTS
function DetailCard({ icon, label, value, unit, className }: any) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={`bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border ${className || "border-slate-50"} transition-all group`}
    >
      <div
        className={`flex items-center gap-3 font-black text-[10px] uppercase tracking-widest mb-6 ${className ? "" : "text-slate-400 group-hover:text-emerald-500"}`}
      >
        {icon} {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-4xl font-black tracking-tighter ${className ? "" : "text-slate-800"}`}
        >
          {value}
        </span>
        <span
          className={`font-bold text-sm uppercase tracking-tighter ${className ? "" : "text-slate-400"}`}
        >
          {unit}
        </span>
      </div>
    </motion.div>
  );
}

function RegionCard({ city, status, temp }: any) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-emerald-200 hover:shadow-xl transition-all cursor-pointer">
      <div>
        <h4 className="font-black text-2xl text-slate-800 group-hover:text-emerald-700">
          {city}
        </h4>
        <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">
          {status}
        </p>
      </div>
      <span className="text-[40px] font-black text-slate-900">{temp}°</span>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};
