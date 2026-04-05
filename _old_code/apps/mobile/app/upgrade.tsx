import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Check, ArrowLeft, Zap, Star, Crown } from "lucide-react-native";

export default function UpgradeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Thêm thuộc tính themeColor để tùy chỉnh màu độc lập
  const plans = [
    {
      name: "Free",
      price: "0",
      period: "tháng",
      description: "Khám phá sức mạnh của AI",
      features: [
        "Mô hình cơ bản",
        "Giới hạn tin nhắn và tải ảnh",
        "Giới hạn tạo hình ảnh",
        "Bộ nhớ ngắn hạn",
      ],
      buttonText: "Gói hiện tại",
      current: true,
      themeColor: "#6b7280", // Xám
      bgColor: "#f3f4f6",
      icon: <Zap size={24} color="#4b5563" />,
    },
    {
      name: "Plus",
      price: "129.000",
      subtotal: "117.273",
      vat: "11.727",
      period: "tháng",
      description: "Mở khóa trải nghiệm đầy đủ",
      features: [
        "Mô hình AI nâng cao (nhanh & chính xác hơn)",
        "Tăng giới hạn tin nhắn và tải ảnh",
        "Tạo hình ảnh chất lượng cao",
        "Bộ nhớ mở rộng giữa các đoạn chat",
        "Chế độ phân tích sâu",
        "Ưu tiên hỗ trợ",
      ],
      buttonText: "Nâng cấp lên Plus",
      current: false,
      tag: "PHỔ BIẾN",
      themeColor: "#8b5cf6", // Tím
      bgColor: "#f3e8ff",
      icon: <Star size={24} color="#8b5cf6" />,
    },
    {
      name: "Pro",
      price: "499.000",
      subtotal: "453.636",
      vat: "45.364",
      period: "tháng",
      description: "Tối đa hóa năng suất của bạn",
      features: [
        "Tất cả tính năng của Plus và:",
        "Không giới hạn tin nhắn",
        "Mô hình chuyên gia nông nghiệp cao cấp",
        "Phân tích hình ảnh bệnh cây chuyên sâu",
        "Tạo báo cáo chi tiết",
        "API truy cập cho nhà phát triển",
      ],
      buttonText: "Nâng cấp lên Pro",
      current: false,
      tag: "CAO CẤP",
      themeColor: "#eab308", // Vàng VIP
      bgColor: "#fef08a",
      icon: <Crown size={24} color="#ca8a04" />,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Nâng cấp gói dịch vụ</Text>
          <Text style={styles.headerSubtitle}>
            Chọn gói phù hợp với nhu cầu canh tác của bạn
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {plans.map((plan) => (
          <View
            key={plan.name}
            style={[
              styles.card,
              !plan.current && { borderColor: plan.themeColor, borderWidth: 2 },
              !plan.current && {
                shadowColor: plan.themeColor,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
              },
            ]}
          >
            {/* Badge */}
            {plan.tag && (
              <View
                style={[styles.badge, { backgroundColor: plan.themeColor }]}
              >
                <Text style={styles.badgeText}>{plan.tag}</Text>
              </View>
            )}

            {/* Icon */}
            <View style={[styles.iconBox, { backgroundColor: plan.bgColor }]}>
              {plan.icon}
            </View>

            {/* Thông tin gói */}
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDesc}>{plan.description}</Text>

            {/* Giá tiền */}
            <View style={styles.priceRow}>
              <Text style={styles.currency}>₫</Text>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.period}>/ {plan.period}</Text>
            </View>

            {/* Nút bấm */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={plan.current}
              onPress={() => {
                if (!plan.current) {
                  const planDataToPass = {
                    name: plan.name,
                    price: plan.price,
                    subtotal: plan.subtotal,
                    vat: plan.vat,
                    features: plan.features.filter(
                      (f) => !f.startsWith("Tất cả tính năng"),
                    ),
                  };
                  router.push({
                    pathname: "/payment",
                    params: { plan: JSON.stringify(planDataToPass) },
                  });
                }
              }}
              style={[
                styles.actionBtn,
                plan.current
                  ? styles.btnCurrent
                  : { backgroundColor: plan.themeColor },
              ]}
            >
              <Text
                style={
                  plan.current ? styles.btnTextCurrent : styles.btnTextHighlight
                }
              >
                {plan.buttonText}
              </Text>
            </TouchableOpacity>

            {/* Tính năng */}
            <View style={styles.featuresContainer}>
              {plan.name === "Pro" && (
                <Text style={styles.proFeatureTitle}>
                  Bao gồm mọi thứ của Plus và:
                </Text>
              )}
              {plan.features.map((feature, i) => {
                if (feature.startsWith("Tất cả tính năng")) return null;
                return (
                  <View key={i} style={styles.featureRow}>
                    <View style={styles.checkIcon}>
                      <Check
                        size={18}
                        strokeWidth={3}
                        color={!plan.current ? plan.themeColor : "#9ca3af"}
                      />
                    </View>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bạn cần gói doanh nghiệp tùy chỉnh?{" "}
          </Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Liên hệ với chúng tôi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#f9fafb",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTextContainer: {},
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  headerSubtitle: { fontSize: 15, color: "#6b7280", marginTop: 4 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomLeftRadius: 16,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  planDesc: { fontSize: 14, color: "#6b7280", marginBottom: 24, minHeight: 40 },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 24 },
  currency: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 4,
  },
  price: { fontSize: 40, fontWeight: "900", color: "#111827" },
  period: { fontSize: 16, color: "#6b7280", marginLeft: 8 },
  actionBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  btnCurrent: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  btnTextCurrent: { color: "#9ca3af", fontWeight: "bold", fontSize: 16 },
  btnTextHighlight: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  featuresContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 24,
  },
  proFeatureTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  checkIcon: { marginTop: 2, marginRight: 12 },
  featureText: { flex: 1, fontSize: 15, color: "#4b5563", lineHeight: 22 },
  footer: { alignItems: "center", marginTop: 10 },
  footerText: { color: "#6b7280", fontSize: 14 },
  footerLink: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
});
