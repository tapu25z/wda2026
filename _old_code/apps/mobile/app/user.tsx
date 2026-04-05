import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Modal,
  StatusBar,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Sprout,
  X,
  User as UserIcon,
  Settings,
  LogOut,
  Bell,
  CloudSun,
  BookOpen,
  ShoppingCart,
  Store,
  ShieldAlert,
  MessageSquare,
  Library,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function UserHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState<{
    fullName?: string;
    email?: string;
    plan?: string;
    role?: string;
  } | null>(null);

  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let userStr = null;
        if (Platform.OS === "web") {
          userStr = localStorage.getItem("user");
        } else {
          userStr = await SecureStore.getItemAsync("user");
        }
        if (userStr) setUserData(JSON.parse(userStr));
      } catch (error) {
        console.error("Lỗi khi load thông tin User:", error);
      }
    };
    fetchUserData();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const openMenu = () => {
    setIsMenuOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setIsMenuOpen(false));
  };

  const handleNavigate = (path: string) => {
    closeMenu();
    setTimeout(() => {
      router.push(path as any);
    }, 300);
  };

  const handleLogout = async () => {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      } else {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await SecureStore.deleteItemAsync("user");
      }
      closeMenu();
      setTimeout(() => {
        router.replace("/auth/login" as any);
      }, 300);
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  const currentPlanStr = userData?.plan || "FREE";
  const planColor =
    currentPlanStr === "VIP" || currentPlanStr === "PRO"
      ? "#eab308"
      : currentPlanStr === "PLUS" || currentPlanStr === "PREMIUM"
        ? "#8b5cf6"
        : "#d1d5db";

  const features = [
    {
      icon: <ShieldCheck size={28} color="#2563eb" />,
      title: "AI Diagnosis",
      description:
        "Nhận diện bệnh cây qua ảnh chụp tức thời với độ chính xác cao.",
      colorBg: "#eff6ff",
      route: "/scan",
    },
    {
      icon: <Library size={28} color="#0ea5e9" />,
      title: "Từ điển cây",
      description:
        "Tra cứu thông tin chi tiết về các loại bệnh và cách phòng trừ.",
      colorBg: "#e0f2fe",
      route: "/treeDic", // 🔥 ĐÃ SỬA: Khớp với tên file treeDic.tsx
    },
    {
      icon: <CloudSun size={28} color="#06b6d4" />,
      title: "Agri-Weather",
      description:
        "Dự báo thời tiết chuyên sâu và khuyến nghị chăm sóc theo ngày.",
      colorBg: "#ecfeff",
      route: "/weather",
    },
    {
      icon: <ShoppingCart size={28} color="#f59e0b" />,
      title: "Agri-Shop",
      description:
        "Chợ vật tư nông nghiệp, phân bón và thuốc sinh học chính hãng.",
      colorBg: "#fef3c7",
      route: "/shop",
    },
    {
      icon: <Store size={28} color="#db2777" />,
      title: "Gian hàng của tôi",
      description: "Đăng bán nông sản, vật tư và quản lý đơn khách đặt.",
      colorBg: "#fce7f3",
      route: "/my-shop",
    },
    {
      icon: <Sprout size={28} color="#8b5cf6" />,
      title: "My Garden",
      description: "Quản lý danh sách cây trồng và theo dõi lịch chăm sóc.",
      colorBg: "#f3e8ff",
      route: "/my-garden",
    },
    {
      icon: <BookOpen size={28} color="#10b981" />,
      title: "Farming Tips",
      description:
        "Cẩm nang kiến thức, bí quyết bón phân và chăm sóc cây trồng.",
      colorBg: "#ecfdf5",
      route: "/tips",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <View
        style={[styles.navbar, { paddingTop: Math.max(insets.top, 10) + 10 }]}
      >
        <View style={styles.logoWrapper}>
          <View style={styles.logoIconBox}>
            <Leaf size={18} color="#fff" />
          </View>
          <Text style={styles.logoTitle}>Agri-Scan</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => router.push("/notification" as any)}
            style={styles.bellBtn}
          >
            <Bell size={24} color="#374151" />
            <View style={styles.bellDot} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openMenu}
            style={styles.avatarBtnNavbar}
            activeOpacity={0.8}
          >
            <View style={[styles.avatarRingSmall, { borderColor: planColor }]}>
              <View style={styles.avatarCircleSmall}>
                <Text style={styles.avatarTextSmall}>
                  {getInitials(userData?.fullName)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={isMenuOpen} transparent={true} animationType="none">
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={closeMenu}
            />
          </Animated.View>

          <Animated.View
            style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
          >
            <View
              style={[
                styles.menuContent,
                {
                  paddingTop:
                    Platform.OS === "android"
                      ? StatusBar.currentHeight
                      : Math.max(insets.top, 20),
                },
              ]}
            >
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Tài khoản</Text>
                <TouchableOpacity onPress={closeMenu} style={styles.closeBtn}>
                  <X size={26} color="#374151" />
                </TouchableOpacity>
              </View>

              <View style={styles.userInfoSection}>
                <View
                  style={[styles.avatarRingLarge, { borderColor: planColor }]}
                >
                  <View style={styles.avatarCircleLarge}>
                    <Text style={styles.avatarTextLarge}>
                      {getInitials(userData?.fullName)}
                    </Text>
                  </View>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {userData?.fullName || "Người Dùng"}
                  </Text>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {userData?.email || "Đang tải email..."}
                  </Text>
                </View>
              </View>

              <ScrollView
                style={styles.menuLinks}
                showsVerticalScrollIndicator={false}
              >
                {userData?.role === "ADMIN" && (
                  <TouchableOpacity
                    style={styles.adminMenuItem}
                    onPress={() => handleNavigate("/admin")}
                  >
                    <ShieldAlert size={20} color="#dc2626" />
                    <Text style={styles.adminMenuText}>Quản trị Hệ thống</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.menuItem} onPress={closeMenu}>
                  <Text style={styles.menuItemText}>Trang chủ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigate("/scan")}
                >
                  <Text style={styles.menuItemText}>Chẩn đoán AI</Text>
                </TouchableOpacity>

                {/* 🔥 ĐÃ SỬA: Trỏ về /treeDic */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigate("/treeDic")}
                >
                  <Text style={styles.menuItemText}>Từ điển cây</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigate("/shop")}
                >
                  <Text style={styles.menuItemText}>Cửa hàng vật tư (Mua)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigate("/my-shop")}
                >
                  <Text style={[styles.menuItemText, { color: "#db2777" }]}>
                    Gian hàng của tôi (Bán)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigate("/my-garden")}
                >
                  <Text style={styles.menuItemText}>Vườn của tôi</Text>
                </TouchableOpacity>

                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.menuItemWithIcon}
                  onPress={() => handleNavigate("/feedback")}
                >
                  <MessageSquare size={20} color="#4b5563" />
                  <Text style={styles.menuItemTextIcon}>
                    Gửi phản hồi & Hỗ trợ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItemWithIcon}
                  onPress={() => handleNavigate("/profile")}
                >
                  <UserIcon size={20} color="#4b5563" />
                  <Text style={styles.menuItemTextIcon}>Hồ sơ của tôi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItemWithIcon}
                  onPress={() => handleNavigate("/setting")}
                >
                  <Settings size={20} color="#4b5563" />
                  <Text style={styles.menuItemTextIcon}>Cài đặt</Text>
                </TouchableOpacity>
              </ScrollView>

              <View
                style={[
                  styles.menuFooter,
                  { paddingBottom: insets.bottom || 24 },
                ]}
              >
                <TouchableOpacity
                  style={styles.menuLogoutBtn}
                  onPress={handleLogout}
                >
                  <LogOut size={20} color="#ef4444" />
                  <Text style={styles.menuLogoutText}>Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <View style={styles.badgeWeb}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>AI Innovation Contest 2026</Text>
          </View>
          <Text style={styles.mainTitle}>
            Bác Sĩ{"\n"}
            <Text style={styles.greenTitle}>Cây Trồng{"\n"}</Text>Thông Minh
          </Text>
          <Text style={styles.description}>
            Chẩn đoán bệnh cây trồng tức thì bằng AI. Nhận phác đồ điều trị khoa
            học và lộ trình chăm sóc bền vững.
          </Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.8}
              onPress={() => router.push("/scan" as any)}
            >
              <Text style={styles.primaryBtnText}>Chẩn đoán ngay</Text>
              <ArrowRight size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.featuresHeader}>
            <Text style={styles.featuresEyebrow}>HỆ SINH THÁI TÍNH NĂNG</Text>
            <Text style={styles.featuresTitle}>
              Công nghệ tiên phong{"\n"}cho nông nghiệp bền vững
            </Text>
          </View>
          <View style={styles.featuresList}>
            {features.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureCard}
                activeOpacity={0.7}
                onPress={() => router.push(item.route as any)}
              >
                <View
                  style={[
                    styles.featureIconBox,
                    { backgroundColor: item.colorBg },
                  ]}
                >
                  {item.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureItemTitle}>{item.title}</Text>
                  <Text style={styles.featureItemDesc}>{item.description}</Text>
                </View>
                <ArrowRight size={20} color="#d1d5db" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Agri-Scan AI. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafaf9" },
  scrollContent: { paddingBottom: 100 },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#fafaf9",
  },
  logoWrapper: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoIconBox: { backgroundColor: "#2e7d32", padding: 6, borderRadius: 8 },
  logoTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  bellBtn: { position: "relative", padding: 4 },
  bellDot: {
    position: "absolute",
    top: 4,
    right: 6,
    width: 10,
    height: 10,
    backgroundColor: "#ef4444",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#fafaf9",
  },
  avatarBtnNavbar: { padding: 4 },
  avatarRingSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  avatarCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTextSmall: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  modalContainer: { flex: 1, flexDirection: "row" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  menuContent: { flex: 1 },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  closeBtn: { padding: 4 },
  userInfoSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#fafaf9",
  },
  avatarRingLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginRight: 12,
  },
  avatarCircleLarge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTextLarge: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  userDetails: { flex: 1, paddingRight: 10 },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  userEmail: { fontSize: 13, color: "#6b7280", marginBottom: 4 },
  menuLinks: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
  adminMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  adminMenuText: { fontSize: 15, color: "#dc2626", fontWeight: "bold" },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  menuItemText: { fontSize: 16, color: "#374151", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 10 },
  menuItemWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  menuItemTextIcon: { fontSize: 16, color: "#4b5563", fontWeight: "500" },
  menuFooter: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 20,
  },
  menuLogoutBtn: {
    flexDirection: "row",
    backgroundColor: "#fef2f2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  menuLogoutText: { color: "#ef4444", fontSize: 15, fontWeight: "bold" },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: "flex-start",
  },
  badgeWeb: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dcfce3",
    marginBottom: 15,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16a34a",
    marginRight: 8,
  },
  badgeText: { fontSize: 12, color: "#16a34a", fontWeight: "600" },
  mainTitle: {
    fontSize: 42,
    fontWeight: "900",
    color: "#111827",
    lineHeight: 48,
    letterSpacing: -1,
  },
  greenTitle: { color: "#16a34a" },
  description: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
    marginTop: 15,
    marginBottom: 25,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 30,
  },
  primaryBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 2,
  },
  primaryBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  featuresSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: "#fafaf9",
  },
  featuresHeader: { alignItems: "center", marginBottom: 30 },
  featuresEyebrow: {
    color: "#16a34a",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 12,
  },
  featuresList: { gap: 16 },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  featureItemDesc: { fontSize: 13, color: "#6b7280", lineHeight: 20 },
  footer: { paddingVertical: 20, alignItems: "center" },
  footerText: { fontSize: 12, color: "#9ca3af" },
});
