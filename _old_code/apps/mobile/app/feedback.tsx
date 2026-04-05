import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Send,
  MessageSquareWarning,
  PenTool,
  History,
  Clock,
  CheckCircle2,
} from "lucide-react-native";

import { adminApi } from "@agri-scan/shared";

type CategoryType = "BUG" | "FEATURE" | "COMPLAINT" | "GENERAL";
type TabType = "SEND" | "HISTORY";

export default function FeedbackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>("SEND");

  // State cho Tab Gửi
  const [category, setCategory] = useState<CategoryType>("GENERAL");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho Tab Lịch sử
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const categories: { id: CategoryType; label: string }[] = [
    { id: "GENERAL", label: "Hỗ trợ chung" },
    { id: "BUG", label: "Báo lỗi ứng dụng" },
    { id: "FEATURE", label: "Góp ý tính năng" },
    { id: "COMPLAINT", label: "Khiếu nại" },
  ];

  useEffect(() => {
    if (activeTab === "HISTORY") {
      fetchFeedbackHistory();
    }
  }, [activeTab]);

  // ==============================================================
  // GIẢ LẬP LẤY LỊCH SỬ PHẢN HỒI (CHỜ BACKEND LÀM API)
  // ==============================================================
  // const fetchFeedbackHistory = async () => {
  //   setIsLoadingHistory(true);
  //   // Giả lập load 1 giây
  //   await new Promise((resolve) => setTimeout(resolve, 1000));

  //   // Dữ liệu giả định
  //   const mockHistory = [
  //     {
  //       _id: "1",
  //       category: "FEATURE",
  //       content:
  //         "Mình mong app sớm có thêm tính năng dự báo thời tiết 14 ngày thay vì chỉ 7 ngày như hiện tại.",
  //       status: "REPLIED",
  //       adminReply:
  //         "Chào bạn, cảm ơn bạn đã góp ý! Đội ngũ phát triển đã ghi nhận và sẽ cập nhật tính năng thời tiết 14 ngày trong bản cập nhật tháng tới nhé. Chúc bạn một ngày vui vẻ!",
  //       createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  //       repliedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  //     },
  //     {
  //       _id: "2",
  //       category: "BUG",
  //       content:
  //         "Khi mình ấn vào nút chụp ảnh trên Android thỉnh thoảng app bị đơ mất 2 giây.",
  //       status: "PENDING",
  //       createdAt: new Date().toISOString(),
  //     },
  //   ];

  //   setHistoryData(mockHistory);
  //   setIsLoadingHistory(false);
  // };
  // ==============================================================
  // GỌI API THẬT LẤY LỊCH SỬ PHẢN HỒI TỪ BACKEND
  // ==============================================================
  const fetchFeedbackHistory = async () => {
    try {
      setIsLoadingHistory(true);
      // Gọi API lấy dữ liệu của chính user đang đăng nhập
      const res = await adminApi.getMyFeedbacks(1, 50);
      setHistoryData(res.data || []);
    } catch (error) {
      console.log("Lỗi lấy lịch sử phản hồi:", error);
      Platform.OS === "web"
        ? window.alert("Không thể tải lịch sử phản hồi.")
        : Alert.alert("Lỗi", "Không thể tải lịch sử phản hồi.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSubmit = async () => {
    if (content.trim().length < 10) {
      Platform.OS === "web"
        ? window.alert(
            "Vui lòng nhập nội dung phản hồi ít nhất 10 ký tự để Admin hiểu rõ vấn đề nhé!",
          )
        : Alert.alert(
            "Lỗi",
            "Vui lòng nhập nội dung phản hồi ít nhất 10 ký tự để Admin hiểu rõ vấn đề nhé!",
          );
      return;
    }

    try {
      setIsSubmitting(true);
      // Gọi API gửi feedback xuống Backend
      await adminApi.submitFeedback({ category, content: content.trim() });

      if (Platform.OS === "web") {
        window.alert("🎉 Gửi thành công! Cảm ơn bạn đã gửi phản hồi.");
      } else {
        Alert.alert(
          "Gửi thành công!",
          "Cảm ơn bạn đã gửi phản hồi. Ban quản trị sẽ xem xét sớm nhất.",
        );
      }

      // Gửi xong thì làm sạch form và tự động nhảy sang Tab Lịch sử
      setContent("");
      setActiveTab("HISTORY");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Không thể gửi phản hồi lúc này.";
      Platform.OS === "web"
        ? window.alert(errorMsg)
        : Alert.alert("Lỗi", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hỗ Trợ & Phản Hồi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* HAI TAB ĐIỀU HƯỚNG */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "SEND" && styles.tabBtnActive]}
          onPress={() => setActiveTab("SEND")}
        >
          <PenTool
            size={18}
            color={activeTab === "SEND" ? "#16a34a" : "#64748b"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "SEND" && styles.tabTextActive,
            ]}
          >
            Gửi góp ý
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "HISTORY" && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab("HISTORY")}
        >
          <History
            size={18}
            color={activeTab === "HISTORY" ? "#16a34a" : "#64748b"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "HISTORY" && styles.tabTextActive,
            ]}
          >
            Lịch sử của tôi
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ==================================================== */}
        {/* TAB 1: FORM GỬI PHẢN HỒI */}
        {/* ==================================================== */}
        {activeTab === "SEND" ? (
          <View>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <MessageSquareWarning size={32} color="#16a34a" />
              </View>
              <Text style={styles.introText}>
                Bạn đang gặp vấn đề hay có ý tưởng hay? Hãy chia sẻ cùng
                Agri-Scan để chúng tôi cải thiện ứng dụng nhé!
              </Text>
            </View>

            <Text style={styles.label}>Chủ đề phản hồi:</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    category === cat.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat.id && styles.categoryTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Nội dung chi tiết:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                multiline
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
                maxLength={1000}
              />
              <Text style={styles.charCount}>{content.length}/1000</Text>
            </View>
          </View>
        ) : (
          /* ==================================================== */
          /* TAB 2: LỊCH SỬ PHẢN HỒI (VÀ TRẢ LỜI CỦA ADMIN) */
          /* ==================================================== */
          <View>
            {isLoadingHistory ? (
              <ActivityIndicator
                size="large"
                color="#16a34a"
                style={{ marginTop: 40 }}
              />
            ) : historyData.length === 0 ? (
              <Text style={styles.emptyText}>Bạn chưa gửi phản hồi nào.</Text>
            ) : (
              historyData.map((item) => (
                <View key={item._id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyCatBadge}>
                      <Text style={styles.historyCatText}>
                        {categories.find((c) => c.id === item.category)
                          ?.label || item.category}
                      </Text>
                    </View>
                    <Text style={styles.historyDate}>
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>

                  <Text style={styles.historyContent}>{item.content}</Text>

                  {item.status === "REPLIED" ? (
                    <View style={styles.repliedBox}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 6,
                        }}
                      >
                        <CheckCircle2 size={16} color="#16a34a" />
                        <Text style={styles.repliedLabel}>
                          Ban Quản Trị đã trả lời:
                        </Text>
                      </View>
                      <Text style={styles.repliedText}>{item.adminReply}</Text>
                    </View>
                  ) : (
                    <View style={styles.pendingBox}>
                      <Clock size={14} color="#d97706" />
                      <Text style={styles.pendingText}>
                        Đang chờ Admin xử lý...
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* FOOTER NÚT GỬI (Chỉ hiện ở Tab Gửi) */}
      {activeTab === "SEND" && (
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!content.trim() || isSubmitting) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Send size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Gửi cho Ban Quản Trị</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: { borderBottomColor: "#16a34a" },
  tabText: { fontSize: 15, fontWeight: "bold", color: "#64748b" },
  tabTextActive: { color: "#16a34a" },

  content: { padding: 20 },

  // Styles cho Tab Gửi
  iconContainer: { alignItems: "center", marginBottom: 24, marginTop: 10 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#dcfce3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  introText: {
    textAlign: "center",
    color: "#475569",
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryChipActive: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  categoryText: { color: "#64748b", fontWeight: "600", fontSize: 14 },
  categoryTextActive: { color: "#fff" },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    height: 200,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#1e293b",
    outlineStyle: "none" as any,
  },
  charCount: {
    textAlign: "right",
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 8,
  },
  footer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  submitBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Styles cho Tab Lịch Sử
  emptyText: {
    textAlign: "center",
    color: "#94a3b8",
    marginTop: 40,
    fontSize: 15,
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyCatBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyCatText: { fontSize: 12, fontWeight: "bold", color: "#475569" },
  historyDate: { fontSize: 12, color: "#94a3b8" },
  historyContent: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
    marginBottom: 16,
  },

  repliedBox: {
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
  },
  repliedLabel: { fontSize: 14, fontWeight: "bold", color: "#15803d" },
  repliedText: { fontSize: 14, color: "#166534", lineHeight: 22 },

  pendingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef3c7",
    padding: 10,
    borderRadius: 8,
  },
  pendingText: { fontSize: 13, color: "#d97706", fontWeight: "600" },
});
