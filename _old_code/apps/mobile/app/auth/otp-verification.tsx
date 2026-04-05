import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Timer, Smartphone } from "lucide-react-native";

import { authApi } from "@agri-scan/shared";
import { Button } from "../../components/ui/Button";
import { AuthHeader } from "./AuthHeader";

export default function OTPVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (params.email as string) || "";

  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  // BUG FIX: trước đây không gọi API, luôn chuyển trang với dummy_token
  const handleVerify = async () => {
    if (otp.length < 6) return;
    setIsSubmitting(true);
    setApiError("");
    try {
      const res = await authApi.verifyOtp(email, otp);
      console.log("VERIFY OTP RESULT:", res);
      // BE trả về resetToken sau khi OTP đúng
      router.push({
        pathname: "/auth/reset-password",
        params: {
          token: res.resetToken,
          email,
        },
      });
    } catch (error: any) {
      setApiError(
        error.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setSeconds(60);
    setOtp("");
    setApiError("");
    try {
      // BUG FIX: trước đây chỉ Alert, không gọi API gửi lại OTP
      await authApi.forgotPassword(email);
      Alert.alert("Thông báo", "Mã OTP mới đã được gửi vào email của bạn.");
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể gửi lại OTP. Thử lại sau.",
      );
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
                <Smartphone size={28} color="#16a34a" />
              </View>
              <Text style={styles.title}>Xác thực OTP</Text>
              <Text style={styles.subtitle}>
                Vui lòng nhập mã 6 số được gửi đến:{"\n"}
                <Text style={styles.emailText}>{email}</Text>
              </Text>
            </View>

            {apiError !== "" && (
              <View style={styles.errorAlert}>
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            )}

            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              placeholderTextColor="#d1d5db"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              autoFocus={true}
            />

            <View style={styles.timerRow}>
              <Timer size={16} color={seconds > 0 ? "#6b7280" : "#ef4444"} />
              <Text
                style={[
                  styles.timerText,
                  seconds === 0 && styles.timerTextExpired,
                ]}
              >
                {seconds > 0 ? ` Gửi lại sau ${seconds}s` : " Mã đã hết hạn"}
              </Text>
            </View>

            <Button
              title="Xác nhận mã"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              onPress={handleVerify}
              disabled={otp.length < 6}
            />

            {seconds === 0 && (
              <TouchableOpacity
                onPress={handleResend}
                style={styles.resendBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.resendText}>Gửi lại mã mới</Text>
              </TouchableOpacity>
            )}
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
  header: { alignItems: "center", marginBottom: 30 },
  iconContainer: {
    width: 52,
    height: 52,
    backgroundColor: "rgba(22, 163, 74, 0.1)",
    borderRadius: 14,
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
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 22,
  },
  emailText: { fontWeight: "600", color: "#374151" },
  errorAlert: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#dc2626", fontSize: 14, textAlign: "center" },
  otpInput: {
    borderBottomWidth: 2,
    borderBottomColor: "#16a34a",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 10,
    letterSpacing: 15,
    marginBottom: 25,
    color: "#111827",
  },
  timerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  timerText: { fontSize: 14, color: "#6b7280", marginLeft: 4 },
  timerTextExpired: { color: "#ef4444", fontWeight: "600" },
  resendBtn: { marginTop: 20, alignItems: "center", padding: 10 },
  resendText: { color: "#16a34a", fontWeight: "700", fontSize: 15 },
});
