import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CheckCircle, ShoppingBag, FileText } from "lucide-react-native";

export default function SuccessOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams(); // Nhận mã đơn hàng giả để hiển thị

  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Hiệu ứng "pop" cái icon check xanh lá lúc load trang
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <View style={styles.content}>
        {/* Animated Check Icon */}
        <Animated.View
          style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}
        >
          <CheckCircle size={80} color="#16a34a" />
        </Animated.View>

        <Text style={styles.title}>Thanh toán thành công!</Text>
        <Text style={styles.subtitle}>
          Đơn hàng của bạn đã được ghi nhận. Gian hàng sẽ sớm chuẩn bị và giao
          hàng đến bạn.
        </Text>

        <View style={styles.orderInfoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã đơn hàng</Text>
            <Text style={styles.infoValue}>
              #{orderId || Math.floor(Math.random() * 1000000)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phương thức</Text>
            <Text style={styles.infoValue}>Thanh toán khi nhận hàng (COD)</Text>
          </View>
        </View>
      </View>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}
      >
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace("/my-orders" as any)} // Chuyển sang xem lịch sử mua
        >
          <FileText size={20} color="#fff" />
          <Text style={styles.primaryBtnText}>Xem Đơn Hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/shop" as any)} // Quay lại chợ mua tiếp
        >
          <ShoppingBag size={20} color="#16a34a" />
          <Text style={styles.secondaryBtnText}>Tiếp tục mua sắm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconWrapper: {
    marginBottom: 24,
    backgroundColor: "#dcfce3",
    padding: 24,
    borderRadius: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  orderInfoBox: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: { fontSize: 14, color: "#6b7280" },
  infoValue: { fontSize: 14, fontWeight: "bold", color: "#1f2937" },
  footer: { paddingHorizontal: 24, gap: 12 },
  primaryBtn: {
    backgroundColor: "#16a34a",
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  secondaryBtn: {
    backgroundColor: "#f0fdf4",
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#dcfce3",
  },
  secondaryBtnText: { color: "#16a34a", fontSize: 16, fontWeight: "bold" },
});
