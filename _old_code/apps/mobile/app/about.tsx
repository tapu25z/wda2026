import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Leaf,
  Mail,
  Globe,
  Shield,
  FileText,
  ChevronRight,
  Info,
} from "lucide-react-native";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const supportLinks = [
    {
      id: "website",
      title: "Trang web chính thức",
      icon: <Globe size={22} color="#059669" />,
      action: () => Linking.openURL("https://agriscan.ai"),
    },
    {
      id: "email",
      title: "Liên hệ hỗ trợ",
      icon: <Mail size={22} color="#059669" />,
      action: () => Linking.openURL("mailto:support@agriscan.ai"),
    },
  ];

  const legalLinks = [
    {
      id: "terms",
      title: "Điều khoản sử dụng",
      icon: <FileText size={22} color="#6b7280" />,
      action: () => console.log("Mở trang điều khoản"),
    },
    {
      id: "privacy",
      title: "Chính sách bảo mật",
      icon: <Shield size={22} color="#6b7280" />,
      action: () => console.log("Mở trang bảo mật"),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header - Đã loại bỏ spacer thừa gây lỗi text */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Về chúng tôi</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        <View style={styles.brandingSection}>
          <View style={styles.logoContainer}>
            <Leaf size={48} color="#fff" />
          </View>
          <Text style={styles.appName}>Agri-Scan AI</Text>
          <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Info size={20} color="#16a34a" />
            <Text style={styles.cardTitle}>Giới thiệu</Text>
          </View>
          <Text style={styles.description}>
            Agri-Scan AI là trợ lý nông nghiệp thông minh, ứng dụng công nghệ
            Trí Tuệ Nhân Tạo (AI) tiên tiến nhất để giúp nhà nông chẩn đoán bệnh
            cây trồng qua hình ảnh nhanh chóng và chính xác.
          </Text>
          <Text style={[styles.description, { marginTop: 12 }]}>
            Sứ mệnh của chúng tôi là bảo vệ mùa màng, tối ưu hóa năng suất và
            hướng tới một nền nông nghiệp xanh, bền vững.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Hỗ trợ & Liên hệ</Text>
        <View style={styles.linkGroup}>
          {supportLinks.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.linkItem,
                index < supportLinks.length - 1 && styles.borderBottom,
              ]}
              onPress={item.action}
            >
              <View style={styles.linkLeft}>
                <View style={styles.iconWrapperGreen}>{item.icon}</View>
                <Text style={styles.linkText}>{item.title}</Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Pháp lý</Text>
        <View style={styles.linkGroup}>
          {legalLinks.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.linkItem,
                index < legalLinks.length - 1 && styles.borderBottom,
              ]}
              onPress={item.action}
            >
              <View style={styles.linkLeft}>
                <View style={styles.iconWrapperGray}>{item.icon}</View>
                <Text style={styles.linkText}>{item.title}</Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Phát triển bởi đội ngũ Agri-Scan.
          </Text>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Agri-Scan AI. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

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
    borderBottomColor: "#f3f4f6",
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  headerRightPlaceholder: { width: 40 },
  scrollContent: { padding: 20 },
  brandingSection: { alignItems: "center", marginTop: 10, marginBottom: 30 },
  logoContainer: {
    width: 90,
    height: 90,
    backgroundColor: "#16a34a",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 10,
    transform: [{ rotate: "-5deg" }],
  },
  appName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
  },
  appVersion: { fontSize: 14, color: "#6b7280", fontWeight: "500" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 8,
  },
  description: { fontSize: 15, color: "#4b5563", lineHeight: 24 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
  },
  linkGroup: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    overflow: "hidden",
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  linkLeft: { flexDirection: "row", alignItems: "center" },
  iconWrapperGreen: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#dcfce3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconWrapperGray: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  linkText: { fontSize: 16, fontWeight: "500", color: "#374151" },
  footer: { alignItems: "center", marginTop: 10 },
  footerText: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
});
