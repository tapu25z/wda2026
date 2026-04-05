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
  Dimensions,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Crown,
  Target,
  Thermometer,
  Sprout,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ImagePlus,
  Camera as CameraIcon,
} from "lucide-react-native";

import { myGardenApi } from "@agri-scan/shared";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const ProgressBar = ({ progress }: { progress: number }) => (
  <View style={styles.progressBarContainer}>
    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
    <Text style={styles.progressText}>{progress}%</Text>
  </View>
);

const PlantCard = ({ plant, onPress }: { plant: any; onPress: () => void }) => {
  const getHealthStatus = (status: string, condition: string) => {
    if (status === "COMPLETED")
      return {
        text: "Hoàn thành",
        color: "#16a34a",
        icon: <Crown size={14} color="#16a34a" />,
      };
    if (status === "FAILED")
      return {
        text: "Thất bại",
        color: "#ef4444",
        icon: <XCircle size={14} color="#ef4444" />,
      };
    if (condition === "Khỏe mạnh")
      return {
        text: "Khỏe mạnh",
        color: "#16a34a",
        icon: <CheckCircle size={14} color="#16a34a" />,
      };
    if (condition && condition.includes("Đang điều trị"))
      return {
        text: "Đang trị bệnh",
        color: "#ef4444",
        icon: <AlertTriangle size={14} color="#ef4444" />,
      };
    return {
      text: condition || "Chờ cập nhật",
      color: "#64748b",
      icon: <AlertTriangle size={14} color="#64748b" />,
    };
  };

  const healthStatus = getHealthStatus(plant.status, plant.currentCondition);

  const getGoalText = (goal: string) => {
    switch (goal) {
      case "HEAL_DISEASE":
        return "Chữa bệnh";
      case "GET_FRUIT":
        return "Lấy quả";
      case "GET_FLOWER":
        return "Lấy hoa";
      case "MAINTAIN":
        return "Duy trì khỏe mạnh";
      default:
        return "Nuôi trồng";
    }
  };

  return (
    <TouchableOpacity style={styles.plantCard} onPress={onPress}>
      <Image
        source={{
          uri: plant.imageUrl || "https://placehold.co/150?text=Agri+Scan",
        }}
        style={styles.plantImage}
      />
      <View style={styles.plantCardBody}>
        <Text style={styles.customName} numberOfLines={1}>
          {plant.customName}
        </Text>
        <Text style={styles.goalText} numberOfLines={1}>
          <Target size={12} color="#64748b" /> {getGoalText(plant.userGoal)}
        </Text>
        <Text style={styles.progressLabel}>Tiến độ nuôi trồng:</Text>
        <ProgressBar progress={plant.progressPercentage || 0} />
        <View style={styles.statusRow}>
          {healthStatus.icon}
          <Text
            style={[styles.statusText, { color: healthStatus.color }]}
            numberOfLines={1}
          >
            {healthStatus.text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function MyGardenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [plants, setPlants] = useState<any[]>([]);
  const [userPlan, setUserPlan] = useState<{ plan?: string }>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Gọi lại API mỗi khi tab này được focus lại
  useFocusEffect(
    React.useCallback(() => {
      loadUserDataAndGarden();
    }, []),
  );

  const loadUserDataAndGarden = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      let userStr =
        Platform.OS === "web"
          ? localStorage.getItem("user")
          : await SecureStore.getItemAsync("user");
      const user = userStr ? JSON.parse(userStr) : null;
      setUserPlan(user || {});

      if (!user || user.plan === "FREE") {
        setPlants([]);
        setLoading(false);
        return;
      }

      // 🔥 KẾT NỐI API THẬT
      const res = await myGardenApi.getUserGarden();
      setPlants(res || []);
    } catch (error) {
      console.log("Lỗi load vườn:", error);
      setErrorMsg("Không thể tải thông tin vườn lúc này.");
    } finally {
      setLoading(false);
    }
  };

  const getPlanLimits = (plan?: string) => {
    switch (plan) {
      case "VIP":
        return 20;
      case "PREMIUM":
        return 10;
      default:
        return 0;
    }
  };

  const totalPlants = plants.length;
  const planLimit = getPlanLimits(userPlan.plan);
  const remainingSlots = Math.max(0, planLimit - totalPlants);

  const handleOpenCamera = async () => {
    if (Platform.OS === "web") {
      alert(
        "Máy ảnh không hỗ trợ trên trình duyệt, vui lòng dùng nút Tải ảnh lên.",
      );
      return;
    }
    try {
      const currentPerm = await ImagePicker.getCameraPermissionsAsync();
      if (currentPerm?.status !== "granted") {
        const newPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (newPerm?.status !== "granted") {
          Alert.alert("Cấp quyền", "Cần quyền máy ảnh để quét cây.", [
            { text: "Đóng", style: "cancel" },
            { text: "Mở Cài đặt", onPress: () => Linking.openSettings() },
          ]);
          return;
        }
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        router.push({
          pathname: "/garden-setup",
          params: { imageUri: result.assets[0].uri },
        } as any);
      }
    } catch (error) {
      console.log("Lỗi mở camera:", error);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        router.push({
          pathname: "/garden-setup",
          params: { imageUri: result.assets[0].uri },
        } as any);
      }
    } catch (error) {
      console.log("Lỗi chọn ảnh:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khu vườn của tôi</Text>
        <View style={styles.headerRight}>
          <View style={styles.tempBox}>
            <Thermometer size={16} color="#475569" />
            <Text style={styles.tempText}>--°C</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryLabel}>Số lượng cây hiện tại:</Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text style={styles.summaryValue}>{totalPlants}</Text>
                <Text style={styles.limitValue}>/ {planLimit} cây</Text>
              </View>
              <Text
                style={[
                  styles.summaryTrend,
                  { color: remainingSlots > 0 ? "#16a34a" : "#ef4444" },
                ]}
              >
                {remainingSlots > 0
                  ? `Còn lại ${remainingSlots} slot nuôi trồng`
                  : "Đã hết slot nuôi trồng"}
              </Text>
            </View>
            <TouchableOpacity style={styles.planBadge}>
              <Crown size={18} color="#f59e0b" />
              <Text style={styles.planText}>
                Gói {userPlan.plan || "Cơ bản"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {userPlan.plan && userPlan.plan !== "FREE" && remainingSlots > 0 && (
          <View style={styles.scannerSection}>
            <Text style={styles.sectionHeading}>Thêm cây mới vào vườn</Text>
            <View style={styles.actionCard}>
              <View style={styles.actionIconBox}>
                <CameraIcon size={48} color="#16a34a" />
              </View>
              <Text style={styles.actionTitle}>Chụp hoặc Tải ảnh lên</Text>
              <Text style={styles.actionDesc}>
                Sử dụng AI để nhận diện cây và tình trạng bệnh, sau đó bắt đầu
                lộ trình chăm sóc.
              </Text>
              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleOpenCamera}
                >
                  <CameraIcon size={20} color="#fff" />
                  <Text style={styles.btnPrimaryText}>Mở Máy Ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnSecondary}
                  onPress={handlePickImage}
                >
                  <ImagePlus size={20} color="#16a34a" />
                  <Text style={styles.btnSecondaryText}>Thư viện</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.sectionHeading}>Cây đang nuôi trồng</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#16a34a"
            style={{ marginTop: 50 }}
          />
        ) : errorMsg ? (
          <View style={styles.errorBox}>
            <AlertTriangle size={30} color="#dc2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : !userPlan.plan || userPlan.plan === "FREE" ? (
          <View style={styles.freeBox}>
            <Sprout size={50} color="#cbd5e1" />
            <Text style={styles.freeText}>Vườn đang đóng.</Text>
            <Text style={styles.freeSubtitle}>
              Nâng cấp lên gói VIP hoặc PREMIUM để mở khóa tính năng nuôi trồng
              cây!
            </Text>
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => router.push("/upgrade" as any)}
            >
              <Text style={styles.upgradeBtnText}>Nâng cấp ngay</Text>
            </TouchableOpacity>
          </View>
        ) : plants.length === 0 ? (
          <View style={styles.emptyBox}>
            <Sprout size={50} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              Bạn chưa nuôi trồng cây nào trong vườn.
            </Text>
            <Text style={styles.emptySubtitle}>
              Hãy dùng nút bên trên chụp một cây để bắt đầu!
            </Text>
          </View>
        ) : (
          <View style={styles.plantListGrid}>
            {plants.map((plant) => (
              <PlantCard
                key={plant._id}
                plant={plant}
                onPress={() =>
                  router.push({
                    pathname: "/garden-detail",
                    params: { plantId: plant._id },
                  } as any)
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// BẠN GIỮ NGUYÊN CÁC STYLES TỪ FILE CŨ NHÉ
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
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
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  tempBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tempText: { fontSize: 13, color: "#1d4ed8", fontWeight: "600" },
  scrollContent: { padding: 16, paddingBottom: 100 },
  summaryContainer: { marginBottom: 20 },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    alignItems: "center",
  },
  summaryLabel: { fontSize: 12, color: "#64748b", marginBottom: 2 },
  summaryValue: { fontSize: 32, fontWeight: "900", color: "#16a34a" },
  limitValue: {
    fontSize: 16,
    color: "#94a3b8",
    fontWeight: "600",
    paddingBottom: 4,
  },
  summaryTrend: { fontSize: 12, fontWeight: "600" },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  planText: { fontSize: 12, color: "#d97706", fontWeight: "bold" },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
  },
  scannerSection: { marginBottom: 24 },
  actionCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  actionIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  actionDesc: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  actionBtnRow: { flexDirection: "row", gap: 12, width: "100%" },
  btnPrimary: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  btnPrimaryText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  btnSecondary: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  btnSecondaryText: { color: "#16a34a", fontSize: 15, fontWeight: "bold" },
  plantListGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  plantCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 1,
  },
  plantImage: {
    width: "100%",
    height: 130,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#f1f5f9",
  },
  plantCardBody: { padding: 12 },
  customName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  goalText: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 8,
    fontStyle: "italic",
  },
  progressLabel: { fontSize: 10, color: "#94a3b8", fontWeight: "600" },
  progressBarContainer: {
    position: "relative",
    height: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    marginVertical: 4,
  },
  progressBarFill: { height: 16, backgroundColor: "#16a34a", borderRadius: 8 },
  progressText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a1a",
    paddingBottom: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  emptyBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
  },
  freeBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    marginTop: 10,
  },
  freeText: {
    marginTop: 16,
    fontSize: 18,
    color: "#64748b",
    fontWeight: "900",
    textAlign: "center",
  },
  freeSubtitle: {
    fontSize: 13,
    color: "#dc2626",
    textAlign: "center",
    marginTop: 4,
    paddingBottom: 20,
  },
  upgradeBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  upgradeBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  errorBox: {
    backgroundColor: "#fef2f2",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#fecaca",
    marginTop: 10,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "bold",
    textAlign: "center",
  },
});
