import React, { useState, useRef } from "react";
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
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Sprout,
  Users,
  Menu,
  X,
  PlayCircle,
  ShoppingCart,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  const features = [
    {
      icon: <ShieldCheck size={28} color="#2563eb" />,
      title: "Chẩn đoán nhanh 2s",
      description:
        "Dùng thử miễn phí 3 lượt nhận diện bệnh trên cây trồng không cần tài khoản.",
      colorBg: "#eff6ff",
      path: "/scan",
    },
    {
      icon: <Sprout size={28} color="#16a34a" />,
      title: "Giải pháp sinh học",
      description:
        "Hướng dẫn cách trị bệnh bằng phương pháp an toàn, không độc hại.",
      colorBg: "#f0fdf4",
      path: "/scan",
    },
    {
      icon: <Users size={28} color="#ea580c" />,
      title: "Hàng ngàn nhà nông",
      description:
        "Đăng nhập để tham gia cộng đồng và lưu trữ lịch sử chăm sóc cây.",
      colorBg: "#fff7ed",
      path: "/auth/login",
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
            onPress={() => router.push("/shop" as any)}
            style={styles.navIconBtn}
          >
            <ShoppingCart size={20} color="#4b5563" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/auth/login" as any)}
            style={styles.navLoginBtn}
          >
            <Text style={styles.navLoginText}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openMenu}
            style={styles.menuBtn}
            activeOpacity={0.8}
          >
            <Menu size={24} color="#374151" />
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
                <Text style={styles.menuTitle}>Danh mục</Text>
                <TouchableOpacity onPress={closeMenu} style={styles.closeBtn}>
                  <X size={26} color="#374151" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.menuLinks}
                showsVerticalScrollIndicator={false}
              >
                <TouchableOpacity style={styles.menuItem} onPress={closeMenu}>
                  <Text style={styles.menuItemText}>Trang chủ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigate("/scan")}
                >
                  <Text style={styles.menuItemText}>Dùng thử AI (Guest)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigate("/shop")}
                >
                  <Text style={styles.menuItemText}>
                    Chợ vật tư nông nghiệp
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigate("/onboarding")}
                >
                  <Text style={styles.menuItemText}>
                    Xem hướng dẫn ứng dụng
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigate("/about")}
                >
                  <Text style={styles.menuItemText}>Về chúng tôi</Text>
                </TouchableOpacity>
              </ScrollView>

              <View
                style={[
                  styles.menuFooter,
                  { paddingBottom: Math.max(insets.bottom, 24) },
                ]}
              >
                <TouchableOpacity
                  style={styles.menuLoginBtn}
                  onPress={() => handleNavigate("/auth/login")}
                >
                  <Text style={styles.menuLoginText}>Đăng nhập / Đăng ký</Text>
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
            <Text style={styles.badgeText}>
              Dùng thử miễn phí không cần Đăng nhập
            </Text>
          </View>
          <Text style={styles.mainTitle}>
            Bác Sĩ <Text style={styles.greenTitle}>Thực Vật</Text>
            {"\n"}Bỏ Túi
          </Text>
          <Text style={styles.description}>
            Hệ thống AI phân tích bệnh trên lá cây với độ chính xác 98%. Tham
            gia cùng hơn 10,000+ nông dân Việt Nam.
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.8}
              onPress={() => router.push("/scan")}
            >
              <Text style={styles.primaryBtnText}>Quét thử ngay</Text>
              <ArrowRight size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.onboardingBtn}
              activeOpacity={0.6}
              onPress={() => router.push("/onboarding")}
            >
              <PlayCircle size={20} color="#16a34a" />
              <Text style={styles.onboardingBtnText}>Xem hướng dẫn</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.publicFeaturesRow}>
            <TouchableOpacity
              style={styles.publicFeatureBtn}
              onPress={() => router.push("/shop" as any)}
            >
              <ShoppingCart size={22} color="#f59e0b" />
              <Text style={styles.publicFeatureText}>
                Khám phá Chợ vật tư nông nghiệp
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Vì sao chọn Agri-Scan?</Text>
          <View style={styles.featuresList}>
            {/* Đưa comment ra ngoài vòng lặp map để tránh lỗi JSX */}
            {features.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureCard}
                activeOpacity={0.7}
                onPress={() => router.push(item.path as any)}
              >
                <View
                  style={[
                    styles.featureIconBox,
                    { backgroundColor: item.colorBg },
                  ]}
                >
                  {item.icon}
                </View>
                <Text style={styles.featureItemTitle}>{item.title}</Text>
                <Text style={styles.featureItemDesc}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
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

  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  navIconBtn: { padding: 8, backgroundColor: "#f3f4f6", borderRadius: 12 },
  navLoginBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#16a34a",
    borderRadius: 12,
  },
  navLoginText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  menuBtn: { padding: 8, backgroundColor: "#f3f4f6", borderRadius: 12 },

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
  menuTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  closeBtn: { padding: 4 },
  menuLinks: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  menuItem: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  menuItemText: { fontSize: 16, color: "#374151", fontWeight: "600" },
  menuFooter: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 20,
  },
  menuLoginBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  menuLoginText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: "flex-start",
  },
  badgeWeb: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef08a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 15,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ca8a04",
    marginRight: 8,
  },
  badgeText: { fontSize: 12, color: "#854d0e", fontWeight: "700" },
  mainTitle: {
    fontSize: 48,
    fontWeight: "900",
    color: "#111827",
    lineHeight: 56,
    letterSpacing: -1,
  },
  greenTitle: { color: "#16a34a" },
  description: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
    marginTop: 15,
    marginBottom: 30,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  onboardingBtn: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#dcfce3",
  },
  onboardingBtnText: { color: "#16a34a", fontWeight: "bold", fontSize: 16 },

  publicFeaturesRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
    width: "100%",
  },
  publicFeatureBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
    elevation: 1,
  },
  publicFeatureText: { fontSize: 14, fontWeight: "700", color: "#374151" },

  featuresSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "#fafaf9",
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 20,
  },
  featuresList: { gap: 16 },
  featureCard: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    elevation: 2,
  },
  featureIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  featureItemTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  featureItemDesc: { fontSize: 14, color: "#4b5563", lineHeight: 22 },
});
