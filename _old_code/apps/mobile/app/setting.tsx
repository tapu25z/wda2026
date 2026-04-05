import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  HelpCircle,
  ChevronRight,
  Smartphone,
} from "lucide-react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // Trạng thái Sáng/Tối
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Bảng màu Động (Dynamic Colors) dựa trên trạng thái isDarkMode
  const theme = {
    bg: isDarkMode ? "#111827" : "#f9fafb",
    cardBg: isDarkMode ? "#1f2937" : "#fff",
    textMain: isDarkMode ? "#f9fafb" : "#111827",
    textSub: isDarkMode ? "#9ca3af" : "#6b7280",
    borderColor: isDarkMode ? "#374151" : "#f3f4f6",
    iconBg: isDarkMode ? "#374151" : "#f9fafb",
  };

  const SettingRow = ({
    icon,
    title,
    subtitle,
    rightElement,
    onPress,
  }: any) => (
    <TouchableOpacity
      style={[styles.settingRow, { backgroundColor: theme.cardBg }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.settingIconBox, { backgroundColor: theme.iconBg }]}>
        {icon}
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingTitle, { color: theme.textMain }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.textSub }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || <ChevronRight size={20} color={theme.textSub} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 20),
            backgroundColor: theme.cardBg,
            borderBottomColor: theme.borderColor,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.iconBg }]}
        >
          <ArrowLeft size={24} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>
          Cài đặt ứng dụng
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.sectionTitle, { color: theme.textSub }]}>
          Hiển thị & Tùy chỉnh
        </Text>
        <View style={[styles.sectionGroup, { borderColor: theme.borderColor }]}>
          <SettingRow
            icon={<Globe size={20} color="#3b82f6" />}
            title="Ngôn ngữ"
            subtitle="Tiếng Việt"
            onPress={() => {}}
          />
          <View
            style={[styles.divider, { backgroundColor: theme.borderColor }]}
          />
          <SettingRow
            icon={
              isDarkMode ? (
                <Sun size={20} color="#f59e0b" />
              ) : (
                <Moon size={20} color="#6366f1" />
              )
            }
            title={
              isDarkMode
                ? "Giao diện sáng (Light Mode)"
                : "Giao diện tối (Dark Mode)"
            }
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: "#d1d5db", true: "#86efac" }}
                thumbColor={isDarkMode ? "#16a34a" : "#f3f4f6"}
              />
            }
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSub }]}>
          Thông báo
        </Text>
        <View style={[styles.sectionGroup, { borderColor: theme.borderColor }]}>
          <SettingRow
            icon={<Bell size={20} color="#f59e0b" />}
            title="Thông báo đẩy"
            subtitle="Nhận nhắc nhở chăm sóc cây"
            rightElement={
              <Switch
                value={isPushEnabled}
                onValueChange={setIsPushEnabled}
                trackColor={{ false: "#d1d5db", true: "#86efac" }}
                thumbColor={isPushEnabled ? "#16a34a" : "#f3f4f6"}
              />
            }
          />
          <View
            style={[styles.divider, { backgroundColor: theme.borderColor }]}
          />
          <SettingRow
            icon={<Smartphone size={20} color="#10b981" />}
            title="Âm thanh ứng dụng"
            rightElement={
              <Switch
                value={isSoundEnabled}
                onValueChange={setIsSoundEnabled}
                trackColor={{ false: "#d1d5db", true: "#86efac" }}
                thumbColor={isSoundEnabled ? "#16a34a" : "#f3f4f6"}
              />
            }
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSub }]}>
          Bảo mật & Hỗ trợ
        </Text>
        <View style={[styles.sectionGroup, { borderColor: theme.borderColor }]}>
          <SettingRow
            icon={<Shield size={20} color="#ef4444" />}
            title="Bảo mật tài khoản"
            subtitle="Mật khẩu & Xác thực 2 lớp"
            onPress={() => {}}
          />
          <View
            style={[styles.divider, { backgroundColor: theme.borderColor }]}
          />
          <SettingRow
            icon={<HelpCircle size={20} color="#8b5cf6" />}
            title="Trung tâm trợ giúp"
            subtitle="Câu hỏi thường gặp (FAQ)"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  sectionGroup: {
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: { flexDirection: "row", alignItems: "center", padding: 16 },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingTextContainer: { flex: 1, paddingRight: 10 },
  settingTitle: { fontSize: 16, fontWeight: "600" },
  settingSubtitle: { fontSize: 13, marginTop: 2 },
  divider: { height: 1, marginLeft: 64 },
});
