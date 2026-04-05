import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Search,
  Clock3,
  Flame,
  Bookmark,
  Heart,
} from "lucide-react-native";

export default function TipsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  // DỮ LIỆU TĨNH GỐC CỦA BẠN
  const blogs = [
    {
      id: 1,
      title: "Bí quyết ủ phân hữu cơ tại nhà không mùi",
      category: "Phân bón",
      time: "5 phút đọc",
      img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=600",
      isHot: true,
    },
    {
      id: 2,
      title: "Lịch tưới nước chuẩn cho cây sầu riêng mùa khô",
      category: "Tưới tiêu",
      time: "3 phút đọc",
      img: "https://images.unsplash.com/photo-1592424006691-88b0e74f11d1?q=80&w=600",
      isHot: false,
    },
    {
      id: 3,
      title: "Phòng ngừa bọ trĩ phá hoại hoa hồng mùa nắng",
      category: "Sâu bệnh",
      time: "4 phút đọc",
      img: "https://images.unsplash.com/photo-1496062031456-07b8f162a322?q=80&w=600",
      isHot: true,
    },
  ];

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafaf9" />

      {/* HEADER & THANH TÌM KIẾM */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cẩm Nang Agri-Scan</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Bookmark size={22} color="#475569" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Tổng hợp kiến thức, bí quyết bón phân và chăm sóc cây trồng từ chuyên
          gia.
        </Text>

        <View style={styles.searchContainer}>
          <Search size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bài viết, bí quyết..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* DANH SÁCH BÀI VIẾT (TĨNH) */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredBlogs.map((blog) => (
          <TouchableOpacity
            key={blog.id}
            style={styles.tipCard}
            activeOpacity={0.8}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: blog.img }} style={styles.tipImage} />
              {blog.isHot && (
                <View style={styles.hotBadge}>
                  <Flame size={12} color="#fff" />
                  <Text style={styles.hotText}>HOT</Text>
                </View>
              )}
            </View>

            <View style={styles.tipContent}>
              <View style={styles.tipMetaHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{blog.category}</Text>
                </View>
                <View style={styles.readTimeBox}>
                  <Clock3 size={12} color="#94a3b8" />
                  <Text style={styles.readTimeText}>{blog.time}</Text>
                </View>
              </View>

              <Text style={styles.tipTitle} numberOfLines={2}>
                {blog.title}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.authorText}>By AgriExpert</Text>
                <View style={styles.interactionRow}>
                  <TouchableOpacity style={styles.miniIconBtn}>
                    <Heart size={16} color="#94a3b8" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.miniIconBtn}>
                    <Bookmark size={16} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafaf9" },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#111827" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 20,
    paddingRight: 20,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: { marginRight: 12 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1e293b",
    outlineStyle: "none" as any,
  },

  scrollContent: { padding: 16, paddingBottom: 40 },

  tipCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  imageContainer: { position: "relative" },
  tipImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  hotBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  hotText: { color: "#fff", fontSize: 11, fontWeight: "bold" },

  tipContent: { padding: 16 },
  tipMetaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: { fontSize: 12, fontWeight: "bold", color: "#16a34a" },
  readTimeBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  readTimeText: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },

  tipTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: 26,
    marginVertical: 12,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  authorText: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  interactionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  miniIconBtn: { padding: 4 },
});
