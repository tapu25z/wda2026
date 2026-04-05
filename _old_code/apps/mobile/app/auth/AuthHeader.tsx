import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useRouter, useNavigation } from "expo-router";

export const AuthHeader = ({ showBack = true }: { showBack?: boolean }) => {
  const router = useRouter();
  const navigation = useNavigation();

  // Kiểm tra xem có trang trước đó để quay lại không
  const canGoBack = navigation.canGoBack();

  if (!showBack || !canGoBack) return <View style={{ height: 20 }} />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#1f2937" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "transparent",
  },
  container: {
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 20,
    // Đảm bảo nút này luôn nổi lên trên cùng
    zIndex: 99,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    // Shadow cho xịn
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
