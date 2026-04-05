import React, { useState } from "react";
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Link, useRouter } from "expo-router";
import { Leaf, ArrowLeft, CheckCircle2 } from "lucide-react-native";

import { forgotPasswordSchema, type ForgotPasswordFormData, authApi } from "@agri-scan/shared";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

const customForgotResolver = async (values: any) => {
  const result = forgotPasswordSchema.safeParse(values);
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({
    resolver: customForgotResolver,
    mode: "onChange",
    defaultValues: { email: "" },
  });

  // BUG FIX: Code cũ dùng setTimeout giả lập và console.log
  // → không bao giờ gửi OTP thật → OTP screen luôn fail vì không có mã nào được gửi
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setApiError("");
    try {
      await authApi.forgotPassword(data.email); // ← gọi API thật
      // Chuyển sang OTP screen, truyền email để hiển thị và dùng khi resend
      router.push({
        pathname: "/auth/otp-verification",
        params: { email: data.email },
      });
    } catch (error: any) {
      setApiError(
        error.response?.data?.message || "Không thể gửi email. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Leaf size={28} color="#16a34a" />
            </View>
            <Text style={styles.title}>Quên mật khẩu?</Text>
            <Text style={styles.subtitle}>
              Đừng lo lắng! Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
            </Text>
          </View>

          {apiError !== "" && (
            <View style={styles.errorAlert}>
              <Text style={styles.errorText}>{apiError}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={{ marginBottom: 16 }}>
                  <Input
                    label="Email của bạn"
                    placeholder="name@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={error?.message}
                  />
                </View>
              )}
            />

            <Button
              title="Gửi mã OTP"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
            />

            <View style={styles.footer}>
              <Link href="/auth/login" asChild>
                <TouchableOpacity style={styles.backLink}>
                  <ArrowLeft size={18} color="#4b5563" style={{ marginRight: 6 }} />
                  <Text style={styles.backText}>Quay lại đăng nhập</Text>
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
  scrollContent: { flexGrow: 1, paddingTop: 80, paddingBottom: 60, paddingHorizontal: 16 },
  card: { backgroundColor: "#ffffff", padding: 24, borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  header: { alignItems: "center", marginBottom: 24 },
  iconContainer: { width: 48, height: 48, backgroundColor: "rgba(22, 163, 74, 0.1)", borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", marginBottom: 8, textAlign: "center" },
  subtitle: { color: "#4b5563", textAlign: "center", fontSize: 14, lineHeight: 20, paddingHorizontal: 8 },
  errorAlert: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { color: "#dc2626", fontSize: 14, textAlign: "center" },
  form: { width: "100%" },
  submitButton: { marginTop: 4 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  backLink: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12 },
  backText: { color: "#4b5563", fontWeight: "500", fontSize: 15 },
});
