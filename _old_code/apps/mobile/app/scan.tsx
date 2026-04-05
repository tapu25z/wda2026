import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Send,
  Camera as CameraIcon,
  X,
  Leaf,
  User,
  Plus,
  PanelLeft,
  MessageSquare,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react-native";

import { scanApi } from "@agri-scan/shared";

const { width } = Dimensions.get("window");

interface Message {
  id: string;
  text?: string;
  image?: string;
  sender: "user" | "bot";
  timestamp: Date;
  scanResult?: any;
}

const getDateGroup = (date: string | Date): string => {
  const d = new Date(date);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (todayStart.getTime() -
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays <= 7) return "7 ngày trước";
  return "30 ngày trước";
};

export default function ScanChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"chat" | "scan">(
    "chat",
  );
  const [currentScanLabel, setCurrentScanLabel] = useState<string | undefined>(
    undefined,
  );

  type SessionItem = {
    id: string;
    title: string;
    updatedAt: Date;
    type: "chat" | "scan";
    scanHistoryId?: string;
    rawData?: any;
  };
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(
    undefined,
  );
  const [lastSyncedSessionId, setLastSyncedSessionId] = useState<
    string | undefined
  >(undefined);

  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchSidebarData();
  }, []);

  useEffect(() => {
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      100,
    );
  }, [messages, isBotTyping]);

  const fetchSidebarData = async () => {
    try {
      const chatSessionsApi = await scanApi.getChatHistory();
      const scanItems = await scanApi.getScanHistory();

      const merged: SessionItem[] = [];

      (chatSessionsApi || []).forEach((s) => {
        merged.push({
          id: s.sessionId,
          title: s.title || "Trò chuyện",
          updatedAt: new Date(s.updatedAt),
          type: "chat",
        });
      });

      (scanItems || []).forEach((s: any) => {
        const rawId = s.id ?? s.scanHistoryId ?? s._id;
        const topDiseaseInfo = s.aiPredictions?.[0]?.diseaseId;
        const topName =
          topDiseaseInfo?.name || s.topPrediction?.diseaseName || "Quét ảnh";
        const scannedAt =
          s.scannedAt ?? s.createdAt ?? s.updatedAt ?? Date.now();

        merged.push({
          id: `scan-${rawId}`,
          title: topName,
          updatedAt: new Date(scannedAt),
          type: "scan",
          scanHistoryId: rawId,
          rawData: s,
        });
      });

      merged.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      setSessions(merged);
    } catch (error) {
      console.log("Lỗi lấy dữ liệu sidebar:", error);
    }
  };

  const loadChatSession = async (sessionId: string) => {
    try {
      const detail = await scanApi.getSessionMessages(sessionId);
      if (detail && detail.messages) {
        const loadedMsgs: Message[] = detail.messages.map(
          (msg: any, index: number) => ({
            id: `${sessionId}-${index}`,
            text: msg.content,
            sender: (msg.role === "user" ? "user" : "bot") as "user" | "bot",
            timestamp: new Date(msg.timestamp),
          }),
        );
        setMessages(loadedMsgs);
        setLastSyncedSessionId(sessionId);
      } else {
        setMessages([]);
        setLastSyncedSessionId(sessionId);
      }
    } catch (error) {
      console.log("Lỗi tải tin nhắn:", error);
      setMessages([]);
    }
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setIsSidebarOpen(false));
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputText("");
    setSelectedImage(null);
    setCurrentSessionId(undefined);
    setLastSyncedSessionId(undefined);
    setCurrentScanLabel(undefined);
    closeSidebar();
  };

  const loadScanSessionFromData = (detail: any) => {
    try {
      const rawId = detail.id ?? detail.scanHistoryId ?? detail._id;
      const imageUrl =
        detail.imageUrl ?? detail.image ?? detail.image?.url ?? undefined;

      const topPrediction =
        detail.aiPredictions?.[0] || detail.predictions?.[0];
      const diseaseInfo = topPrediction?.diseaseId ?? detail.topDisease;

      const fakeResult = {
        predictions: [{ confidence: topPrediction?.confidence || 0 }],
        topDisease: diseaseInfo,
      };

      const scanTime = new Date(
        detail.scannedAt ?? detail.createdAt ?? Date.now(),
      );

      setMessages([
        {
          id: `scan-user-${rawId}`,
          image: imageUrl,
          sender: "user",
          timestamp: scanTime,
        },
        {
          id: `scan-bot-${rawId}`,
          text: "Kết quả chẩn đoán",
          sender: "bot",
          timestamp: new Date(scanTime.getTime() + 1000),
          scanResult: fakeResult,
        },
      ]);

      setLastSyncedSessionId(undefined);
      setCurrentSessionId(undefined);
    } catch (err) {
      console.log("Lỗi hiển thị chi tiết quét:", err);
      setMessages([]);
    }
  };

  const handleSelectSession = async (session: SessionItem) => {
    if (session.type === "chat") {
      setCurrentSessionId(session.id);
      await loadChatSession(session.id);
    } else if (session.type === "scan" && session.rawData) {
      loadScanSessionFromData(session.rawData);
    }
    closeSidebar();
  };

  // =================================================================
  // 🔥 XỬ LÝ QUYỀN MÁY ẢNH VÀ THƯ VIỆN ẢNH CHUẨN XÁC NHẤT
  // =================================================================

  const handleOpenCamera = async () => {
    if (Platform.OS === "web") {
      alert(
        "Máy ảnh không hỗ trợ trên trình duyệt, vui lòng dùng nút chọn ảnh.",
      );
      return;
    }

    try {
      const currentPerm = await ImagePicker.getCameraPermissionsAsync();

      if (currentPerm?.status !== "granted") {
        const newPerm = await ImagePicker.requestCameraPermissionsAsync();

        if (newPerm?.status !== "granted") {
          Alert.alert(
            "Cấp quyền Máy ảnh",
            "Agri-Scan cần quyền truy cập máy ảnh để bạn có thể chụp hình cây trồng. Vui lòng mở Cài đặt của điện thoại và cho phép.",
            [
              { text: "Đóng", style: "cancel" },
              { text: "Mở Cài đặt", onPress: () => Linking.openSettings() },
            ],
          );
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Lỗi mở camera:", error);
      Alert.alert(
        "Lỗi",
        "Không thể mở máy ảnh. Lưu ý: Máy ảo (Emulator) có thể không hỗ trợ camera.",
      );
    }
  };

  const pickImage = async () => {
    try {
      const currentPerm = await ImagePicker.getMediaLibraryPermissionsAsync();

      if (currentPerm?.status !== "granted") {
        const newPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (newPerm?.status !== "granted") {
          Alert.alert(
            "Cấp quyền Thư viện ảnh",
            "Agri-Scan cần quyền truy cập bộ sưu tập để bạn tải ảnh lên chẩn đoán. Vui lòng mở Cài đặt của điện thoại và cho phép.",
            [
              { text: "Đóng", style: "cancel" },
              { text: "Mở Cài đặt", onPress: () => Linking.openSettings() },
            ],
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
        allowsEditing: false,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Lỗi chọn ảnh:", error);
    }
  };

  // =================================================================

  const handleSend = async () => {
    if (!inputText.trim() && !selectedImage) return;

    if (lastSyncedSessionId && !currentSessionId) {
      alert(
        "Bạn đang xem lịch sử chat cũ.\n\nHãy bấm nút '+' để tạo cuộc trò chuyện mới trước khi gửi tin nhắn!",
      );
      return;
    }

    const userText = inputText.trim();
    const userImage = selectedImage;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: userText || undefined,
        image: userImage || undefined,
        sender: "user",
        timestamp: new Date(),
      },
    ]);

    setInputText("");
    setSelectedImage(null);
    setIsBotTyping(true);

    try {
      if (userImage) {
        // 🔥 CẬP NHẬT LOGIC MỚI: Xử lý file chuẩn Web/Mobile
        let fileToUpload: any;

        if (Platform.OS === "web") {
          const response = await fetch(userImage);
          const blob = await response.blob();
          const FileRef = (window as any).File;
          fileToUpload = new FileRef([blob], "upload.jpg", {
            type: blob.type || "image/jpeg",
          });
        } else {
          fileToUpload = {
            uri: userImage,
            name: "upload.jpg",
            type: "image/jpeg",
          };
        }

        // 🔥 CẬP NHẬT API MỚI: Dùng scanImageAndWait để đợi AI trả kết quả
        const result = await scanApi.scanImageAndWait(fileToUpload);

        // Lưu label bệnh hàng đầu để dùng trong các tin nhắn tiếp theo
        const topLabel = result.topDisease?.name;
        if (topLabel) {
          setCurrentScanLabel(topLabel);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: "Kết quả chẩn đoán",
            sender: "bot",
            timestamp: new Date(),
            scanResult: result, // result giờ đã là full object có topDisease và predictions
          },
        ]);
        fetchSidebarData();
      } else if (userText) {
        // 🔥 CẬP NHẬT API MỚI: Dùng chatAndWait
        const aiResponse = await scanApi.chatAndWait(
          userText,
          currentScanLabel || "Cây trồng",
          currentSessionId || undefined,
        );

        if (aiResponse.sessionId && !currentSessionId) {
          setCurrentSessionId(aiResponse.sessionId);
          setLastSyncedSessionId(undefined);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: aiResponse.answer,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        await fetchSidebarData();
      }
    } catch (error: any) {
      console.log("🔥 LỖI THẬT SỰ:", error?.response?.data || error.message);
      const status = error?.response?.status;
      const backendMsg = error?.response?.data?.message;

      let errorText = "Có lỗi kết nối máy chủ. Vui lòng thử lại sau.";

      if (status === 401) {
        errorText = "Bạn cần đăng nhập để sử dụng tính năng này.";
      } else if (status === 400) {
        const detail = Array.isArray(backendMsg) ? backendMsg[0] : backendMsg;
        errorText = `Lỗi dữ liệu: ${detail || "Ảnh không hợp lệ."}`;
        if (errorText.includes("expected size is less than")) {
          errorText = "Ảnh quá nặng (> 10MB). Vui lòng chọn ảnh khác nhẹ hơn!";
        }
      } else if (status === 500) {
        errorText =
          "Hệ thống AI đang quá tải. Vui lòng đợi một lát rồi gửi lại!";
      } else if (error.message === "Network Error") {
        errorText = "Lỗi mạng hoặc ảnh bị hỏng. Hãy thử ảnh khác!";
      } else {
        errorText = `Lỗi: ${error.message}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `⚠️ ${errorText}`,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const formatDate = (dateStr: string | Date) =>
    new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // Helper function để render treatments an toàn cho cả Backend cũ và mới
  const renderTreatments = (treatmentsData: any) => {
    if (!treatmentsData) return null;

    // Backend mới: treatments là array of strings
    if (
      Array.isArray(treatmentsData) &&
      treatmentsData.length > 0 &&
      typeof treatmentsData[0] === "string"
    ) {
      return (
        <View style={styles.treatmentsSection}>
          <Text style={styles.sectionTitle}>Phương pháp điều trị:</Text>
          {treatmentsData.map((step: string, idx: number) => (
            <Text key={`flat-${idx}`} style={styles.treatmentText}>
              • {step}
            </Text>
          ))}
        </View>
      );
    }

    // Backend cũ: treatments là object có biological, chemical, preventive
    if (typeof treatmentsData === "object" && !Array.isArray(treatmentsData)) {
      return (
        <View style={styles.treatmentsSection}>
          <Text style={styles.sectionTitle}>Phương pháp điều trị:</Text>

          {treatmentsData.biological &&
            treatmentsData.biological.length > 0 && (
              <View style={styles.treatmentSubSection}>
                <Text style={styles.treatmentSubTitle}>
                  🌱 Sinh học (Organic):
                </Text>
                {treatmentsData.biological.map(
                  (treatment: string, idx: number) => (
                    <Text key={`bio-${idx}`} style={styles.treatmentText}>
                      {treatment}
                    </Text>
                  ),
                )}
              </View>
            )}

          {treatmentsData.chemical && treatmentsData.chemical.length > 0 && (
            <View style={styles.treatmentSubSection}>
              <Text style={styles.treatmentSubTitle}>
                🧪 Hóa học (Chemical):
              </Text>
              {treatmentsData.chemical.map((treatment: string, idx: number) => (
                <Text key={`chem-${idx}`} style={styles.treatmentText}>
                  {treatment}
                </Text>
              ))}
            </View>
          )}

          {treatmentsData.preventive &&
            treatmentsData.preventive.length > 0 && (
              <View style={styles.treatmentSubSection}>
                <Text style={styles.treatmentSubTitle}>
                  🛡️ Phòng ngừa (Preventive):
                </Text>
                {treatmentsData.preventive.map(
                  (treatment: string, idx: number) => (
                    <Text key={`prev-${idx}`} style={styles.treatmentText}>
                      {treatment}
                    </Text>
                  ),
                )}
              </View>
            )}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 10 }]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconBtn}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={openSidebar}
            style={[styles.iconBtn, { marginLeft: 4 }]}
          >
            <PanelLeft size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Agri-Scan AI</Text>
        <TouchableOpacity onPress={handleNewChat} style={styles.iconBtn}>
          <Plus size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <Modal visible={isSidebarOpen} transparent={true} animationType="none">
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={closeSidebar}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.leftDrawer,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View
              style={[
                styles.sidebarContent,
                { paddingTop: Math.max(insets.top, 10) + 10 },
              ]}
            >
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>Lịch sử hoạt động</Text>
                <TouchableOpacity onPress={closeSidebar}>
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    activeSidebarTab === "chat"
                      ? styles.tabBtnActive
                      : undefined,
                  ]}
                  onPress={() => setActiveSidebarTab("chat")}
                >
                  <MessageSquare
                    size={16}
                    color={activeSidebarTab === "chat" ? "#86efac" : "#9ca3af"}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeSidebarTab === "chat"
                        ? styles.tabTextActive
                        : undefined,
                    ]}
                  >
                    {" "}
                    Trò chuyện
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    activeSidebarTab === "scan"
                      ? styles.tabBtnActive
                      : undefined,
                  ]}
                  onPress={() => setActiveSidebarTab("scan")}
                >
                  <ImageIcon
                    size={16}
                    color={activeSidebarTab === "scan" ? "#86efac" : "#9ca3af"}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeSidebarTab === "scan"
                        ? styles.tabTextActive
                        : undefined,
                    ]}
                  >
                    {" "}
                    Ảnh quét
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.historyList}
                showsVerticalScrollIndicator={false}
              >
                {activeSidebarTab === "chat" ? (
                  <>
                    <TouchableOpacity
                      style={styles.newChatSidebarBtn}
                      onPress={handleNewChat}
                    >
                      <Plus size={18} color="#fff" />
                      <Text style={styles.newChatSidebarText}>
                        Cuộc trò chuyện mới
                      </Text>
                    </TouchableOpacity>
                    {sessions.filter((s) => s.type === "chat").length === 0 ? (
                      <Text style={styles.emptySidebarTxt}>
                        Chưa có lịch sử nào
                      </Text>
                    ) : (
                      [
                        "Hôm nay",
                        "Hôm qua",
                        "7 ngày trước",
                        "30 ngày trước",
                      ].map((group) => {
                        const groupSessions = sessions.filter(
                          (h) =>
                            h.type === "chat" &&
                            getDateGroup(h.updatedAt) === group,
                        );
                        if (groupSessions.length === 0) return null;
                        return (
                          <View key={group}>
                            <Text style={styles.dateGroupHeader}>{group}</Text>
                            {groupSessions.map((item) => (
                              <TouchableOpacity
                                key={item.id}
                                style={[
                                  styles.historyItem,
                                  currentSessionId === item.id &&
                                  item.type === "chat"
                                    ? styles.historyItemActive
                                    : undefined,
                                ]}
                                onPress={() => handleSelectSession(item)}
                              >
                                <MessageSquare
                                  size={18}
                                  color={
                                    currentSessionId === item.id &&
                                    item.type === "chat"
                                      ? "#fff"
                                      : "#86efac"
                                  }
                                />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                  <Text
                                    style={[
                                      styles.historyText,
                                      currentSessionId === item.id &&
                                      item.type === "chat"
                                        ? { color: "#fff" }
                                        : undefined,
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {item.title}
                                  </Text>
                                  <Text style={styles.historyDate}>
                                    {formatDate(item.updatedAt)}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </View>
                        );
                      })
                    )}
                  </>
                ) : sessions.filter((s) => s.type === "scan").length === 0 ? (
                  <Text style={styles.emptySidebarTxt}>
                    Chưa có lịch sử quét ảnh
                  </Text>
                ) : (
                  sessions
                    .filter((s) => s.type === "scan")
                    .map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.historyItem}
                        onPress={() => handleSelectSession(item)}
                      >
                        <ImageIcon size={18} color="#86efac" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.historyText} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.historyDate}>
                            {formatDate(item.updatedAt)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                )}
              </ScrollView>

              <View
                style={[
                  styles.sidebarFooter,
                  { paddingBottom: Math.max(insets.bottom, 20) },
                ]}
              >
                <TouchableOpacity
                  style={styles.upgradeBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    closeSidebar();
                    setTimeout(() => router.push("/upgrade"), 300);
                  }}
                >
                  <View style={styles.upgradeIconWrapper}>
                    <Leaf size={20} color="#ca8a04" />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.upgradeTitle}>Nâng cấp gói</Text>
                    <Text style={styles.upgradeSub}>
                      Mở khóa tính năng cao cấp
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.botAvatarLarge}>
                <Leaf size={36} color="#16a34a" />
              </View>
              <Text style={styles.emptyTitle}>Agri-Scan AI</Text>
              <Text style={styles.emptyDesc}>
                Trợ lý nông nghiệp thông minh của bạn. Hãy hỏi tôi về bệnh cây
                trồng, cách chăm sóc hoặc gửi ảnh để chẩn đoán.
              </Text>
            </View>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageWrapper,
                  msg.sender === "user" ? styles.msgRight : styles.msgLeft,
                ]}
              >
                {msg.sender === "bot" && (
                  <View style={styles.botAvatarSmall}>
                    <Leaf size={14} color="#fff" />
                  </View>
                )}
                <View
                  style={
                    msg.sender === "user"
                      ? styles.messageContentUser
                      : styles.messageContentBot
                  }
                >
                  <Text style={styles.senderLabel}>
                    {msg.sender === "user" ? "Bạn" : "Agri-Scan AI"}
                  </Text>
                  <View
                    style={[
                      styles.messageBubble,
                      msg.sender === "user"
                        ? styles.bubbleUser
                        : styles.bubbleBot,
                    ]}
                  >
                    {msg.image && (
                      <Image
                        source={{ uri: msg.image }}
                        style={styles.msgImage}
                      />
                    )}

                    {msg.scanResult ? (
                      <View style={styles.scanResultContainer}>
                        <Text style={styles.diagnosisTitle}>
                          Kết quả chẩn đoán
                        </Text>
                        <View style={styles.diseaseSection}>
                          <Text style={styles.diseaseLabel}>
                            Bệnh phát hiện:{" "}
                          </Text>
                          <Text style={styles.diseaseName}>
                            {msg.scanResult.topDisease?.name ||
                              "Không xác định"}
                          </Text>
                          <Text style={styles.confidenceText}>
                            Độ tin cậy:{" "}
                            {Math.round(
                              (msg.scanResult.predictions?.[0]?.confidence ||
                                0) * 100,
                            )}
                            %
                          </Text>
                        </View>

                        {msg.scanResult.topDisease?.symptoms &&
                        msg.scanResult.topDisease.symptoms.length > 0 ? (
                          <View style={styles.symptomsSection}>
                            <Text style={styles.sectionTitle}>
                              Triệu chứng:
                            </Text>
                            {msg.scanResult.topDisease.symptoms.map(
                              (symptom: string, idx: number) => (
                                <Text key={idx} style={styles.bulletText}>
                                  • {symptom}
                                </Text>
                              ),
                            )}
                          </View>
                        ) : null}

                        {/* Gọi hàm render an toàn */}
                        {renderTreatments(
                          msg.scanResult.topDisease?.treatments,
                        )}
                      </View>
                    ) : msg.text ? (
                      <Text
                        style={[
                          styles.msgText,
                          msg.sender === "user"
                            ? styles.textUser
                            : styles.textBot,
                        ]}
                      >
                        {msg.text}
                      </Text>
                    ) : null}
                  </View>
                </View>
                {msg.sender === "user" && (
                  <View style={styles.userAvatarSmall}>
                    <User size={14} color="#4b5563" />
                  </View>
                )}
              </View>
            ))
          )}

          {isBotTyping && (
            <View style={[styles.messageWrapper, styles.msgLeft]}>
              <View style={styles.botAvatarSmall}>
                <Leaf size={14} color="#fff" />
              </View>
              <View style={styles.messageContentBot}>
                <Text style={styles.senderLabel}>Agri-Scan AI</Text>
                <View
                  style={[
                    styles.messageBubble,
                    styles.bubbleBot,
                    { paddingVertical: 14, paddingHorizontal: 16 },
                  ]}
                >
                  <ActivityIndicator size="small" color="#16a34a" />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Math.max(insets.bottom, 10) },
          ]}
        >
          {selectedImage && (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImg}
              />
              <TouchableOpacity
                style={styles.removePreviewBtn}
                onPress={() => setSelectedImage(null)}
              >
                <X size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputWrapper}>
            <View style={styles.inputBar}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={pickImage}
                activeOpacity={0.7}
              >
                <ImageIcon size={22} color="#9ca3af" />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                placeholder="Nhắn tin..."
                placeholderTextColor="#9ca3af"
                multiline
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleOpenCamera}
              >
                <CameraIcon size={22} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  inputText.trim() || selectedImage
                    ? styles.sendBtnActive
                    : styles.sendBtnDisabled,
                ]}
                onPress={handleSend}
                disabled={(!inputText.trim() && !selectedImage) || isBotTyping}
              >
                <Send
                  size={18}
                  color={inputText.trim() || selectedImage ? "#fff" : "#9ca3af"}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.disclaimer}>
              Agri-Scan AI có thể mắc lỗi. Hãy kiểm tra lại thông tin quan
              trọng.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginRight: 24,
  },
  iconBtn: { padding: 8 },
  modalContainer: { flex: 1, flexDirection: "row" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  leftDrawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: "#1B5E20",
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  sidebarContent: { flex: 1 },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sidebarTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: { borderBottomColor: "#86efac" },
  tabText: { fontSize: 13, color: "#9ca3af", fontWeight: "600" },
  tabTextActive: { color: "#86efac" },
  historyList: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  emptySidebarTxt: {
    color: "#86efac",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
    fontSize: 13,
  },
  newChatSidebarBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  newChatSidebarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },
  dateGroupHeader: {
    color: "rgba(134, 239, 172, 0.7)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  historyItemActive: {
    backgroundColor: "rgba(134, 239, 172, 0.2)",
    borderRadius: 12,
  },
  historyText: { color: "#86efac", fontSize: 14, fontWeight: "500" },
  historyDate: { color: "#86efac", fontSize: 11, marginTop: 4, opacity: 0.8 },
  sidebarFooter: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 16,
  },
  upgradeIconWrapper: {
    width: 36,
    height: 36,
    backgroundColor: "#fef08a",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  upgradeTitle: { fontSize: 15, fontWeight: "bold", color: "#fff" },
  upgradeSub: { fontSize: 12, color: "#86efac", marginTop: 2 },
  chatArea: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 16, paddingBottom: 20 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    paddingHorizontal: 20,
  },
  botAvatarLarge: {
    width: 70,
    height: 70,
    backgroundColor: "#dcfce3",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  emptyDesc: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  messageWrapper: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "flex-end",
  },
  msgLeft: { justifyContent: "flex-start" },
  msgRight: { justifyContent: "flex-end" },
  botAvatarSmall: {
    width: 32,
    height: 32,
    backgroundColor: "#16a34a",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userAvatarSmall: {
    width: 32,
    height: 32,
    backgroundColor: "#e5e7eb",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageContentUser: { alignItems: "flex-end", maxWidth: "80%" },
  messageContentBot: { alignItems: "flex-start", maxWidth: "80%" },
  senderLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleUser: { backgroundColor: "#16a34a", borderBottomRightRadius: 4 },
  bubbleBot: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderBottomLeftRadius: 4,
  },
  msgText: { fontSize: 15, lineHeight: 24 },
  textUser: { color: "#fff" },
  textBot: { color: "#374151" },
  scanResultContainer: { padding: 14, maxWidth: "100%" },
  diagnosisTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  diseaseSection: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
  },
  diseaseLabel: { fontSize: 13, fontWeight: "600", color: "#374151" },
  diseaseName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#16a34a",
    marginTop: 4,
  },
  confidenceText: { fontSize: 13, color: "#6b7280", marginTop: 6 },
  symptomsSection: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  bulletText: { fontSize: 13, color: "#374151", lineHeight: 20, marginLeft: 6 },
  treatmentsSection: {
    backgroundColor: "#fff8f0",
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
  },
  treatmentSubSection: { marginBottom: 12 },
  treatmentSubTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#dc2626",
    marginBottom: 6,
  },
  treatmentText: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 18,
    marginBottom: 6,
  },
  msgImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginBottom: 10,
    resizeMode: "cover",
  },
  inputContainer: {
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  inputWrapper: { width: "100%", maxWidth: 600, alignSelf: "center" },
  previewContainer: {
    position: "relative",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  previewImg: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  removePreviewBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 4,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtn: { padding: 10, justifyContent: "center", alignItems: "center" },
  textInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    fontSize: 15,
    color: "#111827",
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 4,
    outlineStyle: "none" as any,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    marginLeft: 4,
  },
  sendBtnActive: {
    backgroundColor: "#16a34a",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: { backgroundColor: "#f3f4f6" },
  disclaimer: {
    textAlign: "center",
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 8,
  },
});
