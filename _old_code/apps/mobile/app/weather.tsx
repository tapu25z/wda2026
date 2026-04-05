import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import {
  ArrowLeft,
  MapPin,
  Wind,
  Droplets,
  Sun,
  CloudRain,
  AlertTriangle,
  Info,
  CheckCircle,
  CalendarDays,
  Clock,
  ThumbsUp,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  Moon,
  Activity,
} from "lucide-react-native";

import { weatherApi } from "@agri-scan/shared";
import type { WeatherAndAdviceResponse } from "@agri-scan/shared";

const CATEGORIES = [
  { id: "ALL", label: "Tất cả" },
  { id: "VEGETABLE", label: "Rau màu" },
  { id: "FRUIT", label: "Ăn quả" },
  { id: "FLOWER", label: "Hoa kiểng" },
];

const translateWeather = (engDesc: string) => {
  if (!engDesc) return "";
  const dict: Record<string, string> = {
    "clear sky": "Trời quang đãng",
    "few clouds": "Ít mây",
    "scattered clouds": "Mây rải rác",
    "broken clouds": "Nhiều mây",
    "overcast clouds": "Mây u ám",
    "light rain": "Mưa nhỏ",
    "moderate rain": "Mưa vừa",
    "heavy intensity rain": "Mưa to",
    "very heavy rain": "Mưa rất to",
    "extreme rain": "Mưa cực to",
    "freezing rain": "Mưa lạnh buốt",
    "light intensity shower rain": "Mưa rào nhẹ",
    "shower rain": "Mưa rào",
    "heavy intensity shower rain": "Mưa rào to",
    thunderstorm: "Dông bão",
    "thunderstorm with light rain": "Dông và mưa nhỏ",
    "thunderstorm with rain": "Dông kèm mưa",
    "thunderstorm with heavy rain": "Dông và mưa to",
    snow: "Tuyết rơi",
    mist: "Sương mù nhẹ",
    fog: "Sương mù dày",
    haze: "Sương mù",
    dust: "Bụi mù",
  };
  return dict[engDesc.toLowerCase()] || engDesc;
};

// 🔥 Hàm dịch câu Tóm tắt (Summary) từ OWM sang Tiếng Việt
const translateSummary = (summary: string) => {
  if (!summary) return "";
  let s = summary.toLowerCase();
  if (s.includes("partly cloudy") && s.includes("clear spells"))
    return "Dự báo một ngày nhiều mây xen lẫn trời nắng hanh.";
  if (s.includes("partly cloudy") && s.includes("rain"))
    return "Dự báo một ngày nhiều mây kèm theo mưa.";
  if (s.includes("partly cloudy")) return "Dự báo một ngày nhiều mây.";
  if (s.includes("clear")) return "Trời quang đãng, nắng đẹp rực rỡ.";
  if (s.includes("rain")) return "Dự báo có mưa, thời tiết ẩm ướt.";
  return summary; // Giữ nguyên nếu không khớp từ điển
};

const getModernIconUrl = (code: string) => {
  const map: Record<string, string> = {
    "01d": "clear-day.png",
    "01n": "clear-night.png",
    "02d": "partly-cloudy-day.png",
    "02n": "partly-cloudy-night.png",
    "03d": "cloudy.png",
    "03n": "cloudy.png",
    "04d": "cloudy.png",
    "04n": "cloudy.png",
    "09d": "showers-day.png",
    "09n": "showers-night.png",
    "10d": "rain.png",
    "10n": "rain.png",
    "11d": "thunder-rain.png",
    "11n": "thunder-rain.png",
    "13d": "snow.png",
    "13n": "snow.png",
    "50d": "fog.png",
    "50n": "fog.png",
  };
  const fileName = map[code] || "partly-cloudy-day.png";
  return `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/2nd%20Set%20-%20Color/${fileName}`;
};

export default function WeatherScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] =
    useState<WeatherAndAdviceResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<
    "ALL" | "FRUIT" | "FLOWER" | "VEGETABLE"
  >("ALL");
  const [cityName, setCityName] = useState("Đang định vị...");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const fetchWeather = async (category = activeCategory) => {
    try {
      setErrorMsg("");
      let lat = 10.8231;
      let lon = 106.6297;
      let cName = "TP.Hồ Chí Minh";

      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          let location = await Location.getCurrentPositionAsync({});
          lat = location.coords.latitude;
          lon = location.coords.longitude;
          cName = "Vị trí của bạn";

          if (Platform.OS !== "web") {
            try {
              const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: lat,
                longitude: lon,
              });
              if (reverseGeocode.length > 0) {
                const place = reverseGeocode[0];
                cName =
                  place.subregion ||
                  place.city ||
                  place.region ||
                  "Vị trí hiện tại";
              }
            } catch (geoErr) {}
          } else {
            try {
              const res = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`,
              );
              const data = await res.json();
              cName =
                data.city || data.principalSubdivision || "Vị trí hiện tại";
            } catch (webGeoErr) {
              cName = "Vị trí hiện tại (Web)";
            }
          }
        }
      } catch (locErr) {}

      setCityName(cName);
      const res = await weatherApi.getWeatherAndAdvice({ lat, lon, category });
      setWeatherData(res);
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.message || "Không thể tải dữ liệu thời tiết.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeather();
  };

  const handleCategoryChange = (cat: any) => {
    setActiveCategory(cat);
    setLoading(true);
    fetchWeather(cat);
  };

  const handleDaySelect = (index: number) => {
    setSelectedDayIndex(index);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const generateFutureAdvices = (dayInfo: any) => {
    const tips = [];
    if (dayInfo.tempMax >= 34) {
      tips.push({
        adviceType: "WARNING",
        title: "🔥 Nắng nóng gay gắt",
        message: `Nhiệt độ lên tới ${Math.round(dayInfo.tempMax)}°C. Ưu tiên tưới đẫm vào sáng sớm hoặc chiều mát.`,
      });
    }
    if (dayInfo.pop >= 60) {
      tips.push({
        adviceType: "WARNING",
        title: "🌧️ Nguy cơ mưa lớn",
        message: `Xác suất mưa ${dayInfo.pop}%. Tạm dừng phun xịt hóa chất, kiểm tra hệ thống thoát nước.`,
      });
    }
    if (dayInfo.windSpeed >= 6) {
      tips.push({
        adviceType: "WARNING",
        title: "💨 Cảnh báo gió mạnh",
        message: `Gió thổi tốc độ ${dayInfo.windSpeed}m/s. Cần gia cố giàn leo, chằng chống cây cảnh.`,
      });
    }
    if (tips.length === 0) {
      tips.push({
        adviceType: "RECOMMEND",
        title: "🌱 Thời tiết thuận lợi",
        message:
          "Điều kiện sinh trưởng lý tưởng. Thích hợp cho mọi hoạt động: bón phân, phun thuốc, cắt tỉa.",
      });
    }
    return tips;
  };

  const findGoldenHour = (hourlyList: any[]) => {
    const validHours = hourlyList.slice(0, 15).filter((h) => {
      const hLocal = new Date(h.timestamp * 1000).getHours();
      return hLocal >= 5 && hLocal <= 17;
    });
    if (validHours.length === 0) return null;
    const sorted = validHours.sort((a, b) => {
      if (a.pop !== b.pop) return a.pop - b.pop;
      if (a.windSpeed !== b.windSpeed) return a.windSpeed - b.windSpeed;
      return Math.abs(a.temp - 26) - Math.abs(b.temp - 26);
    });
    const best = sorted[0];
    if (best.pop > 40 || best.windSpeed > 6 || best.temp > 35) return null;
    return best;
  };

  const getDayName = (timestamp: number, index: number) => {
    if (index === 0) return "Hôm nay";
    if (index === 1) return "Ngày mai";
    const d = new Date(timestamp * 1000);
    return d.getDay() === 0 ? "Chủ nhật" : `Thứ ${d.getDay() + 1}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return `${date.getHours().toString().padStart(2, "0")}:00`;
  };

  const formatTimeFromStamp = (timestamp: number) => {
    if (!timestamp) return "--:--";
    const d = new Date(timestamp * 1000);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const getMoonPhaseText = (phase: number) => {
    if (phase === 0 || phase === 1) return "Trăng non";
    if (phase > 0 && phase < 0.25) return "Trăng lưỡi liềm";
    if (phase === 0.25) return "Bán nguyệt đầu tháng";
    if (phase > 0.25 && phase < 0.5) return "Trăng khuyết";
    if (phase === 0.5) return "Trăng tròn";
    if (phase > 0.5 && phase < 0.75) return "Trăng khuyết cuối";
    if (phase === 0.75) return "Bán nguyệt cuối tháng";
    return "Trăng tàn";
  };

  const getHeroBgColor = (iconCode: string) => {
    if (!iconCode) return "#1e3a8a";
    if (iconCode.includes("n")) return "#0f172a";
    if (["09d", "10d", "11d", "13d", "50d"].includes(iconCode))
      return "#475569";
    return "#0ea5e9";
  };

  if (loading && !weatherData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>
          Đang lấy dữ liệu trạm khí tượng...
        </Text>
      </View>
    );
  }

  const safeData: any = weatherData;

  // 🔥 ĐÃ FIX LỖI: Lấy cả Áp suất, Tầm nhìn, Bình minh, Hoàng hôn cho ngày tương lai
  const currentViewData =
    weatherData && selectedDayIndex === 0
      ? {
          temp: Math.round(weatherData.weatherData.current.temp),
          desc:
            weatherData.weatherData.current.weatherDescription ||
            weatherData.weatherData.current.weatherMain,
          icon: weatherData.weatherData.current.weatherIcon,
          humidity: weatherData.weatherData.current.humidity,
          wind: weatherData.weatherData.current.windSpeed,
          uvi: weatherData.weatherData.current.uvi,
          pop: weatherData.weatherData.hourly[0]?.pop || 0,
          advices: weatherData.advices,
          pressure: safeData.weatherData.current.pressure,
          visibility: safeData.weatherData.current.visibility,
          sunrise: safeData.weatherData.current.sunrise,
          sunset: safeData.weatherData.current.sunset,
          summary: translateSummary(safeData.weatherData.daily[0]?.summary),
          moonPhase: safeData.weatherData.daily[0]?.moonPhase,
        }
      : weatherData && selectedDayIndex > 0
        ? {
            temp: Math.round(
              weatherData.weatherData.daily[selectedDayIndex].tempMax,
            ),
            desc: weatherData.weatherData.daily[selectedDayIndex].weatherMain,
            icon: weatherData.weatherData.daily[selectedDayIndex].weatherIcon,
            humidity: weatherData.weatherData.daily[selectedDayIndex].humidity,
            wind: weatherData.weatherData.daily[selectedDayIndex].windSpeed,
            uvi: weatherData.weatherData.daily[selectedDayIndex].uvi,
            pop: weatherData.weatherData.daily[selectedDayIndex].pop,
            advices: generateFutureAdvices(
              weatherData.weatherData.daily[selectedDayIndex],
            ),
            // 🔥 Đọc dữ liệu từ mảng daily thay vì gán null
            pressure: safeData.weatherData.daily[selectedDayIndex]?.pressure,
            visibility:
              safeData.weatherData.daily[selectedDayIndex]?.visibility,
            sunrise: safeData.weatherData.daily[selectedDayIndex]?.sunrise,
            sunset: safeData.weatherData.daily[selectedDayIndex]?.sunset,
            summary: translateSummary(
              safeData.weatherData.daily[selectedDayIndex]?.summary,
            ),
            moonPhase: safeData.weatherData.daily[selectedDayIndex]?.moonPhase,
          }
        : null;

  const goldenHour =
    selectedDayIndex === 0 && weatherData
      ? findGoldenHour(weatherData.weatherData.hourly)
      : null;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.locationWrapper}>
          <MapPin size={18} color="#16a34a" />
          <Text style={styles.locationText}>{cityName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterBtn,
                activeCategory === cat.id && styles.filterBtnActive,
              ]}
              onPress={() => handleCategoryChange(cat.id)}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  activeCategory === cat.id && styles.filterBtnTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#16a34a"]}
          />
        }
      >
        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchWeather()}
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : weatherData && currentViewData ? (
          <>
            {/* HERO CARD */}
            <View
              style={[
                styles.heroCard,
                { backgroundColor: getHeroBgColor(currentViewData.icon) },
              ]}
            >
              <View style={styles.heroMain}>
                <View style={styles.heroTextGroup}>
                  <Text style={styles.tempHuge}>{currentViewData.temp}°</Text>
                  <Text style={styles.weatherDesc}>
                    {translateWeather(currentViewData.desc)}
                  </Text>
                </View>
                <Image
                  source={{ uri: getModernIconUrl(currentViewData.icon) }}
                  style={styles.weatherIconHuge}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.statsGridRow}>
                <View style={styles.statItemRow}>
                  <Droplets size={20} color="#93c5fd" />
                  <Text style={styles.statValueRow}>
                    {currentViewData.humidity}%
                  </Text>
                  <Text style={styles.statLabelRow}>Độ ẩm</Text>
                </View>
                <View style={styles.statItemRow}>
                  <Wind size={20} color="#cbd5e1" />
                  <Text style={styles.statValueRow}>
                    {currentViewData.wind} m/s
                  </Text>
                  <Text style={styles.statLabelRow}>Gió</Text>
                </View>
                <View style={styles.statItemRow}>
                  <Sun size={20} color="#fde047" />
                  <Text style={styles.statValueRow}>{currentViewData.uvi}</Text>
                  <Text style={styles.statLabelRow}>Tia UV</Text>
                </View>
                <View style={styles.statItemRow}>
                  <CloudRain size={20} color="#67e8f9" />
                  <Text style={styles.statValueRow}>
                    {currentViewData.pop}%
                  </Text>
                  <Text style={styles.statLabelRow}>Mưa</Text>
                </View>
              </View>
            </View>

            {/* KHUNG GIỜ VÀNG (Chỉ hiện hôm nay) */}
            {selectedDayIndex === 0 && (
              <View style={styles.goldenHourCard}>
                <View style={styles.goldenHourLeft}>
                  <View style={styles.goldenIconBox}>
                    <ThumbsUp size={24} color="#10b981" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goldenTitle}>
                      Thời điểm lý tưởng nhất
                    </Text>
                    {goldenHour ? (
                      <Text style={styles.goldenDesc}>
                        Gió êm, ráo nước. Rất tốt để phun thuốc, bón phân.
                      </Text>
                    ) : (
                      <Text style={styles.goldenDesc}>
                        Hôm nay thời tiết bất lợi, không nên phun xịt hóa chất.
                      </Text>
                    )}
                  </View>
                </View>
                {goldenHour && (
                  <View style={styles.goldenTimeBadge}>
                    <Clock size={16} color="#059669" />
                    <Text style={styles.goldenTimeText}>
                      {formatTime(goldenHour.timestamp)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* THANH CHỌN NGÀY NGANG */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <CalendarDays size={20} color="#111827" />
                <Text style={styles.sectionTitle}>Dự báo 8 ngày tới</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateTabsScroll}
              >
                {weatherData.weatherData.daily.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateTab,
                      selectedDayIndex === index && styles.dateTabActive,
                    ]}
                    onPress={() => handleDaySelect(index)}
                  >
                    <Text
                      style={[
                        styles.dateTabText,
                        selectedDayIndex === index && styles.dateTabTextActive,
                      ]}
                    >
                      {getDayName(day.timestamp, index)}
                    </Text>
                    {day.pop > 30 && (
                      <CloudRain
                        size={12}
                        color={selectedDayIndex === index ? "#fff" : "#0284c7"}
                        style={{ marginTop: 4 }}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* CHỈ SỐ MỞ RỘNG (Hiện cả hiện tại lẫn tương lai) */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Activity size={20} color="#111827" />
                <Text style={styles.sectionTitle}>Chi tiết thời tiết</Text>
              </View>

              {/* Tóm tắt thời tiết nổi bật (Đã dịch sang Tiếng Việt) */}
              {currentViewData.summary && (
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryText}>
                    {currentViewData.summary}
                  </Text>
                </View>
              )}

              <View style={styles.extendedGrid}>
                {currentViewData.pressure !== null &&
                  currentViewData.pressure !== undefined && (
                    <View style={styles.extendedItem}>
                      <Gauge size={22} color="#6366f1" />
                      <View>
                        <Text style={styles.extendedLabel}>Áp suất</Text>
                        <Text style={styles.extendedValue}>
                          {currentViewData.pressure} hPa
                        </Text>
                      </View>
                    </View>
                  )}
                {currentViewData.visibility !== null &&
                  currentViewData.visibility !== undefined && (
                    <View style={styles.extendedItem}>
                      <Eye size={22} color="#14b8a6" />
                      <View>
                        <Text style={styles.extendedLabel}>Tầm nhìn</Text>
                        <Text style={styles.extendedValue}>
                          {(currentViewData.visibility / 1000).toFixed(1)} km
                        </Text>
                      </View>
                    </View>
                  )}
                {currentViewData.sunrise !== null &&
                  currentViewData.sunrise !== undefined && (
                    <View style={styles.extendedItem}>
                      <Sunrise size={22} color="#f59e0b" />
                      <View>
                        <Text style={styles.extendedLabel}>Bình minh</Text>
                        <Text style={styles.extendedValue}>
                          {formatTimeFromStamp(currentViewData.sunrise)}
                        </Text>
                      </View>
                    </View>
                  )}
                {currentViewData.sunset !== null &&
                  currentViewData.sunset !== undefined && (
                    <View style={styles.extendedItem}>
                      <Sunset size={22} color="#f43f5e" />
                      <View>
                        <Text style={styles.extendedLabel}>Hoàng hôn</Text>
                        <Text style={styles.extendedValue}>
                          {formatTimeFromStamp(currentViewData.sunset)}
                        </Text>
                      </View>
                    </View>
                  )}
                {currentViewData.moonPhase !== null &&
                  currentViewData.moonPhase !== undefined && (
                    <View style={[styles.extendedItem, { width: "100%" }]}>
                      <Moon size={22} color="#8b5cf6" />
                      <View>
                        <Text style={styles.extendedLabel}>
                          Mặt trăng đêm nay
                        </Text>
                        <Text style={styles.extendedValue}>
                          {getMoonPhaseText(currentViewData.moonPhase)}
                        </Text>
                      </View>
                    </View>
                  )}
              </View>
            </View>

            {/* AI ADVICE */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/2043/2043130.png",
                  }}
                  style={{ width: 22, height: 22 }}
                />
                <Text style={styles.sectionTitle}>
                  Bác sĩ cây trồng phân tích
                </Text>
              </View>

              {currentViewData.advices.length > 0 ? (
                currentViewData.advices.map((advice: any, index: number) => {
                  const isWarning = advice.adviceType === "WARNING";
                  const isRec = advice.adviceType === "RECOMMEND";
                  return (
                    <View
                      key={index}
                      style={[
                        styles.adviceCard,
                        isWarning
                          ? styles.cardWarning
                          : isRec
                            ? styles.cardRecommend
                            : styles.cardInfo,
                      ]}
                    >
                      <View style={styles.adviceHeader}>
                        {isWarning ? (
                          <AlertTriangle size={20} color="#ef4444" />
                        ) : isRec ? (
                          <CheckCircle size={20} color="#10b981" />
                        ) : (
                          <Info size={20} color="#3b82f6" />
                        )}
                        <Text
                          style={[
                            styles.adviceTitle,
                            isWarning && { color: "#991b1b" },
                          ]}
                        >
                          {advice.title}
                        </Text>
                      </View>
                      <Text style={styles.adviceMessage}>{advice.message}</Text>
                    </View>
                  );
                })
              ) : (
                <Text
                  style={{
                    color: "#6b7280",
                    fontStyle: "italic",
                    marginLeft: 4,
                  }}
                >
                  Không có lời khuyên đặc biệt cho ngày này.
                </Text>
              )}
            </View>

            {/* DỰ BÁO 24 GIỜ TỚI (Chỉ hiện hôm nay) */}
            {selectedDayIndex === 0 && (
              <View style={[styles.section, { marginBottom: 40 }]}>
                <Text style={styles.sectionTitle}>🕒 Biến động 24 giờ tới</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hourlyScroll}
                >
                  {weatherData.weatherData.hourly.map((hour, idx) => (
                    <View key={idx} style={styles.hourlyItem}>
                      <Text style={styles.hourlyTime}>
                        {idx === 0 ? "Bây giờ" : formatTime(hour.timestamp)}
                      </Text>
                      <Image
                        source={{ uri: getModernIconUrl(hour.weatherIcon) }}
                        style={styles.hourlyIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.hourlyTemp}>
                        {Math.round(hour.temp)}°
                      </Text>
                      {hour.pop > 0 && (
                        <View style={styles.popBadge}>
                          <CloudRain size={10} color="#0284c7" />
                          <Text style={styles.popText}>{hour.pop}%</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: { marginTop: 12, color: "#64748b", fontSize: 15 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  locationWrapper: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationText: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },

  filterContainer: {
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  filterScroll: { paddingHorizontal: 16, gap: 10 },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterBtnActive: { backgroundColor: "#dcfce3", borderColor: "#22c55e" },
  filterBtnText: { color: "#64748b", fontWeight: "600", fontSize: 14 },
  filterBtnTextActive: { color: "#15803d" },

  scrollContent: {
    padding: 16,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },

  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  heroMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  heroTextGroup: { alignItems: "flex-start" },
  weatherIconHuge: { width: 130, height: 130, marginRight: -10 },
  tempHuge: { fontSize: 72, fontWeight: "900", color: "#fff", lineHeight: 76 },
  weatherDesc: {
    fontSize: 18,
    color: "#e0f2fe",
    fontWeight: "600",
    textTransform: "capitalize",
    marginTop: 4,
  },

  statsGridRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
  },
  statItemRow: { alignItems: "center", gap: 4 },
  statValueRow: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 4,
  },
  statLabelRow: { color: "#e0f2fe", fontSize: 13 },

  goldenHourCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ecfdf5",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  goldenHourLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  goldenIconBox: {
    backgroundColor: "#d1fae5",
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  goldenTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 2,
  },
  goldenDesc: { fontSize: 13, color: "#047857", lineHeight: 18 },
  goldenTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  goldenTimeText: { fontSize: 15, fontWeight: "bold", color: "#059669" },

  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },

  // Styles cho Cụm Chỉ Số Mở Rộng
  summaryBox: {
    backgroundColor: "#f0fdfa",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccfbf1",
  },
  summaryText: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
  },
  extendedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  extendedItem: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  extendedLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 2,
  },
  extendedValue: { fontSize: 15, fontWeight: "800", color: "#1e293b" },

  dateTabsScroll: { gap: 10, paddingVertical: 4 },
  dateTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    minWidth: 80,
  },
  dateTabActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  dateTabText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  dateTabTextActive: { color: "#fff" },

  adviceCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardWarning: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  cardRecommend: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  cardInfo: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  adviceTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b", flex: 1 },
  adviceMessage: { fontSize: 14, color: "#334155", lineHeight: 22 },

  hourlyScroll: { gap: 12 },
  hourlyItem: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
    width: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  hourlyTime: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "600",
  },
  hourlyIcon: { width: 48, height: 48 },
  hourlyTemp: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1e293b",
    marginTop: 4,
  },
  popBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 6,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  popText: { fontSize: 11, color: "#0284c7", fontWeight: "bold" },

  errorBox: {
    backgroundColor: "#fef2f2",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 40,
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: { color: "#fff", fontWeight: "bold" },
});
