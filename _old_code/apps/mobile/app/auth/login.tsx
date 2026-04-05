import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { Leaf, ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";

import { authApi } from "@agri-scan/shared";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  // Thêm State để quản lý việc đồng ý điều khoản
  const [isAgreed, setIsAgreed] = useState(false);

  // =====================================================================
  // BẮT SỰ KIỆN KHI BACKEND REDIRECT VỀ (SAU KHI LOGIN GOOGLE/FACEBOOK)
  // =====================================================================
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Kiểm tra xem trên URL có trả về token không
      if (params.accessToken && params.refreshToken && params.user) {
        try {
          setIsOAuthLoading(true);

          // 1. Giải mã thông tin user từ URL
          const userObj = JSON.parse(decodeURIComponent(params.user as string));

          // 2. Lưu Token vào máy (để dùng cho các API khác)
          if (Platform.OS === "web") {
            localStorage.setItem("accessToken", params.accessToken as string);
            localStorage.setItem("refreshToken", params.refreshToken as string);
            localStorage.setItem("user", JSON.stringify(userObj));
          } else {
            await SecureStore.setItemAsync(
              "accessToken",
              params.accessToken as string,
            );
            await SecureStore.setItemAsync(
              "refreshToken",
              params.refreshToken as string,
            );
            await SecureStore.setItemAsync("user", JSON.stringify(userObj));
          }

          // 3. KIỂM TRA ĐÃ CÓ MẬT KHẨU CHƯA ĐỂ CHUYỂN TRANG
          if (userObj.isPasswordSet === false) {
            router.replace("/auth/set-password" as any);
          } else {
            router.replace("/user" as any);
          }
        } catch (error) {
          console.error("Lỗi xử lý đăng nhập Mạng xã hội:", error);
          Alert.alert("Lỗi", "Quá trình đồng bộ tài khoản thất bại.");
          setIsOAuthLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, [params]);

  // =====================================================================
  // HÀM XỬ LÝ ĐĂNG NHẬP BẰNG EMAIL / MẬT KHẨU
  // =====================================================================
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Platform.OS === "web"
        ? window.alert("Vui lòng nhập đầy đủ email và mật khẩu.")
        : Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    // Kiểm tra xem đã đồng ý điều khoản chưa
    if (!isAgreed) {
      Platform.OS === "web"
        ? window.alert(
            "Vui lòng đọc và đồng ý với Điều khoản sử dụng của Agri-Scan.",
          )
        : Alert.alert(
            "Điều khoản sử dụng",
            "Vui lòng đọc và đồng ý với Điều khoản sử dụng của Agri-Scan.",
          );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authApi.login({ email, password });

      if (Platform.OS === "web") {
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        localStorage.setItem("user", JSON.stringify(res.user));
      } else {
        await SecureStore.setItemAsync("accessToken", res.accessToken);
        await SecureStore.setItemAsync("refreshToken", res.refreshToken);
        await SecureStore.setItemAsync("user", JSON.stringify(res.user));
      }

      // Đăng nhập bằng Email thì chắc chắn đã có mật khẩu -> Về trang chủ
      router.replace("/user" as any);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Đăng nhập thất bại.Sai email hoặc mật khẩu.";
      Platform.OS === "web"
        ? window.alert(Array.isArray(msg) ? msg.join("\n") : msg)
        : Alert.alert("Lỗi", Array.isArray(msg) ? msg.join("\n") : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Màn hình loading khi đang xử lý token từ URL
  if (isOAuthLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ marginTop: 16, color: "#4b5563", fontWeight: "bold" }}>
          Đang đồng bộ tài khoản...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 40) }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <View style={styles.logoIconBox}>
            <Leaf size={28} color="#fff" />
          </View>
          <Text style={styles.title}>Chào mừng trở lại!</Text>
          <Text style={styles.subtitle}>
            Đăng nhập để tiếp tục chăm sóc khu vườn của bạn.
          </Text>
        </View>

        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email của bạn</Text>
            <View style={styles.inputWrapper}>
              <Mail size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: agriscan@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu của bạn"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <Eye size={20} color="#64748b" />
                ) : (
                  <EyeOff size={20} color="#64748b" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotPassBtn}
            onPress={() => router.push("/auth/forgot-password" as any)}
          >
            <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* 🔥 Ô xác nhận đồng ý điều khoản (Đã sửa lỗi chữ nhấp nhô) */}
          <View style={styles.agreementContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setIsAgreed(!isAgreed)}
            >
              <View
                style={[
                  styles.checkboxInner,
                  isAgreed && styles.checkboxChecked,
                ]}
              />
            </TouchableOpacity>
            <Text style={styles.agreementText}>
              Tôi đồng ý với{" "}
              <Link href={"/auth/terms" as any} asChild>
                <Text style={styles.linkText}>Điều khoản sử dụng</Text>
              </Link>{" "}
              và{" "}
              <Link href={"/auth/privacy" as any} asChild>
                <Text style={styles.linkText}>Chính sách bảo mật</Text>
              </Link>{" "}
              của Agri-Scan.
            </Text>
          </View>

          {/* Nút Đăng nhập */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleEmailLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Đăng nhập ngay</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Hoặc đăng nhập bằng</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ĐĂNG NHẬP MẠNG XÃ HỘI */}
          <View style={styles.socialContainer}>
            {/* Nút Google (Đã sửa link ảnh ổn định) */}
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => authApi.loginWithGoogle()}
            >
              <Image
                source={{
                  uri: "https://img.icons8.com/color/48/google-logo.png",
                }}
                style={{ width: 22, height: 22, marginRight: 10 }}
                resizeMode="contain"
              />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>

            {/* Nút Facebook (Đã sửa link ảnh ổn định) */}
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => authApi.loginWithFacebook()}
            >
              <Image
                source={{
                  uri: "https://img.icons8.com/color/48/facebook-new.png",
                }}
                style={{ width: 24, height: 24, marginRight: 10 }}
                resizeMode="contain"
              />
              <Text style={styles.socialBtnText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Bạn chưa có tài khoản? </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },

  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
    alignItems: "center",
  },
  logoIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#16a34a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: { fontSize: 26, fontWeight: "900", color: "#111827", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#64748b", textAlign: "center" },

  form: { paddingHorizontal: 24 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: "#f9fafb",
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    outlineStyle: "none" as any,
  },

  forgotPassBtn: { alignSelf: "flex-end", marginBottom: 24 },
  forgotPassText: { fontSize: 14, fontWeight: "600", color: "#16a34a" },

  agreementContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: "transparent",
  },
  checkboxChecked: { backgroundColor: "#16a34a" },
  agreementText: { fontSize: 13, color: "#6b7280", flex: 1, lineHeight: 18 },
  linkText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#16a34a",
    textDecorationLine: "underline",
  },

  submitBtn: {
    backgroundColor: "#16a34a",
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerText: {
    marginHorizontal: 12,
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "600",
  },

  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 30,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  socialBtnText: { fontSize: 15, fontWeight: "bold", color: "#374151" },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: { fontSize: 14, color: "#6b7280" },
  registerLink: { fontSize: 14, fontWeight: "bold", color: "#16a34a" },
});
