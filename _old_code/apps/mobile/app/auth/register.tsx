import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Link, useRouter } from "expo-router";
import { Leaf, ArrowLeft, Eye, EyeOff, Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 🔥 Xóa schema bị lỗi, chỉ giữ type và api
import { type RegisterFormData, authApi } from "@agri-scan/shared";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Lấy getValues ra để check thủ công
  const { control, getValues } = useForm<RegisterFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // 🔥 HÀM ĐĂNG KÝ THỦ CÔNG (CHỐNG LỖI BẤM KHÔNG PHẢN HỒI)
  const onManualSubmit = async () => {
    const data = getValues();

    // 1. Kiểm tra rỗng
    if (
      !data.fullName ||
      !data.email ||
      !data.password ||
      !data.confirmPassword
    ) {
      setApiError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // 2. Kiểm tra định dạng Email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setApiError("Email không hợp lệ!");
      return;
    }

    // 3. Kiểm tra mật khẩu khớp nhau
    if (data.password !== data.confirmPassword) {
      setApiError("Mật khẩu xác nhận không khớp!");
      return;
    }

    // 4. Kiểm tra điều khoản
    if (!agreeTerms) {
      setApiError("Vui lòng đồng ý với Điều khoản và Chính sách bảo mật!");
      return;
    }

    setIsSubmitting(true);
    setApiError("");

    try {
      // Gọi API đăng ký
      await authApi.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      // Đăng ký thành công -> Đẩy về trang Login kèm tham số báo thành công
      router.replace("/auth/login?registered=true");
    } catch (error: any) {
      setApiError(
        error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 20) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" // 🔥 Sửa triệt để lỗi phải bấm 2 lần
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Leaf size={32} color="#16a34a" />
            </View>
            <Text style={styles.title}>Tạo tài khoản mới</Text>
            <Text style={styles.subtitle}>
              Bắt đầu hành trình chăm sóc cây trồng thông minh
            </Text>
          </View>

          {apiError ? (
            <View style={styles.errorAlert}>
              <Text style={styles.errorText}>{apiError}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            {/* HỌ VÀ TÊN */}
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Họ và tên"
                    placeholder="Nhập họ và tên của bạn"
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                      if (apiError) setApiError("");
                    }}
                    value={value}
                  />
                )}
              />
            </View>

            {/* EMAIL */}
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
                    placeholder="Nhập địa chỉ email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                      if (apiError) setApiError("");
                    }}
                    value={value}
                  />
                )}
              />
            </View>

            {/* MẬT KHẨU */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View style={styles.passwordWrapper}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                      secureTextEntry={!showPassword}
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        onChange(text);
                        if (apiError) setApiError("");
                      }}
                      value={value}
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9ca3af" />
                  ) : (
                    <Eye size={20} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* XÁC NHẬN MẬT KHẨU */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
              <View style={styles.passwordWrapper}>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Nhập lại mật khẩu"
                      secureTextEntry={!showConfirmPassword}
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        onChange(text);
                        if (apiError) setApiError("");
                      }}
                      value={value}
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#9ca3af" />
                  ) : (
                    <Eye size={20} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* CHECKBOX */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              activeOpacity={0.7}
              onPress={() => {
                setAgreeTerms(!agreeTerms);
                if (apiError) setApiError("");
              }}
            >
              <View
                style={[styles.checkbox, agreeTerms && styles.checkboxActive]}
              >
                {agreeTerms && <Check size={14} color="#fff" strokeWidth={3} />}
              </View>
              <Text style={styles.checkboxText}>
                Tôi đồng ý với <Text style={styles.linkText}>Điều khoản</Text>{" "}
                và <Text style={styles.linkText}>CSBM</Text>
              </Text>
            </TouchableOpacity>

            <Button
              title="Đăng ký"
              onPress={onManualSubmit} // 🔥 GỌI HÀM CHUẨN XÁC
              isLoading={isSubmitting}
              style={{ marginTop: 8 }}
            />

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Đã có tài khoản? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.registerLink}>Đăng nhập</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: { alignItems: "center", marginBottom: 24 },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(22, 163, 74, 0.1)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: { color: "#4b5563", textAlign: "center", fontSize: 14 },
  errorAlert: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#dc2626", fontSize: 14, textAlign: "center" },
  form: { width: "100%" },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  passwordWrapper: { position: "relative" },
  eyeIcon: { position: "absolute", right: 12, top: 12, padding: 4 },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  checkboxText: { flex: 1, fontSize: 13, color: "#4b5563", lineHeight: 20 },
  linkText: { color: "#16a34a", fontWeight: "bold" },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  registerText: { color: "#6b7280", fontSize: 14 },
  registerLink: { color: "#16a34a", fontWeight: "bold", fontSize: 14 },
});
