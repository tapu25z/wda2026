import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Lock, Eye, EyeOff } from "lucide-react-native";

import {
  resetPasswordSchema,
  type ResetPasswordFormData,
  authApi,
} from "@agri-scan/shared";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { AuthHeader } from "./AuthHeader";

const customResetResolver = async (values: any) => {
  const result = resetPasswordSchema.safeParse(values);
  if (result.success) return { values: result.data, errors: {} };

  const formErrors: Record<string, any> = {};
  const fieldErrors = result.error.flatten().fieldErrors;
  for (const key in fieldErrors) {
    formErrors[key] = {
      type: "validation",
      message: fieldErrors[key as keyof typeof fieldErrors]?.[0],
    };
  }
  return { values: {}, errors: formErrors };
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // BUG FIX: trước dùng "dummy_token_from_otp" hardcode → không đổi được pass thật
  // Giờ lấy token và email thật từ params được truyền qua từ OTP screen
  const tokenFromUrl = (params.token as string) || "";
  const email = (params.email as string) || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const { control, handleSubmit, watch } = useForm<any>({
    resolver: customResetResolver,
    mode: "onChange",
    defaultValues: {
      email: email,
      token: tokenFromUrl,
      password: "",
      confirmPassword: "",
    },
  });

  const onValidationError = (errors: any) => {
    console.log("Lỗi Validation từ Zod:", errors);
    if (errors.email || errors.token) {
      Alert.alert(
        "Lỗi dữ liệu",
        "Thông tin phiên bản cập nhật không đầy đủ, vui lòng thử lại OTP.",
      );
    }
  };

  const password = watch("password", "");
  const isPasswordLengthValid = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  // BUG FIX: trước đây chỉ console.log, không gọi API
  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    setApiError("");
    try {
      await authApi.resetPassword({
        email: email,
        resetToken: tokenFromUrl,
        newPassword: data.password,
      });

      // BẮT ĐẦU ĐOẠN SỬA LỖI CHO WEB
      if (Platform.OS === "web") {
        // Trên Web: Dùng alert mặc định của trình duyệt, sau đó tự động chuyển trang luôn
        window.alert("Thành công! Mật khẩu của bạn đã được cập nhật.");
        router.replace("/auth/login");
      } else {
        // Trên Mobile: Giữ nguyên Alert xịn xò của Native
        Alert.alert("Thành công", "Mật khẩu của bạn đã được cập nhật!", [
          {
            text: "Đăng nhập ngay",
            onPress: () => router.replace("/auth/login"),
          },
        ]);
      }
      // KẾT THÚC ĐOẠN SỬA LỖI
    } catch (error: any) {
      setApiError(
        error.response?.data?.message ||
          "Đổi mật khẩu thất bại. Phiên có thể đã hết hạn.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <AuthHeader showBack={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Lock size={28} color="#16a34a" />
              </View>
              <Text style={styles.title}>Mật khẩu mới</Text>
              <Text style={styles.subtitle}>
                Vui lòng nhập mật khẩu mới để hoàn tất việc khôi phục tài khoản
              </Text>
            </View>

            {apiError !== "" && (
              <View style={styles.errorAlert}>
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="password"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <View style={styles.inputGroup}>
                  <View style={styles.passwordWrapper}>
                    <Input
                      label="Mật khẩu mới"
                      placeholder="••••••••"
                      secureTextEntry={!showPassword}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={error?.message}
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
              )}
            />

            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
              {[
                [isPasswordLengthValid, "Ít nhất 8 ký tự"],
                [hasUpperCase, "Ít nhất 1 chữ hoa"],
                [hasLowerCase, "Ít nhất 1 chữ thường"],
                [hasNumber, "Ít nhất 1 số"],
                [hasSpecialChar, "Ít nhất 1 ký tự đặc biệt"],
              ].map(([valid, label]) => (
                <Text
                  key={label as string}
                  style={valid ? styles.reqValid : styles.reqInvalid}
                >
                  • {label as string}
                </Text>
              ))}
            </View>

            <Controller
              control={control}
              name="confirmPassword"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <View style={styles.inputGroup}>
                  <View style={styles.passwordWrapper}>
                    <Input
                      label="Xác nhận mật khẩu"
                      placeholder="••••••••"
                      secureTextEntry={!showConfirmPassword}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={error?.message}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color="#9ca3af" />
                      ) : (
                        <Eye size={20} color="#9ca3af" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            <Button
              title="Cập nhật mật khẩu"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              // CẬP NHẬT DÒNG NÀY:
              onPress={handleSubmit(onSubmit, onValidationError)}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 40,
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
  header: { alignItems: "center", marginBottom: 25 },
  iconContainer: {
    width: 52,
    height: 52,
    backgroundColor: "#dcfce3",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  errorAlert: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#dc2626", fontSize: 14, textAlign: "center" },
  inputGroup: { marginBottom: 14 },
  passwordWrapper: { position: "relative" },
  eyeIcon: { position: "absolute", right: 12, top: 38, padding: 4, zIndex: 1 },
  requirementsContainer: {
    marginTop: -4,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  reqValid: { fontSize: 12, color: "#16a34a", marginBottom: 2 },
  reqInvalid: { fontSize: 12, color: "#9ca3af", marginBottom: 2 },
  submitButton: { marginTop: 10 },
});
