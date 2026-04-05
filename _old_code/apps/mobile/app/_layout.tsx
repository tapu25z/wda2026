import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { setTokenStorage } from "@agri-scan/shared";

if (Platform.OS === "web") {
  // Chạy trên Expo Web (localhost:8081) hoặc trình duyệt
  setTokenStorage({
    getAccessToken: () => localStorage.getItem("accessToken"),
    getRefreshToken: () => localStorage.getItem("refreshToken"),
    saveTokens: (access: string, refresh: string) => {
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
    },
    clearTokens: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
  });
} else {
  // Chạy trên iOS / Android thật hoặc emulator
  setTokenStorage({
    getAccessToken: () => SecureStore.getItemAsync("accessToken"),
    getRefreshToken: () => SecureStore.getItemAsync("refreshToken"),
    saveTokens: async (access: string, refresh: string) => {
      await SecureStore.setItemAsync("accessToken", access);
      await SecureStore.setItemAsync("refreshToken", refresh);
    },
    clearTokens: async () => {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("user");
    },
  });
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/otp-verification" />
        <Stack.Screen name="auth/reset-password" />
        <Stack.Screen name="auth/set-password" />
        <Stack.Screen name="auth/AuthHeader" />
        <Stack.Screen name="user" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="treeDic" />
        <Stack.Screen name="upgrade" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="about" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="community" />
        <Stack.Screen name="setting" />
        <Stack.Screen name="notification" />
        <Stack.Screen name="tips" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="weather" />
        <Stack.Screen name="my-garden" />
        <Stack.Screen name="shop" />
        <Stack.Screen name="product-detail" />
        <Stack.Screen name="my-cart" />
        <Stack.Screen name="buy-detail" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="feedback" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="success-order" />
        <Stack.Screen name="my-shop" />
        <Stack.Screen name="add-product" />
        <Stack.Screen name="garden-detail" />
        <Stack.Screen name="garden-setup" />
      </Stack>
    </SafeAreaProvider>
  );
}
