import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  LayoutDashboard,
  Users,
  LogOut,
  TrendingUp,
  ScanFace,
  Crown,
  Star,
  Search,
  BarChart3,
  Calendar,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
} from "lucide-react-native";

import { adminApi } from "@agri-scan/shared";

type TabType = "DASHBOARD" | "USERS" | "REPORT" | "FEEDBACK";
type FeedbackStatus = "PENDING" | "REPLIED";

export default function AdminMobileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>("DASHBOARD");
  const [errorMsg, setErrorMsg] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Thông tin Admin đăng nhập
  const [adminInfo, setAdminInfo] = useState<any>(null);

  // States: Dashboard
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // States: Users
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // States: Report
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // States: Feedback
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbackStatus, setFeedbackStatus] =
    useState<FeedbackStatus>("PENDING");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);

  useEffect(() => {
    loadAdminProfile();
    fetchPendingFeedbackCount();
  }, []);

  useEffect(() => {
    setErrorMsg("");
    if (activeTab === "DASHBOARD" && !dashboardData) fetchDashboardData();
    else if (activeTab === "USERS" && usersData.length === 0) fetchUsersData();
    else if (activeTab === "REPORT" && !reportData) fetchReportData();
    else if (activeTab === "FEEDBACK") fetchFeedbacksData();
  }, [activeTab, feedbackStatus]);

  // Lấy thông tin Admin từ bộ nhớ máy
  const loadAdminProfile = async () => {
    try {
      let userStr = null;
      if (Platform.OS === "web") {
        userStr = localStorage.getItem("user");
      } else {
        userStr = await SecureStore.getItemAsync("user");
      }
      if (userStr) setAdminInfo(JSON.parse(userStr));
    } catch (e) {
      console.log("Không thể đọc thông tin admin");
    }
  };

  const fetchPendingFeedbackCount = async () => {
    try {
      const res = await adminApi.getFeedbacks("PENDING", 1, 1);
      setPendingFeedbackCount(res.pagination?.total || 0);
    } catch (error) {
      console.log("Lỗi lấy số đếm thông báo");
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      const res = await adminApi.getDashboard();
      setDashboardData(res);
    } catch (error) {
      setErrorMsg("Không thể tải Tổng quan.");
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchUsersData = async () => {
    try {
      setLoadingUsers(true);
      const res = await adminApi.getUsers({
        page: 1,
        limit: 50,
        search: searchQuery,
      });
      setUsersData(res.data);
    } catch (error) {
      setErrorMsg("Không thể tải danh sách Người dùng.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoadingReport(true);
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), 0, 1)
        .toISOString()
        .split("T")[0];
      const today = now.toISOString().split("T")[0];

      const res = await adminApi.getRevenueReport({
        from: firstDay,
        to: today,
        groupBy: "month",
      });
      setReportData(res);
    } catch (error) {
      setErrorMsg("Không thể tải Báo cáo doanh thu.");
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchFeedbacksData = async () => {
    try {
      setLoadingFeedback(true);
      const res = await adminApi.getFeedbacks(feedbackStatus, 1, 50);
      setFeedbacks(res.data);
    } catch (error) {
      setErrorMsg("Không thể tải danh sách Phản hồi.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setErrorMsg("");
    try {
      fetchPendingFeedbackCount(); // Cập nhật lại số đếm luôn
      if (activeTab === "DASHBOARD") await fetchDashboardData();
      else if (activeTab === "USERS") await fetchUsersData();
      else if (activeTab === "REPORT") await fetchReportData();
      else if (activeTab === "FEEDBACK") await fetchFeedbacksData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleReplySubmit = async (feedbackId: string) => {
    if (!replyContent.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung trả lời!");
      return;
    }
    try {
      setIsSubmittingReply(true);
      await adminApi.replyFeedback(feedbackId, replyContent);
      if (Platform.OS === "web") {
        window.alert("Đã gửi câu trả lời cho người dùng!");
      } else {
        Alert.alert("Thành công", "Đã gửi câu trả lời cho người dùng!");
      }
      setReplyContent("");
      setReplyingId(null);
      fetchFeedbacksData();
      fetchPendingFeedbackCount(); // Cập nhật lại số đếm sau khi trả lời
    } catch (error: any) {
      const msg = error.response?.data?.message || "Không thể gửi câu trả lời.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Lỗi", msg);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      const confirmLogout = window.confirm(
        "Bạn có chắc chắn muốn đăng xuất khỏi quyền quản trị?",
      );
      if (confirmLogout) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        router.replace("/auth/login" as any);
      }
    } else {
      Alert.alert(
        "Đăng xuất",
        "Bạn có chắc chắn muốn đăng xuất khỏi quyền quản trị?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng xuất",
            style: "destructive",
            onPress: async () => {
              await SecureStore.deleteItemAsync("accessToken");
              await SecureStore.deleteItemAsync("refreshToken");
              await SecureStore.deleteItemAsync("user");
              router.replace("/auth/login" as any);
            },
          },
        ],
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num || 0);
  };

  // Lời chào theo thời gian thực
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // ==========================================
  // MOBILE RENDER: TỔNG QUAN (DASHBOARD)
  // ==========================================
  const renderDashboardTab = () => (
    <View style={styles.tabContent}>
      {loadingDashboard && !refreshing ? (
        <ActivityIndicator
          size="large"
          color="#16a34a"
          style={{ marginTop: 50 }}
        />
      ) : dashboardData ? (
        <>
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statCardMobile,
                { width: "100%", backgroundColor: "#1e293b" },
              ]}
            >
              <View style={styles.statCardHeader}>
                <Text style={[styles.statTitle, { color: "#94a3b8" }]}>
                  Tổng Doanh Thu
                </Text>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: "rgba(255,255,255,0.1)" },
                  ]}
                >
                  <TrendingUp size={20} color="#38bdf8" />
                </View>
              </View>
              <Text style={[styles.statValue, { color: "#fff", fontSize: 32 }]}>
                {formatCurrency(dashboardData.revenue.total)}
              </Text>
              <Text style={[styles.statTrend, { color: "#4ade80" }]}>
                + {formatCurrency(dashboardData.revenue.thisMonth)} tháng này
              </Text>
            </View>

            <View style={styles.halfCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statTitle}>Người dùng</Text>
                <Users size={18} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>
                {formatNumber(dashboardData.users.total)}
              </Text>
              <Text style={styles.statTrend}>
                + {dashboardData.users.newThisMonth} mới
              </Text>
            </View>

            <View style={styles.halfCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statTitle}>Lượt quét AI</Text>
                <ScanFace size={18} color="#a855f7" />
              </View>
              <Text style={styles.statValue}>
                {formatNumber(dashboardData.totalScans)}
              </Text>
              <Text style={[styles.statTrend, { color: "#64748b" }]}>
                Đã phân tích
              </Text>
            </View>
          </View>

          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Tỉ lệ gói thành viên</Text>

            <View style={styles.planItem}>
              <View style={styles.planLeft}>
                <View style={[styles.planIcon, { backgroundColor: "#f1f5f9" }]}>
                  <Users size={16} color="#475569" />
                </View>
                <Text style={styles.planText}>Gói Cơ bản (Free)</Text>
              </View>
              <Text style={styles.planValue}>
                {formatNumber(dashboardData.users.byPlan.FREE)}
              </Text>
            </View>

            <View style={styles.planItem}>
              <View style={styles.planLeft}>
                <View style={[styles.planIcon, { backgroundColor: "#dcfce3" }]}>
                  <Star size={16} color="#16a34a" />
                </View>
                <Text style={styles.planText}>Gói PREMIUM</Text>
              </View>
              <Text style={styles.planValue}>
                {formatNumber(dashboardData.users.byPlan.PREMIUM)}
              </Text>
            </View>

            <View style={[styles.planItem, { borderBottomWidth: 0 }]}>
              <View style={styles.planLeft}>
                <View style={[styles.planIcon, { backgroundColor: "#fef3c7" }]}>
                  <Crown size={16} color="#d97706" />
                </View>
                <Text style={styles.planText}>Gói VIP</Text>
              </View>
              <Text style={styles.planValue}>
                {formatNumber(dashboardData.users.byPlan.VIP)}
              </Text>
            </View>
          </View>
        </>
      ) : null}
    </View>
  );

  // ==========================================
  // MOBILE RENDER: QUẢN LÝ NGƯỜI DÙNG
  // ==========================================
  const renderUsersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchBar}>
        <Search size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm email hoặc tên..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={fetchUsersData}>
          <Text style={styles.searchBtnText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {loadingUsers && !refreshing ? (
        <ActivityIndicator
          size="large"
          color="#16a34a"
          style={{ marginTop: 50 }}
        />
      ) : (
        usersData.map((user, idx) => (
          <View key={idx} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.fullName || "Chưa cập nhật tên"}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
            </View>

            <View style={styles.userTags}>
              <View style={styles.tagRole}>
                <Text style={styles.tagRoleText}>{user.role}</Text>
              </View>
              <View
                style={[
                  styles.tagPlan,
                  user.plan === "VIP"
                    ? { backgroundColor: "#fef3c7" }
                    : user.plan === "PREMIUM"
                      ? { backgroundColor: "#dcfce3" }
                      : {},
                ]}
              >
                <Text
                  style={[
                    styles.tagPlanText,
                    user.plan === "VIP"
                      ? { color: "#d97706" }
                      : user.plan === "PREMIUM"
                        ? { color: "#16a34a" }
                        : {},
                  ]}
                >
                  {user.plan}
                </Text>
              </View>
              <Text style={styles.userDate}>
                {new Date(user.createdAt).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  // ==========================================
  // MOBILE RENDER: BÁO CÁO (REPORT)
  // ==========================================
  const renderReportTab = () => (
    <View style={styles.tabContent}>
      {loadingReport && !refreshing ? (
        <ActivityIndicator
          size="large"
          color="#16a34a"
          style={{ marginTop: 50 }}
        />
      ) : reportData ? (
        <>
          <View style={styles.reportSummaryCard}>
            <Text style={styles.reportSummaryTitle}>Tổng Kết Năm Nay</Text>
            <View style={styles.reportRow}>
              <View>
                <Text style={styles.reportLabel}>Tổng Doanh Thu</Text>
                <Text style={styles.reportBigValue}>
                  {formatCurrency(reportData.summary.totalRevenue)}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.reportLabel}>Giao Dịch</Text>
                <Text style={styles.reportBigValue}>
                  {reportData.summary.totalTransactions}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionHeading}>Chi tiết theo tháng</Text>

          {reportData.data.map((item: any, idx: number) => (
            <View key={idx} style={styles.monthCard}>
              <View style={styles.monthHeader}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Calendar size={18} color="#64748b" />
                  <Text style={styles.monthText}>Tháng {item._id}</Text>
                </View>
                <View style={styles.revenueBadge}>
                  <Text style={styles.revenueBadgeText}>
                    {formatCurrency(item.totalRevenue)}
                  </Text>
                </View>
              </View>
              <View style={styles.monthDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Số giao dịch:</Text>
                  <Text style={styles.detailValue}>
                    {item.totalTransactions}
                  </Text>
                </View>
                {item.byPlan.map((plan: any, i: number) => (
                  <View key={i} style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Gói {plan.plan}:</Text>
                    <Text style={styles.detailValue}>
                      {formatCurrency(plan.revenue)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </>
      ) : null}
    </View>
  );

  // ==========================================
  // MOBILE RENDER: PHẢN HỒI (FEEDBACK)
  // ==========================================
  const renderFeedbackTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.feedbackTabs}>
        <TouchableOpacity
          style={[
            styles.feedbackTabBtn,
            feedbackStatus === "PENDING" && styles.feedbackTabBtnActive,
          ]}
          onPress={() => setFeedbackStatus("PENDING")}
        >
          <Clock
            size={16}
            color={feedbackStatus === "PENDING" ? "#fff" : "#64748b"}
          />
          <Text
            style={[
              styles.feedbackTabText,
              feedbackStatus === "PENDING" && { color: "#fff" },
            ]}
          >
            Chờ xử lý
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.feedbackTabBtn,
            feedbackStatus === "REPLIED" && styles.feedbackTabBtnActive,
          ]}
          onPress={() => setFeedbackStatus("REPLIED")}
        >
          <CheckCircle2
            size={16}
            color={feedbackStatus === "REPLIED" ? "#fff" : "#64748b"}
          />
          <Text
            style={[
              styles.feedbackTabText,
              feedbackStatus === "REPLIED" && { color: "#fff" },
            ]}
          >
            Đã trả lời
          </Text>
        </TouchableOpacity>
      </View>

      {loadingFeedback && !refreshing ? (
        <ActivityIndicator
          size="large"
          color="#16a34a"
          style={{ marginTop: 50 }}
        />
      ) : feedbacks.length === 0 ? (
        <Text style={styles.emptyText}>
          Không có phản hồi nào trong mục này.
        </Text>
      ) : (
        feedbacks.map((fb, idx) => (
          <View key={idx} style={styles.feedbackCard}>
            <View style={styles.fbHeader}>
              <View>
                <Text style={styles.fbName}>
                  {fb.userId?.fullName || "Người dùng ẩn danh"}
                </Text>
                <Text style={styles.fbEmail}>{fb.userId?.email}</Text>
              </View>
              <View style={styles.fbCategoryBadge}>
                <Text style={styles.fbCategoryText}>{fb.category}</Text>
              </View>
            </View>

            <View style={styles.fbContentBox}>
              <Text style={styles.fbContentText}>{fb.content}</Text>
              <Text style={styles.fbDate}>
                {new Date(fb.createdAt).toLocaleDateString("vi-VN")} lúc{" "}
                {new Date(fb.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>

            {feedbackStatus === "PENDING" ? (
              replyingId === fb._id ? (
                <View style={styles.replyBox}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Nhập câu trả lời của Admin..."
                    multiline
                    value={replyContent}
                    onChangeText={setReplyContent}
                  />
                  <View style={styles.replyActions}>
                    <TouchableOpacity
                      style={styles.cancelReplyBtn}
                      onPress={() => {
                        setReplyingId(null);
                        setReplyContent("");
                      }}
                    >
                      <Text style={styles.cancelReplyText}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.submitReplyBtn}
                      onPress={() => handleReplySubmit(fb._id)}
                      disabled={isSubmittingReply}
                    >
                      {isSubmittingReply ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Send size={16} color="#fff" />
                          <Text style={styles.submitReplyText}>
                            Gửi trả lời
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.openReplyBtn}
                  onPress={() => setReplyingId(fb._id)}
                >
                  <MessageSquare size={16} color="#16a34a" />
                  <Text style={styles.openReplyText}>Trả lời phản hồi này</Text>
                </TouchableOpacity>
              )
            ) : (
              <View style={styles.repliedBox}>
                <Text style={styles.repliedLabel}>Admin đã trả lời:</Text>
                <Text style={styles.repliedContent}>{fb.adminReply}</Text>
                <Text style={styles.fbDate}>
                  Trả lời lúc:{" "}
                  {new Date(fb.repliedAt).toLocaleDateString("vi-VN")}{" "}
                  {new Date(fb.repliedAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 🔥 MOBILE HEADER: THÔNG TIN ADMIN + NÚT ĐĂNG XUẤT */}
      <View
        style={[styles.headerMobile, { paddingTop: Math.max(insets.top, 16) }]}
      >
        <View style={styles.adminProfileRow}>
          <View style={styles.adminAvatar}>
            <Text style={styles.adminAvatarText}>
              {adminInfo?.fullName
                ? adminInfo.fullName.charAt(0).toUpperCase()
                : "A"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.adminName} numberOfLines={1}>
              {adminInfo?.fullName || "Quản trị viên"}
            </Text>
            <Text style={styles.adminEmail} numberOfLines={1}>
              {adminInfo?.email || "admin@agri-scan.com"}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtnIcon} onPress={handleLogout}>
          <LogOut size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* 🔥 SCROLLVIEW VỚI PULL-TO-REFRESH */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#16a34a"]}
            tintColor="#16a34a"
          />
        }
      >
        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {activeTab === "DASHBOARD" && renderDashboardTab()}
        {activeTab === "USERS" && renderUsersTab()}
        {activeTab === "REPORT" && renderReportTab()}
        {activeTab === "FEEDBACK" && renderFeedbackTab()}
      </ScrollView>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => setActiveTab("DASHBOARD")}
        >
          <LayoutDashboard
            size={24}
            color={activeTab === "DASHBOARD" ? "#16a34a" : "#94a3b8"}
          />
          <Text
            style={[
              styles.bottomTabText,
              activeTab === "DASHBOARD" && styles.bottomTabTextActive,
            ]}
          >
            Tổng quan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => setActiveTab("USERS")}
        >
          <Users
            size={24}
            color={activeTab === "USERS" ? "#16a34a" : "#94a3b8"}
          />
          <Text
            style={[
              styles.bottomTabText,
              activeTab === "USERS" && styles.bottomTabTextActive,
            ]}
          >
            Tài khoản
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => setActiveTab("REPORT")}
        >
          <BarChart3
            size={24}
            color={activeTab === "REPORT" ? "#16a34a" : "#94a3b8"}
          />
          <Text
            style={[
              styles.bottomTabText,
              activeTab === "REPORT" && styles.bottomTabTextActive,
            ]}
          >
            Báo cáo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => setActiveTab("FEEDBACK")}
        >
          <View style={{ position: "relative" }}>
            <MessageSquare
              size={24}
              color={activeTab === "FEEDBACK" ? "#16a34a" : "#94a3b8"}
            />
            {/* 🔥 HIỆN CHẤM ĐỎ THÔNG BÁO NẾU CÓ FEEDBACK CHỜ XỬ LÝ */}
            {pendingFeedbackCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>
                  {pendingFeedbackCount > 99 ? "99+" : pendingFeedbackCount}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.bottomTabText,
              activeTab === "FEEDBACK" && styles.bottomTabTextActive,
            ]}
          >
            Phản hồi
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  // Header hiển thị thông tin Admin
  headerMobile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  adminProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  adminAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#16a34a",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  adminAvatarText: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  greetingText: { fontSize: 12, color: "#64748b", marginBottom: 2 },
  adminName: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  adminEmail: { fontSize: 12, color: "#94a3b8" },

  // Nút đăng xuất tinh gọn
  logoutBtnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  scrollContainer: { flex: 1, padding: 16 },
  tabContent: { paddingBottom: 40 },
  errorBox: {
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: { color: "#dc2626", textAlign: "center", fontWeight: "bold" },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 10,
    marginBottom: 12,
  },

  // Dashboard Tab
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  statCardMobile: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  halfCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBox: { padding: 8, borderRadius: 12 },
  statTitle: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
  },
  statTrend: { fontSize: 12, color: "#10b981", fontWeight: "600" },
  cardContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 16,
  },
  planItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  planLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  planIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  planText: { fontSize: 14, fontWeight: "600", color: "#334155" },
  planValue: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },

  // Users Tab
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    marginLeft: 8,
    outlineStyle: "none" as any,
  },
  searchBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchBtnText: { color: "#fff", fontWeight: "bold" },
  userCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  userHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: "bold", color: "#2563eb" },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  userEmail: { fontSize: 13, color: "#64748b" },
  userTags: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  tagRole: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagRoleText: { fontSize: 11, fontWeight: "bold", color: "#475569" },
  tagPlan: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagPlanText: { fontSize: 11, fontWeight: "bold", color: "#64748b" },
  userDate: {
    flex: 1,
    textAlign: "right",
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },

  // Report Tab
  reportSummaryCard: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  reportSummaryTitle: {
    fontSize: 16,
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: 16,
  },
  reportRow: { flexDirection: "row", justifyContent: "space-between" },
  reportLabel: { fontSize: 12, color: "#cbd5e1", marginBottom: 4 },
  reportBigValue: { fontSize: 24, fontWeight: "900", color: "#fff" },
  monthCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  monthText: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  revenueBadge: {
    backgroundColor: "#dcfce3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  revenueBadgeText: { fontSize: 14, fontWeight: "bold", color: "#16a34a" },
  monthDetails: { gap: 8 },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: { fontSize: 14, color: "#64748b" },
  detailValue: { fontSize: 14, fontWeight: "600", color: "#334155" },

  // Feedback Tab
  feedbackTabs: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  feedbackTabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  feedbackTabBtnActive: { backgroundColor: "#16a34a" },
  feedbackTabText: { fontSize: 14, fontWeight: "bold", color: "#64748b" },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#94a3b8",
    fontSize: 15,
  },
  feedbackCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  fbHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  fbName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  fbEmail: { fontSize: 13, color: "#64748b" },
  fbCategoryBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fbCategoryText: { fontSize: 11, fontWeight: "bold", color: "#d97706" },
  fbContentBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  fbContentText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
    marginBottom: 8,
  },
  fbDate: { fontSize: 11, color: "#94a3b8", textAlign: "right" },
  openReplyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdf4",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    gap: 8,
  },
  openReplyText: { fontSize: 14, fontWeight: "bold", color: "#16a34a" },
  replyBox: { marginTop: 8 },
  replyInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  replyActions: { flexDirection: "row", gap: 12 },
  cancelReplyBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelReplyText: { fontSize: 14, fontWeight: "bold", color: "#64748b" },
  submitReplyBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  submitReplyText: { fontSize: 14, fontWeight: "bold", color: "#fff" },
  repliedBox: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
  },
  repliedLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#16a34a",
    marginBottom: 4,
  },
  repliedContent: {
    fontSize: 14,
    color: "#15803d",
    marginBottom: 8,
    lineHeight: 20,
  },

  // Bottom Navigation Bar
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    justifyContent: "space-around",
  },
  bottomTab: { alignItems: "center", justifyContent: "center", flex: 1 },
  bottomTabText: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
    fontWeight: "600",
  },
  bottomTabTextActive: { color: "#16a34a", fontWeight: "bold" },

  // CSS chấm đỏ thông báo
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  notificationText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
});
