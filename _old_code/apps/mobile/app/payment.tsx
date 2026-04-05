import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Zap,
  Shield,
  Globe,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Nhận data gói từ trang trước truyền qua (nếu không có thì dùng mặc định)
  const defaultPlan = {
    name: "Plus",
    price: "129,000",
    subtotal: "117,273",
    vat: "11,727",
    features: [
      "Mô hình AI nâng cao",
      "Tăng giới hạn tin nhắn & tải ảnh",
      "Tạo hình ảnh chất lượng cao",
      "Bộ nhớ mở rộng",
    ],
  };

  const handleCheckout = async () => {
    if (!cardNumber || !expiry || !cvc || !name) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin thẻ.");
      return;
    }
    // Gọi API nâng cấp plan khi có endpoint
    // await axiosClient.post('/users/upgrade', { plan: plan.name });
    Alert.alert("Thành công", `Bạn đã đăng ký gói ${plan.name} thành công!`, [
      { text: "OK", onPress: () => router.replace("/user") }
    ]);
  };

  const plan = params.plan ? JSON.parse(params.plan as string) : defaultPlan;

  // States form
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#4b5563" />
          <Text style={styles.backText}>Quay lại chọn gói</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            }}
          >
            <Text style={styles.pageTitle}>Thông tin thanh toán</Text>

            {/* Phương thức thanh toán */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                <View style={styles.cardIconsRow}>
                  <View
                    style={[styles.cardBadge, { backgroundColor: "#2563eb" }]}
                  >
                    <Text style={styles.cardBadgeText}>VISA</Text>
                  </View>
                  <View
                    style={[styles.cardBadge, { backgroundColor: "#ef4444" }]}
                  >
                    <Text style={styles.cardBadgeText}>MC</Text>
                  </View>
                  <View
                    style={[styles.cardBadge, { backgroundColor: "#60a5fa" }]}
                  >
                    <Text style={styles.cardBadgeText}>AMEX</Text>
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Số thẻ</Text>
                <View style={styles.inputContainer}>
                  <CreditCard
                    size={20}
                    color="#9ca3af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.label}>Ngày hết hạn</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="MM / YY"
                      placeholderTextColor="#9ca3af"
                      value={expiry}
                      onChangeText={setExpiry}
                    />
                  </View>
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Mã bảo mật (CVC)</Text>
                  <View style={styles.inputContainer}>
                    <Lock size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      placeholderTextColor="#9ca3af"
                      keyboardType="number-pad"
                      secureTextEntry
                      value={cvc}
                      onChangeText={setCvc}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Địa chỉ thanh toán */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Địa chỉ thanh toán</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Họ và tên</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#9ca3af"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Quốc gia / Khu vực</Text>
                <View style={styles.inputContainer}>
                  <Globe size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Việt Nam"
                    placeholderTextColor="#9ca3af"
                  // Để đơn giản trên mobile, dùng TextInput. Nếu cần chuẩn, bạn có thể cài library react-native-picker/picker
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Địa chỉ</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Số nhà, tên đường..."
                    placeholderTextColor="#9ca3af"
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </View>
            </View>

            {/* Đơn hàng (Summary) */}
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Gói {plan.name}</Text>

              <Text style={styles.featureTitle}>Tính năng nổi bật</Text>
              {plan.features.map((feature: string, index: number) => (
                <View key={index} style={styles.featureItem}>
                  <Zap size={16} color="#10b981" style={styles.featureIcon} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}

              <View style={styles.divider} />

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Giá gói hàng tháng</Text>
                <Text style={styles.priceValue}>₫{plan.subtotal}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>VAT (10%)</Text>
                <Text style={styles.priceValue}>₫{plan.vat}</Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Thanh toán hôm nay</Text>
                <Text style={styles.totalValue}>₫{plan.price}</Text>
              </View>
            </View>

            {/* Chú thích */}
            <Text style={styles.disclaimerText}>
              Gói sẽ tự động gia hạn hàng tháng. Bạn sẽ bị tính phí ₫
              {plan.price}/tháng. Bạn có thể hủy bất kỳ lúc nào trong Cài đặt.
              Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng của chúng
              tôi.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Button thanh toán Sticky ở dưới cùng */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity onPress={handleCheckout} style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Đăng ký ngay</Text>
        </TouchableOpacity>
        <View style={styles.securityWrapper}>
          <Shield size={14} color="#9ca3af" />
          <Text style={styles.securityText}>
            Thanh toán bảo mật & mã hóa SSL
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#f9fafb",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  cardSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  cardIconsRow: {
    flexDirection: "row",
    gap: 6,
  },
  cardBadge: {
    width: 36,
    height: 22,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  cardBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
    fontStyle: "italic",
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    backgroundColor: "#fff",
    height: 50,
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#111827",
  },
  summarySection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureIcon: {
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    color: "#4b5563",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: "#4b5563",
  },
  priceValue: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
    marginTop: 2,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  disclaimerText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  bottomBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  checkoutButton: {
    backgroundColor: "#059669", // Emerald 600
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  securityWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  securityText: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 6,
  },
});
