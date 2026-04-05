import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import {
  ArrowLeft,
  Trash2,
  Calendar,
  Droplets,
  ThermometerSun,
  Leaf,
  Camera as CameraIcon,
  CheckCircle2,
  AlertTriangle,
  Sprout,
  Sparkles,
} from "lucide-react-native";

import { myGardenApi } from "@agri-scan/shared";

type TabType = "ROADMAP" | "CHECKIN";

export default function GardenDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { plantId } = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState<TabType>("ROADMAP");
  const [plant, setPlant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    fetchPlantDetail();
  }, [plantId]);

  const fetchPlantDetail = async () => {
    try {
      setLoading(true);
      const res = await myGardenApi.getUserGarden();
      const foundPlant = res.find((p: any) => p._id === plantId);

      if (foundPlant) {
        setPlant(foundPlant);
      } else {
        Alert.alert("Lỗi", "Không tìm thấy cây này.");
        router.back();
      }
    } catch (error) {
      console.log("Lỗi tải chi tiết cây:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlant = () => {
    Alert.alert(
      "Xóa cây khỏi vườn?",
      "Bạn có chắc chắn muốn ngừng chăm sóc cây này không? Bạn sẽ nhận lại 1 vị trí trống trong vườn.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa bỏ",
          style: "destructive",
          onPress: async () => {
            try {
              await myGardenApi.removePlant(plantId as string);
              Alert.alert("Thành công", "Đã xóa cây khỏi vườn.");
              router.back();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa cây lúc này.");
            }
          },
        },
      ],
    );
  };

  const handleDailyCheckIn = async () => {
    if (Platform.OS === "web") {
      alert("Tính năng chụp ảnh check-in đang hoạt động ở chế độ Mobile.");
      return;
    }

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let lat = 10.7626,
        lon = 106.6601;
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setIsCheckingIn(true);

        // Cần tích hợp API upload ảnh lên Cloudinary ở đây nếu có
        const uploadedImageUrl =
          "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg";

        const todayStr = new Date().toDateString();
        const todayTask = plant?.careRoadmap?.find(
          (t: any) => new Date(t.date).toDateString() === todayStr,
        );
        const currentDay = todayTask ? todayTask.day : 1;

        const res = await myGardenApi.dailyCheckIn(plantId as string, {
          currentDay,
          imageUrl: uploadedImageUrl,
          lat,
          lon,
        });

        if (res.requireRegeneration) {
          Alert.alert("⚠️ Cảnh báo từ AI", res.message, [
            {
              text: "Tạo lộ trình mới",
              onPress: () =>
                router.push({
                  pathname: "/garden-setup",
                  params: { imageUri: result.assets[0].uri },
                } as any),
            },
          ]);
        } else {
          Alert.alert("🎉 Thành công!", res.message);
          fetchPlantDetail();
        }
      }
    } catch (error: any) {
      console.log("Lỗi checkin:", error);
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi chụp ảnh check-in.",
      );
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ marginTop: 12, color: "#64748b" }}>
          Đang tải thông tin cây...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* 🔥 FIX: Các nút công cụ được làm nổi (Floating Header) */}
      <View style={[styles.floatingHeader, { top: Math.max(insets.top, 10) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDeletePlant}
          style={[styles.iconBtn, { backgroundColor: "rgba(239,68,68,0.9)" }]}
        >
          <Trash2 size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 🔥 FIX: Gói tất cả vào một ScrollView duy nhất để lướt mượt toàn trang */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        bounces={false}
      >
        {/* ẢNH BÌA */}
        <View style={styles.coverSection}>
          <Image
            source={{
              uri:
                plant?.imageUrl ||
                "https://placehold.co/400x300?text=Agri+Scan",
            }}
            style={styles.coverImg}
          />
          <View style={styles.overlay} />
        </View>

        {/* THẺ THÔNG TIN TỔNG QUAN */}
        <View style={styles.infoCard}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.plantName}>{plant?.customName}</Text>
              <Text style={styles.plantCondition}>
                Tình trạng:{" "}
                <Text
                  style={{
                    color:
                      plant?.currentCondition === "Khỏe mạnh"
                        ? "#16a34a"
                        : "#ef4444",
                  }}
                >
                  {plant?.currentCondition || "Đang tải"}
                </Text>
              </Text>
            </View>
            <View style={styles.goalBadge}>
              <Text style={styles.goalBadgeText}>
                {plant?.userGoal === "HEAL_DISEASE"
                  ? "Chữa bệnh"
                  : "Nuôi trồng"}
              </Text>
            </View>
          </View>

          {plant?.roadmapSummary && (
            <View
              style={{
                marginTop: 16,
                backgroundColor: "#f0fdf4",
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#dcfce3",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Sparkles
                  size={16}
                  color="#16a34a"
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{ fontWeight: "bold", color: "#15803d", fontSize: 14 }}
                >
                  Đánh giá của AI
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: "#166534",
                  fontStyle: "italic",
                  lineHeight: 22,
                }}
              >
                {plant.roadmapSummary}
              </Text>
            </View>
          )}

          <View style={styles.progressSection}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={styles.progressLabel}>Tiến độ hoàn thành</Text>
              <Text style={styles.progressValue}>
                {plant?.progressPercentage || 0}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${plant?.progressPercentage || 0}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* HAI TAB ĐIỀU HƯỚNG CÙNG CUỘN LÊN */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "ROADMAP" && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab("ROADMAP")}
          >
            <Calendar
              size={18}
              color={activeTab === "ROADMAP" ? "#fff" : "#64748b"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "ROADMAP" && styles.tabTextActive,
              ]}
            >
              Lộ trình (AI)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "CHECKIN" && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab("CHECKIN")}
          >
            <CameraIcon
              size={18}
              color={activeTab === "CHECKIN" ? "#fff" : "#64748b"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "CHECKIN" && styles.tabTextActive,
              ]}
            >
              Check-in hôm nay
            </Text>
          </TouchableOpacity>
        </View>

        {/* NỘI DUNG TỪNG TAB */}
        <View style={styles.contentArea}>
          {activeTab === "ROADMAP" ? (
            <View style={styles.roadmapTab}>
              <Text style={styles.sectionTitle}>
                Các việc cần làm tiếp theo
              </Text>
              <View style={styles.timelineLine} />

              {plant?.careRoadmap?.map((task: any, index: number) => (
                <View key={index} style={styles.taskItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      task.isCompleted ? styles.timelineDotDone : {},
                    ]}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 size={16} color="#fff" />
                    ) : (
                      <Text style={styles.dotText}>{task.day}</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.taskCard,
                      task.isCompleted ? styles.taskCardDone : {},
                    ]}
                  >
                    <View style={styles.taskHeader}>
                      <Text style={styles.taskDayTitle}>Ngày {task.day}</Text>
                      <Text style={styles.taskDate}>
                        {new Date(task.date).toLocaleDateString("vi-VN")}
                      </Text>
                    </View>
                    <View style={styles.taskDetailRow}>
                      <ThermometerSun
                        size={16}
                        color="#f59e0b"
                        style={{ marginTop: 2 }}
                      />
                      <Text style={styles.taskDetailText}>
                        {task.weatherContext}
                      </Text>
                    </View>
                    <View style={styles.taskDetailRow}>
                      <Droplets
                        size={16}
                        color="#0ea5e9"
                        style={{ marginTop: 2 }}
                      />
                      <Text style={styles.taskDetailText}>
                        <Text style={{ fontWeight: "bold" }}>Nước:</Text>{" "}
                        {task.waterAction}
                      </Text>
                    </View>
                    <View style={styles.taskDetailRow}>
                      <Leaf
                        size={16}
                        color="#16a34a"
                        style={{ marginTop: 2 }}
                      />
                      <Text style={styles.taskDetailText}>
                        <Text style={{ fontWeight: "bold" }}>Phân bón:</Text>{" "}
                        {task.fertilizerAction}
                      </Text>
                    </View>
                    <View style={styles.taskDetailRow}>
                      <AlertTriangle
                        size={16}
                        color="#dc2626"
                        style={{ marginTop: 2 }}
                      />
                      <Text style={styles.taskDetailText}>
                        <Text style={{ fontWeight: "bold" }}>Chăm sóc:</Text>{" "}
                        {task.careAction}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.checkinTab}>
              <View style={styles.checkinBox}>
                <Sprout size={64} color="#16a34a" />
                <Text style={styles.checkinTitle}>Đến lúc chăm cây rồi!</Text>
                <Text style={styles.checkinDesc}>
                  Hãy chụp một bức ảnh cập nhật tình trạng mới nhất của cây để
                  AI đánh giá xem bạn có đang làm đúng theo lộ trình không nhé.
                </Text>
                <TouchableOpacity
                  style={styles.cameraBtn}
                  onPress={handleDailyCheckIn}
                  disabled={isCheckingIn}
                >
                  {isCheckingIn ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <CameraIcon size={24} color="#fff" />
                      <Text style={styles.cameraBtnText}>
                        Mở Camera Check-in
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                <View style={styles.warningBox}>
                  <AlertTriangle size={20} color="#d97706" />
                  <Text style={styles.warningText}>
                    Lưu ý: Nếu bạn quên check-in quá 3 ngày, lộ trình cũ sẽ bị
                    hủy và phải nhờ AI tạo lại từ đầu!
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },

  floatingHeader: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  coverSection: { width: "100%", height: 260, position: "relative" },
  coverImg: { width: "100%", height: "100%", resizeMode: "cover" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  infoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  plantName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
  },
  plantCondition: { fontSize: 15, color: "#64748b", fontWeight: "600" },
  goalBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goalBadgeText: { color: "#d97706", fontWeight: "bold", fontSize: 13 },
  progressSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  progressLabel: { fontSize: 14, color: "#64748b", fontWeight: "bold" },
  progressValue: { fontSize: 15, color: "#16a34a", fontWeight: "900" },
  progressBarBg: {
    height: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#16a34a",
    borderRadius: 6,
  },

  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#e2e8f0",
    borderRadius: 14,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: "#16a34a",
    shadowColor: "#16a34a",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: { fontSize: 15, fontWeight: "bold", color: "#64748b" },
  tabTextActive: { color: "#fff" },

  contentArea: { padding: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 20,
  },
  roadmapTab: { position: "relative", paddingLeft: 10 },
  timelineLine: {
    position: "absolute",
    left: 23,
    top: 45,
    bottom: 20,
    width: 2,
    backgroundColor: "#cbd5e1",
  },
  taskItem: { flexDirection: "row", marginBottom: 24 },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    marginTop: 10,
  },
  timelineDotDone: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  dotText: { fontSize: 12, fontWeight: "bold", color: "#64748b" },
  taskCard: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 1,
  },
  taskCardDone: { opacity: 0.6, backgroundColor: "#f8fafc" },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  taskDayTitle: { fontSize: 17, fontWeight: "bold", color: "#1e293b" },
  taskDate: { fontSize: 13, color: "#94a3b8", fontWeight: "600" },
  taskDetailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  taskDetailText: { flex: 1, fontSize: 15, color: "#475569", lineHeight: 22 },

  checkinTab: { padding: 10 },
  checkinBox: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
  },
  checkinTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 16,
    marginBottom: 8,
  },
  checkinDesc: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  cameraBtn: {
    flexDirection: "row",
    backgroundColor: "#16a34a",
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    elevation: 3,
  },
  cameraBtnText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#d97706",
    lineHeight: 22,
    fontWeight: "500",
  },
});
