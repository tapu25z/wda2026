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
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import {
  ArrowLeft,
  MapPin,
  Leaf,
  Stethoscope,
  Sparkles,
  CheckCircle2,
} from "lucide-react-native";

import { scanApi, myGardenApi } from "@agri-scan/shared";

// Định nghĩa Type chính xác cho mục tiêu
type GoalType = "HEAL_DISEASE" | "GET_FRUIT" | "GET_FLOWER" | "MAINTAIN";

const GOALS: { id: GoalType; label: string; icon: string }[] = [
  { id: "HEAL_DISEASE", label: "Chữa bệnh cho cây", icon: "💊" },
  { id: "GET_FRUIT", label: "Thu hoạch quả", icon: "🍅" },
  { id: "GET_FLOWER", label: "Lấy hoa", icon: "🌸" },
  { id: "MAINTAIN", label: "Duy trì khỏe mạnh", icon: "🌿" },
];

export default function GardenSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { imageUri } = useLocalSearchParams();

  const [isScanning, setIsScanning] = useState(true);
  const [scanData, setScanData] = useState<any>(null);

  // Dữ liệu bóc tách từ AI
  const [scannedImageUrl, setScannedImageUrl] = useState<string>("");
  const [plantName, setPlantName] = useState<string>("Cây trồng");
  const [diseaseName, setDiseaseName] = useState<string>("Khỏe mạnh");

  const [customName, setCustomName] = useState("");
  // 🔥 FIX: Ép đúng kiểu GoalType thay vì string chung chung
  const [selectedGoal, setSelectedGoal] = useState<GoalType>("MAINTAIN");
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [locationStatus, setLocationStatus] = useState("Đang lấy vị trí...");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getLocation();

    if (imageUri) {
      processImageWithAI_REAL(imageUri as string);
    } else {
      Alert.alert("Lỗi", "Không tìm thấy ảnh hợp lệ.");
      router.back();
    }
  }, [imageUri]);

  const getLocation = async () => {
    try {
      if (Platform.OS === "web") {
        setLocation({ lat: 10.762622, lon: 106.660172 });
        setLocationStatus("Đã lấy vị trí (Web Mode)");
        return;
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationStatus("Bị từ chối quyền vị trí");
        setLocation({ lat: 10.762622, lon: 106.660172 });
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      setLocationStatus("Đã lấy vị trí chính xác");
    } catch (error) {
      setLocationStatus("Không thể lấy vị trí");
      setLocation({ lat: 10.762622, lon: 106.660172 });
    }
  };

  const processImageWithAI_REAL = async (uri: string) => {
    try {
      setIsScanning(true);

      let fileToUpload: any;
      if (Platform.OS === "web") {
        const response = await fetch(uri);
        const blob = await response.blob();
        const FileRef = (window as any).File;
        fileToUpload = new FileRef([blob], "upload.jpg", {
          type: blob.type || "image/jpeg",
        });
      } else {
        fileToUpload = { uri, name: "upload.jpg", type: "image/jpeg" };
      }

      const result = await scanApi.scanImageAndWait(fileToUpload);
      setScanData(result);

      const uploadedImgUrl =
        (result as any).imageUrl || (result as any).image?.url;
      if (uploadedImgUrl) {
        setScannedImageUrl(uploadedImgUrl);
      }

      const topPred =
        (result as any).predictions?.[0] || (result as any).aiPredictions?.[0];
      const diseaseLabel =
        topPred?.diseaseId?.name ||
        (result as any).topDisease?.name ||
        "Khỏe mạnh";

      let pName = "Cây trồng";
      let dName = diseaseLabel;

      if (diseaseLabel.includes("___")) {
        const parts = diseaseLabel.split("___");
        pName = parts[0].replace(/_/g, " ");
        dName = parts[1].replace(/_/g, " ");
      } else if (diseaseLabel.includes("_")) {
        pName = diseaseLabel.split("_")[0];
      }

      setPlantName(pName);
      setDiseaseName(dName);

      if (dName !== "Khỏe mạnh" && dName !== "healthy") {
        setSelectedGoal("HEAL_DISEASE");
      } else {
        setSelectedGoal("MAINTAIN");
      }
    } catch (error: any) {
      console.log("Lỗi scan ảnh tạo vườn:", error);
      Alert.alert(
        "Lỗi AI",
        error?.message || "Không thể nhận diện ảnh lúc này.",
      );
      router.back();
    } finally {
      setIsScanning(false);
    }
  };

  const handleCreateRoadmap_REAL = async () => {
    if (!customName.trim())
      return Alert.alert(
        "Thiếu thông tin",
        "Vui lòng đặt tên cho cây của bạn.",
      );
    if (!location)
      return Alert.alert(
        "Chờ chút",
        "Hệ thống đang lấy vị trí GPS của bạn để kiểm tra thời tiết.",
      );

    try {
      setIsSubmitting(true);

      await myGardenApi.addPlantToGarden({
        plantName: plantName,
        diseaseName: diseaseName,
        imageUrl: scannedImageUrl || (imageUri as string),
        customName: customName.trim(),
        userGoal: selectedGoal,
        lat: location.lat,
        lon: location.lon,
      });

      Alert.alert(
        "🎉 Thành công!",
        "AI đã phân tích thời tiết và tạo xong lộ trình chăm sóc cho cây của bạn.",
        [
          {
            text: "Xem vườn ngay",
            onPress: () => router.replace("/my-garden" as any),
          },
        ],
      );
    } catch (error: any) {
      console.log("Lỗi tạo lộ trình:", error);
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Có lỗi xảy ra khi tạo lộ trình.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" />

      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          disabled={isScanning || isSubmitting}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khai báo thông tin</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.imageSection}>
          <Image
            source={{ uri: imageUri as string }}
            style={styles.previewImg}
          />
          {isScanning ? (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color="#16a34a" />
              <Text style={styles.scanningText}>
                AI đang phân tích tình trạng cây...
              </Text>
            </View>
          ) : (
            <View style={styles.resultBadge}>
              <CheckCircle2 size={20} color="#16a34a" />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.resultTitle}>Hoàn tất phân tích!</Text>
                <Text style={styles.resultDesc} numberOfLines={1}>
                  Phát hiện: {diseaseName}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View
          style={{ opacity: isScanning ? 0.5 : 1 }}
          pointerEvents={isScanning ? "none" : "auto"}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              1. Đặt tên cho cây của bạn{" "}
              <Text style={{ color: "#ef4444" }}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Leaf size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Ví dụ: Cà chua ban công, Hoa hồng trồng chậu..."
                value={customName}
                onChangeText={setCustomName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              2. Mục tiêu chăm sóc <Text style={{ color: "#ef4444" }}>*</Text>
            </Text>
            <Text style={styles.subLabel}>
              AI sẽ dựa vào mục tiêu này để đưa ra lời khuyên phù hợp.
            </Text>
            <View style={styles.goalsContainer}>
              {GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalBtn,
                    selectedGoal === goal.id && styles.goalBtnActive,
                  ]}
                  onPress={() => setSelectedGoal(goal.id)}
                >
                  <Text style={styles.goalIcon}>{goal.icon}</Text>
                  <Text
                    style={[
                      styles.goalText,
                      selectedGoal === goal.id && styles.goalTextActive,
                    ]}
                  >
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>3. Tọa độ & Thời tiết</Text>
            <View style={styles.locationBox}>
              <View style={styles.locIconBox}>
                <MapPin size={24} color="#3b82f6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locTitle}>Vị trí vườn của bạn</Text>
                <Text style={styles.locDesc}>{locationStatus}</Text>
                {location && (
                  <Text style={styles.locCoords}>
                    Lat: {location.lat.toFixed(4)} | Lon:{" "}
                    {location.lon.toFixed(4)}
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.aiNotice}>
              <Sparkles size={14} color="#d97706" /> AI sẽ lấy dữ liệu thời tiết
              7 ngày tới tại vị trí này để tối ưu lượng nước tưới.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              (isScanning || isSubmitting) && styles.submitBtnDisabled,
            ]}
            onPress={handleCreateRoadmap_REAL}
            disabled={isScanning || isSubmitting}
          >
            {isSubmitting ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <ActivityIndicator color="#fff" />
                <Text style={styles.submitBtnText}>
                  AI đang soạn lộ trình...
                </Text>
              </View>
            ) : (
              <>
                <Stethoscope size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Tạo Lộ Trình Chăm Sóc</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// BẠN GIỮ NGUYÊN CÁC STYLES TỪ FILE CŨ NHÉ
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  content: { padding: 16, paddingBottom: 60 },
  imageSection: {
    position: "relative",
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
    elevation: 3,
  },
  previewImg: { width: "100%", height: 220, resizeMode: "cover" },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanningText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "bold",
    color: "#16a34a",
  },
  resultBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  resultTitle: { fontSize: 14, fontWeight: "bold", color: "#16a34a" },
  resultDesc: { fontSize: 13, color: "#475569", marginTop: 2 },
  inputGroup: { marginBottom: 24 },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 12,
    fontStyle: "italic",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#1e293b",
    outlineStyle: "none" as any,
  },
  goalsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  goalBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    width: "48%",
  },
  goalBtnActive: { backgroundColor: "#f0fdf4", borderColor: "#16a34a" },
  goalIcon: { fontSize: 18, marginRight: 8 },
  goalText: { fontSize: 13, fontWeight: "600", color: "#64748b", flex: 1 },
  goalTextActive: { color: "#16a34a" },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  locIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 2,
  },
  locDesc: { fontSize: 13, color: "#3b82f6", marginBottom: 4 },
  locCoords: {
    fontSize: 11,
    color: "#60a5fa",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  aiNotice: {
    fontSize: 12,
    color: "#d97706",
    marginTop: 8,
    fontStyle: "italic",
  },
  submitBtn: {
    flexDirection: "row",
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    elevation: 3,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
