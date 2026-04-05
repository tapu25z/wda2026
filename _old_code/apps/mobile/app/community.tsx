import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Users, Sparkles, Wrench } from "lucide-react-native";

export default function CommunityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View
        style={[styles.headerNav, { paddingTop: Math.max(insets.top, 20) }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cộng đồng</Text>
        <View style={{ width: 40 }} /> {/* Spacer để cân bằng Header */}
      </View>

      {/* Nội dung chính */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {/* Vòng tròn hiệu ứng */}
          <View style={styles.circleOuter}>
            <View style={styles.circleInner}>
              <Users size={48} color="#16a34a" />
            </View>
          </View>
          {/* Icon lấp lánh trang trí */}
          <View style={styles.sparkleIcon}>
            <Sparkles size={24} color="#ca8a04" />
          </View>
          <View style={styles.wrenchIcon}>
            <Wrench size={20} color="#4b5563" />
          </View>
        </View>

        <Text style={styles.title}>Tính năng đang phát triển</Text>

        <Text style={styles.description}>
          Chúng tôi đang xây dựng một không gian kết nối dành riêng cho nhà
          nông. Nơi bạn có thể chia sẻ kinh nghiệm, hỏi đáp cùng các chuyên gia
          và học hỏi các kỹ thuật canh tác bền vững.
        </Text>

        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>
            🚀 Sẽ ra mắt trong giai đoạn tiếp theo!
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Text style={styles.actionBtnText}>Quay lại trang trước</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  iconContainer: {
    position: "relative",
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  circleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#dcfce3",
    justifyContent: "center",
    alignItems: "center",
  },
  circleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#bbf7d0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  sparkleIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wrenchIcon: {
    position: "absolute",
    bottom: 10,
    left: 0,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  badgeContainer: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginBottom: 40,
  },
  badgeText: {
    color: "#1d4ed8",
    fontSize: 14,
    fontWeight: "600",
  },
  actionBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
