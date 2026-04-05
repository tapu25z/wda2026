import React, { useState, useEffect } from "react";
import { authApi, scanApi } from "@agri-scan/shared";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  ArrowLeft,
  LogOut,
  Leaf,
  Activity,
  Settings,
  Crown,
  Zap,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState<{
    fullName?: string;
    name?: string;
    email?: string;
    plan?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    scanCount: 0,
    chatCount: 0,
    diseaseCount: 0,
  });

  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let userStr = null;
        if (Platform.OS === "web") {
          userStr = localStorage.getItem("user");
        } else {
          userStr = await SecureStore.getItemAsync("user");
        }
        if (userStr) {
          setUserData(JSON.parse(userStr));
        }

        let scans: any[] = [];
        let chats: any[] = [];
        try {
          scans = await scanApi.getScanHistory();
        } catch (e) {}
        try {
          chats = await scanApi.getChatHistory();
        } catch (e) {}

        const uniqueDiseases = new Set();

        const scanActivities = (scans || []).map((item: any) => {
          const diseaseName = item.aiPredictions?.[0]?.diseaseId?.name;
          if (diseaseName && diseaseName !== "Cây khỏe mạnh") {
            uniqueDiseases.add(diseaseName);
          }
          const confidence = item.aiPredictions?.[0]?.confidence || 0;
          return {
            id: `scan_${item._id || item.id}`,
            type: "scan",
            title: `Chẩn đoán: ${diseaseName || "Không xác định"}`,
            desc: new Date(item.scannedAt || item.createdAt).toLocaleDateString(
              "vi-VN",
            ),
            date: new Date(item.scannedAt || item.createdAt),
            status: confidence >= 0.8 ? "Nguy cơ cao" : "Cần theo dõi",
            isHighRisk: confidence >= 0.8,
          };
        });

        const chatActivities = (chats || []).map((item: any) => ({
          id: `chat_${item.sessionId}`,
          type: "chat",
          title: item.title || "Trò chuyện với AI",
          desc: new Date(item.updatedAt).toLocaleDateString("vi-VN"),
          date: new Date(item.updatedAt),
        }));

        const mergedActivities = [...scanActivities, ...chatActivities].sort(
          (a, b) => b.date.getTime() - a.date.getTime(),
        );

        setStats({
          scanCount: (scans || []).length,
          chatCount: (chats || []).length,
          diseaseCount: uniqueDiseases.size,
        });

        setAllActivities(mergedActivities);
      } catch (error) {
        console.error("Lỗi khi load Profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await authApi.logout(); 
      if (Platform.OS === "web") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      } else {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await SecureStore.deleteItemAsync("user");
      }
      router.replace("/auth/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  const displayName = userData?.fullName || userData?.name || "Người Dùng";

  const currentPlanStr = userData?.plan || "FREE";
  const PLAN_CONFIG: Record<string, any> = {
    FREE: {
      name: "Gói Free",
      color: "#9ca3af",
      bg: "#f3f4f6",
      border: "#e5e7eb",
      icon: <Zap size={20} color="#4b5563" />,
      desc: "Trải nghiệm cơ bản",
    },
    PLUS: {
      name: "Gói Plus",
      color: "#8b5cf6",
      bg: "#f3e8ff",
      border: "#d8b4fe",
      icon: <Star size={20} color="#8b5cf6" />,
      desc: "Mở khóa sức mạnh AI",
    },
    PREMIUM: {
      name: "Gói Plus",
      color: "#8b5cf6",
      bg: "#f3e8ff",
      border: "#d8b4fe",
      icon: <Star size={20} color="#8b5cf6" />,
      desc: "Mở khóa sức mạnh AI",
    },
    PRO: {
      name: "Gói VIP (Pro)",
      color: "#eab308",
      bg: "#fef08a",
      border: "#fde047",
      icon: <Crown size={20} color="#ca8a04" />,
      desc: "Không giới hạn tính năng",
    },
    VIP: {
      name: "Gói VIP (Pro)",
      color: "#eab308",
      bg: "#fef08a",
      border: "#fde047",
      icon: <Crown size={20} color="#ca8a04" />,
      desc: "Không giới hạn tính năng",
    },
  };
  const activePlan = PLAN_CONFIG[currentPlanStr] || PLAN_CONFIG.FREE;

  const STATS = [
    { id: 1, label: "Ảnh đã quét", value: String(stats.scanCount) },
    { id: 2, label: "Đoạn chat AI", value: String(stats.chatCount) },
    { id: 3, label: "Bệnh phát hiện", value: String(stats.diseaseCount) },
  ];

  const displayedActivities = showAllActivities
    ? allActivities
    : allActivities.slice(0, 3);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={[styles.headerNav, { top: Math.max(insets.top, 20) }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.coverBg, { paddingTop: insets.top }]} />

        <View style={styles.contentContainer}>
          <View style={styles.userCard}>
            <View style={styles.profileHeader}>
              {/* 🔥 AVATAR RING ĐỘNG THEO GÓI */}
              <View style={styles.avatarWrapper}>
                <View
                  style={[styles.avatarRing, { borderColor: activePlan.color }]}
                >
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {getInitials(displayName)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.settingsBadge}>
                  <Settings size={12} color="#4b5563" />
                </TouchableOpacity>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {userData?.email || "Đang tải email..."}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut size={18} color="#ef4444" />
              <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.planCard,
              {
                backgroundColor: activePlan.bg,
                borderColor: activePlan.border,
              },
            ]}
          >
            <View style={styles.planInfo}>
              <View style={styles.planTitleRow}>
                {activePlan.icon}
                <Text
                  style={[styles.planNameText, { color: activePlan.color }]}
                >
                  {activePlan.name}
                </Text>
              </View>
              <Text style={styles.planDescText}>{activePlan.desc}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.upgradeActionBtn,
                { backgroundColor: activePlan.color },
              ]}
              onPress={() => router.push("/upgrade")}
              activeOpacity={0.8}
            >
              <Text style={styles.upgradeActionText}>Nâng cấp</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Activity size={18} color="#16a34a" />
              <Text style={styles.cardTitle}>Thống kê tương tác</Text>
            </View>

            <View style={styles.statsRow}>
              {STATS.map((stat, index) => (
                <View key={stat.id} style={styles.statItem}>
                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#16a34a"
                      style={{ marginBottom: 4 }}
                    />
                  ) : (
                    <Text style={styles.statValue}>{stat.value}</Text>
                  )}
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  {index < STATS.length - 1 && (
                    <View style={styles.statDivider} />
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Lịch sử hoạt động</Text>
            </View>

            <View style={styles.activityList}>
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#16a34a"
                  style={{ marginVertical: 20 }}
                />
              ) : allActivities.length === 0 ? (
                <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
              ) : (
                displayedActivities.map((activity, index) => (
                  <View
                    key={activity.id}
                    style={[
                      styles.activityItem,
                      index === displayedActivities.length - 1 && {
                        borderBottomWidth: 0,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.activityIconBox,
                        activity.type === "chat"
                          ? { backgroundColor: "#e0e7ff" }
                          : { backgroundColor: "#dcfce3" },
                      ]}
                    >
                      {activity.type === "chat" ? (
                        <MessageSquare size={20} color="#4f46e5" />
                      ) : (
                        <Leaf size={20} color="#16a34a" />
                      )}
                    </View>

                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityDesc}>{activity.desc}</Text>

                      {activity.type === "scan" && (
                        <View
                          style={[
                            styles.statusBadge,
                            activity.isHighRisk
                              ? styles.statusHighRiskBg
                              : styles.statusNormalBg,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              activity.isHighRisk
                                ? styles.statusHighRiskText
                                : styles.statusNormalText,
                            ]}
                          >
                            {activity.status}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>

            {allActivities.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => setShowAllActivities(!showAllActivities)}
              >
                <Text style={styles.viewAllText}>
                  {showAllActivities
                    ? "Thu gọn danh sách"
                    : `Xem tất cả (${allActivities.length})`}
                </Text>
                {showAllActivities ? (
                  <ChevronUp size={16} color="#059669" />
                ) : (
                  <ChevronDown size={16} color="#059669" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  headerNav: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  coverBg: { backgroundColor: "#16a34a", height: 180, width: "100%" },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    marginTop: -40,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  profileHeader: { flexDirection: "row", alignItems: "center" },
  avatarWrapper: { position: "relative" },
  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  settingsBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 2,
  },

  userInfo: { marginLeft: 16, flex: 1 },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  userEmail: { fontSize: 14, color: "#6b7280" },

  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 16 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 6,
  },
  logoutText: { color: "#ef4444", fontSize: 15, fontWeight: "600" },

  planCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  planInfo: { flex: 1, paddingRight: 10 },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  planNameText: { fontSize: 16, fontWeight: "bold" },
  planDescText: { fontSize: 13, color: "#4b5563" },
  upgradeActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  upgradeActionText: { color: "#fff", fontSize: 14, fontWeight: "bold" },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
  },
  statItem: { flex: 1, alignItems: "center", position: "relative" },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, color: "#6b7280", textAlign: "center" },
  statDivider: {
    position: "absolute",
    right: 0,
    top: "10%",
    bottom: "10%",
    width: 1,
    backgroundColor: "#e5e7eb",
  },

  activityList: { marginTop: 4 },
  activityItem: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  activityIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  activityInfo: { flex: 1 },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  activityDesc: { fontSize: 13, color: "#6b7280", marginBottom: 6 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  statusHighRiskBg: { backgroundColor: "#fee2e2" },
  statusHighRiskText: { color: "#ef4444" },
  statusNormalBg: { backgroundColor: "#fef9c3" },
  statusNormalText: { color: "#ca8a04" },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    fontStyle: "italic",
    paddingVertical: 10,
  },

  viewAllBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 12,
    gap: 6,
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
  },
  viewAllText: { color: "#059669", fontSize: 14, fontWeight: "600" },
});
