import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Receipt,
  Truck,
} from "lucide-react-native";

export default function BuyDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handlePlaceOrder = () => {
    Alert.alert(
      "Đặt hàng thành công! 🎉",
      "Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.",
      [{ text: "Quay về Cửa hàng", onPress: () => router.replace("/shop") }],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Địa chỉ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
          </View>
          <Text style={styles.customerName}>Trần Văn Nông | 0987.654.321</Text>
          <Text style={styles.addressText}>
            475A Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh
          </Text>
        </View>

        {/* Đơn hàng */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Receipt size={20} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderItem}>Nấm đối kháng Trichoderma (x2)</Text>
            <Text style={styles.orderPrice}>90.000đ</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderItem}>Phân trùn quế cao cấp (x1)</Text>
            <Text style={styles.orderPrice}>80.000đ</Text>
          </View>
        </View>

        {/* Thanh toán & Vận chuyển */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          <View style={styles.methodBox}>
            <Text style={styles.methodText}>
              Thanh toán khi nhận hàng (COD)
            </Text>
          </View>

          <View style={[styles.sectionHeader, { marginTop: 16 }]}>
            <Truck size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Đơn vị vận chuyển</Text>
          </View>
          <View style={styles.methodBox}>
            <Text style={styles.methodText}>Giao hàng nhanh (2-3 ngày)</Text>
          </View>
        </View>
      </ScrollView>

      {/* Nút Đặt hàng */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>Tạm tính:</Text>
          <Text style={styles.calcValue}>170.000đ</Text>
        </View>
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>Phí vận chuyển:</Text>
          <Text style={styles.calcValue}>30.000đ</Text>
        </View>
        <View style={[styles.calcRow, styles.calcTotalRow]}>
          <Text style={styles.calcTotalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.calcTotalPrice}>200.000đ</Text>
        </View>

        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderText}>Tiến hành đặt hàng</Text>
        </TouchableOpacity>
      </View>
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
  scrollContent: { padding: 16, paddingBottom: 200 },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  addressText: { fontSize: 14, color: "#6b7280", lineHeight: 20 },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderItem: { fontSize: 14, color: "#4b5563", flex: 1 },
  orderPrice: { fontSize: 14, fontWeight: "600", color: "#111827" },
  methodBox: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dcfce3",
  },
  methodText: { color: "#16a34a", fontWeight: "600", fontSize: 14 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    elevation: 10,
  },
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  calcLabel: { fontSize: 14, color: "#6b7280" },
  calcValue: { fontSize: 14, color: "#374151", fontWeight: "500" },
  calcTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginBottom: 16,
  },
  calcTotalLabel: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  calcTotalPrice: { fontSize: 22, fontWeight: "900", color: "#ef4444" },
  placeOrderBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  placeOrderText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
