import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Truck,
  CreditCard,
} from "lucide-react-native";

import { orderApi } from "@agri-scan/shared";

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Đón dữ liệu từ trang Detail truyền sang
  const { productId, sellerId, name, price, image } = useLocalSearchParams();

  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productPrice = Number(price) || 0;
  const shippingFee = 30000; // Phí ship giả định
  const totalAmount = productPrice * quantity + shippingFee;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Tìm hàm này trong file checkout.tsx của bạn
  const handleCreateOrder = async () => {
    if (!address.trim())
      return Alert.alert("Lỗi", "Vui lòng nhập địa chỉ nhận hàng!");
    if (!phone.trim())
      return Alert.alert("Lỗi", "Vui lòng nhập số điện thoại liên hệ!");

    try {
      setIsSubmitting(true);

      // GỌI API ĐẶT HÀNG LƯU XUỐNG DB
      const result = await orderApi.createOrder({
        sellerId: sellerId as string,
        items: [
          {
            productId: productId as string,
            quantity: quantity,
          },
        ],
        shippingAddress: address,
        phoneNumber: phone,
        paymentMethod: "COD",
      });

      // THÀNH CÔNG THÌ ĐÁ SANG TRANG SUCCESS
      // (Mình gởi kèm cái ID đơn hàng thực tế lấy từ Backend luôn)
      router.replace({
        pathname: "/success-order",
        params: { orderId: result._id?.slice(-6).toUpperCase() }, // Lấy 6 ký tự cuối làm mã đơn ảo
      } as any);
    } catch (error: any) {
      Alert.alert(
        "Lỗi đặt hàng",
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận Đơn Hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* THÔNG TIN NHẬN HÀNG */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>

          <View style={styles.inputGroup}>
            <View style={styles.iconWrapper}>
              <MapPin size={20} color="#64748b" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ giao hàng cụ thể..."
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.iconWrapper}>
              <Phone size={20} color="#64748b" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại liên hệ..."
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        {/* THÔNG TIN SẢN PHẨM */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm đã chọn</Text>
          <View style={styles.productRow}>
            <Image
              source={{ uri: (image as string) || "https://placehold.co/100" }}
              style={styles.productImg}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {name}
              </Text>
              <Text style={styles.productPrice}>
                {formatCurrency(productPrice)}
              </Text>
            </View>
          </View>

          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Số lượng mua:</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* PHƯƠNG THỨC THANH TOÁN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.paymentMethodBox}>
            <CreditCard size={24} color="#16a34a" />
            <Text style={styles.paymentMethodText}>
              Thanh toán khi nhận hàng (COD)
            </Text>
          </View>
        </View>

        {/* CHI TIẾT THANH TOÁN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tiền hàng</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(productPrice * quantity)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(shippingFee)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>Tổng thanh toán</Text>
            <Text style={styles.summaryTotalValue}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* THANH BOTTOM ĐẶT HÀNG */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.bottomTotalLabel}>Tổng cộng</Text>
          <Text style={styles.bottomTotalValue}>
            {formatCurrency(totalAmount)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleCreateOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Đặt Hàng</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
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
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },

  section: { backgroundColor: "#fff", padding: 16, marginTop: 10 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 16,
  },

  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 50,
  },
  iconWrapper: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#334155",
    outlineStyle: "none" as any,
  },

  productRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  productImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  productInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  productPrice: { fontSize: 16, fontWeight: "bold", color: "#ef4444" },

  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  quantityLabel: { fontSize: 15, color: "#475569", fontWeight: "500" },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  qtyBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnText: { fontSize: 18, fontWeight: "bold", color: "#64748b" },
  qtyValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    width: 40,
    textAlign: "center",
  },

  paymentMethodBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  paymentMethodText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "bold",
    color: "#16a34a",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: { fontSize: 14, color: "#64748b" },
  summaryValue: { fontSize: 14, fontWeight: "600", color: "#334155" },
  summaryTotalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    marginTop: 4,
  },
  summaryTotalLabel: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  summaryTotalValue: { fontSize: 18, fontWeight: "900", color: "#ef4444" },

  bottomBar: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    alignItems: "center",
  },
  bottomTotalLabel: { fontSize: 13, color: "#64748b" },
  bottomTotalValue: { fontSize: 20, fontWeight: "900", color: "#ef4444" },
  submitBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
