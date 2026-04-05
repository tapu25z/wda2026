import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import {
  Search,
  Filter,
  X,
  ChevronLeft,
  Droplet,
  Sun,
  TrendingUp,
  Leaf,
} from "lucide-react-native";

// 🔥 IMPORT API THẬT
import { plantApi } from "@agri-scan/shared";

const CATEGORIES = [
  "Cây bóng mát",
  "Cây cảnh quan",
  "Cây lấy gỗ",
  "Cây ăn quả",
  "Cây tâm linh",
  "Cây phong thủy",
];
const GROWTH_RATES = ["Nhanh", "Trung bình", "Chậm"];
const LIGHTS = ["Ưa sáng", "Ưa bóng", "Bán phần"];
const WATERS = ["Ít", "Trung bình", "Nhiều"];

export default function TreeDictionaryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // STATES QUẢN LÝ DỮ LIỆU TỪ API
  const [plants, setPlants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // STATES CHO CHI TIẾT CÂY
  const [selectedTree, setSelectedTree] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // GỌI API LẤY DANH SÁCH LẦN ĐẦU
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setIsLoading(true);
        const data = await plantApi.getAllPlants();
        if (data && data.length > 0) {
          setPlants(data);
        }
      } catch (error) {
        console.log("Lỗi tải danh sách cây:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlants();
  }, []);

  // STATES FILTER
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGrowthRates, setSelectedGrowthRates] = useState<string[]>([]);
  const [selectedLights, setSelectedLights] = useState<string[]>([]);
  const [selectedWaters, setSelectedWaters] = useState<string[]>([]);

  // LỌC DỮ LIỆU DỰA TRÊN API (Chỉ dùng được search do danh sách rút gọn ko có chi tiết)
  const filteredTrees = useMemo(() => {
    return plants.filter((tree) => {
      const matchesSearch =
        tree.commonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tree.scientificName?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [plants, searchTerm]);

  const toggleFilter = (
    item: string,
    current: string[],
    setter: (val: string[]) => void,
  ) => {
    if (current.includes(item)) {
      setter(current.filter((i) => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  const CustomCheckbox = ({
    label,
    isSelected,
    onPress,
  }: {
    label: string;
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={styles.checkboxContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.checkboxBox, isSelected && styles.checkboxSelected]}>
        {isSelected && <View style={styles.checkboxInner} />}
      </View>
      <Text
        style={[
          styles.checkboxLabel,
          isSelected && styles.checkboxLabelSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // HÀM GỌI API LẤY CHI TIẾT KHI BẤM VÀO CARD
  const handleSelectPlant = async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const detail = await plantApi.getPlantById(id);
      setSelectedTree(detail);
    } catch (error) {
      console.log("Lỗi khi tải chi tiết:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết cây. Vui lòng thử lại!");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // CARD HIỂN THỊ ITEM
  const renderTreeCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => handleSelectPlant(item.id || item._id)}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={{
            uri: item.images?.[0] || "https://via.placeholder.com/150",
          }}
          style={styles.cardImage}
        />
        <View style={styles.cardBadgeContainer}>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>
              {item.family || "Thực vật"}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.commonName}
        </Text>
        <Text style={styles.cardSubTitle} numberOfLines={1}>
          {item.scientificName}
        </Text>

        <View style={styles.cardTags}>
          <View
            style={[
              styles.tag,
              {
                backgroundColor:
                  item.status === "APPROVED" ? "#dcfce3" : "#fef08a",
              },
            ]}
          >
            <Text
              style={[
                styles.tagText,
                { color: item.status === "APPROVED" ? "#16a34a" : "#ca8a04" },
              ]}
            >
              {item.status === "APPROVED" ? "Đã duyệt" : "Chờ duyệt"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View
        style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 10 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={28} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Từ Điển Cây Trồng</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* SEARCH BAR & FILTER BTN */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên cây..."
            placeholderTextColor="#9ca3af"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchTerm("")}
              style={{ padding: 4 }}
            >
              <X size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setIsFilterModalOpen(true)}
        >
          <Filter size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* SỐ LƯỢNG KẾT QUẢ */}
      <Text style={styles.resultCount}>
        Tìm thấy {filteredTrees.length} kết quả
      </Text>

      {/* DANH SÁCH CÂY */}
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={[styles.emptyText, { marginTop: 8 }]}>
            Đang tải dữ liệu...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrees}
          keyExtractor={(item) =>
            item.id || item._id || Math.random().toString()
          }
          renderItem={renderTreeCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Không tìm thấy cây nào phù hợp.
              </Text>
            </View>
          }
        />
      )}

      {/* LOADING OVERLAY CHI TIẾT */}
      {isLoadingDetail && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Đang lấy thông tin...</Text>
        </View>
      )}

      {/* ========================================== */}
      {/* MODAL 1: BỘ LỌC (BOTTOM SHEET)               */}
      {/* ========================================== */}
      <Modal
        visible={isFilterModalOpen}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.filterSheet,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            <View style={styles.filterHeader}>
              <Text style={styles.filterHeaderTitle}>Bộ lọc tìm kiếm</Text>
              <TouchableOpacity onPress={() => setIsFilterModalOpen(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Loại cây</Text>
                {CATEGORIES.map((cat) => (
                  <CustomCheckbox
                    key={cat}
                    label={cat}
                    isSelected={selectedCategories.includes(cat)}
                    onPress={() =>
                      toggleFilter(
                        cat,
                        selectedCategories,
                        setSelectedCategories,
                      )
                    }
                  />
                ))}
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Tốc độ sinh trưởng</Text>
                <View style={styles.chipRow}>
                  {GROWTH_RATES.map((rate) => (
                    <TouchableOpacity
                      key={rate}
                      style={[
                        styles.chip,
                        selectedGrowthRates.includes(rate) && styles.chipActive,
                      ]}
                      onPress={() =>
                        toggleFilter(
                          rate,
                          selectedGrowthRates,
                          setSelectedGrowthRates,
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedGrowthRates.includes(rate) &&
                            styles.chipTextActive,
                        ]}
                      >
                        {rate}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Nhu cầu ánh sáng</Text>
                <View style={styles.chipRow}>
                  {LIGHTS.map((light) => (
                    <TouchableOpacity
                      key={light}
                      style={[
                        styles.chip,
                        selectedLights.includes(light) && styles.chipActive,
                      ]}
                      onPress={() =>
                        toggleFilter(light, selectedLights, setSelectedLights)
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedLights.includes(light) &&
                            styles.chipTextActive,
                        ]}
                      >
                        {light}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Nhu cầu nước</Text>
                <View style={styles.chipRow}>
                  {WATERS.map((water) => (
                    <TouchableOpacity
                      key={water}
                      style={[
                        styles.chip,
                        selectedWaters.includes(water) && styles.chipActive,
                      ]}
                      onPress={() =>
                        toggleFilter(water, selectedWaters, setSelectedWaters)
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedWaters.includes(water) &&
                            styles.chipTextActive,
                        ]}
                      >
                        {water}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.filterFooter}>
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => {
                  setSelectedCategories([]);
                  setSelectedGrowthRates([]);
                  setSelectedLights([]);
                  setSelectedWaters([]);
                }}
              >
                <Text style={styles.clearFilterText}>Xóa bộ lọc</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFilterBtn}
                onPress={() => setIsFilterModalOpen(false)}
              >
                <Text style={styles.applyFilterText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 2: CHI TIẾT CÂY DÙNG DATA API         */}
      {/* ========================================== */}
      <Modal visible={!!selectedTree} animationType="slide" transparent={false}>
        <View
          style={[styles.detailContainer, { paddingBottom: insets.bottom }]}
        >
          {selectedTree && (
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Ảnh bìa */}
              <View style={styles.detailImageWrapper}>
                <Image
                  source={{
                    uri:
                      selectedTree.images?.[0] ||
                      "https://via.placeholder.com/600",
                  }}
                  style={styles.detailImage}
                />
                <TouchableOpacity
                  style={[
                    styles.closeDetailBtn,
                    { top: Math.max(insets.top, 20) },
                  ]}
                  onPress={() => setSelectedTree(null)}
                >
                  <X size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.detailBadgeContainer}>
                  {selectedTree.category?.map((cat: string) => (
                    <View key={cat} style={styles.detailBadge}>
                      <Text style={styles.detailBadgeText}>{cat}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Thông tin */}
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>
                  {selectedTree.commonName}
                </Text>
                <Text style={styles.detailScientific}>
                  {selectedTree.scientificName}
                </Text>

                {/* Grid đặc tính */}
                <View style={styles.propsGrid}>
                  <View style={styles.propBox}>
                    <TrendingUp size={18} color="#16a34a" />
                    <View style={styles.propTexts}>
                      <Text style={styles.propLabel}>Sinh trưởng</Text>
                      <Text style={styles.propVal}>
                        {selectedTree.growthRate || "Chưa rõ"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.propBox}>
                    <Sun size={18} color="#eab308" />
                    <View style={styles.propTexts}>
                      <Text style={styles.propLabel}>Ánh sáng</Text>
                      <Text style={styles.propVal}>
                        {selectedTree.light || "Chưa rõ"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.propBox}>
                    <Droplet size={18} color="#3b82f6" />
                    <View style={styles.propTexts}>
                      <Text style={styles.propLabel}>Nước</Text>
                      <Text style={styles.propVal}>
                        {selectedTree.water || "Chưa rõ"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.propBox}>
                    <Leaf size={18} color="#16a34a" />
                    <View style={styles.propTexts}>
                      <Text style={styles.propLabel}>Họ</Text>
                      <Text style={styles.propVal} numberOfLines={1}>
                        {selectedTree.family?.split(" ")[0] || "Thực vật"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Các phần text mô tả */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Mô tả</Text>
                  <Text style={styles.sectionText}>
                    {selectedTree.description || "Đang cập nhật..."}
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Công dụng</Text>
                  <Text style={styles.sectionText}>
                    {selectedTree.uses || "Đang cập nhật..."}
                  </Text>
                </View>

                <View style={[styles.section, styles.careSection]}>
                  <Text style={styles.sectionTitle}>Cách chăm sóc</Text>
                  <Text style={styles.careText}>
                    {selectedTree.care || "Đang cập nhật..."}
                  </Text>
                </View>

                {/* Các thông tin phụ & BỆNH THƯỜNG GẶP TỪ API */}
                {(selectedTree.height ||
                  selectedTree.soil ||
                  (selectedTree.diseasesInfo &&
                    selectedTree.diseasesInfo.length > 0)) && (
                  <View style={styles.extraInfoBox}>
                    {selectedTree.height && (
                      <Text style={styles.extraText}>
                        <Text style={styles.extraBold}>Chiều cao: </Text>
                        {selectedTree.height}
                      </Text>
                    )}
                    {selectedTree.soil && (
                      <Text style={styles.extraText}>
                        <Text style={styles.extraBold}>Đất trồng: </Text>
                        {selectedTree.soil}
                      </Text>
                    )}
                    {selectedTree.diseasesInfo &&
                      selectedTree.diseasesInfo.length > 0 && (
                        <Text style={styles.extraText}>
                          <Text style={styles.extraBold}>
                            Bệnh thường gặp:{" "}
                          </Text>
                          <Text style={{ color: "#dc2626" }}>
                            {selectedTree.diseasesInfo
                              .map((d: any) => d.name)
                              .join(", ")}
                          </Text>
                        </Text>
                      )}
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  // Loading Overlay khi gọi chi tiết
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#16a34a",
    fontWeight: "bold",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitleContainer: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },

  // Search
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#111827" },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: "#16a34a",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  resultCount: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },

  // List
  listContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  cardImageContainer: { height: 160, width: "100%", position: "relative" },
  cardImage: { width: "100%", height: "100%", resizeMode: "cover" },
  cardBadgeContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 6,
  },
  cardBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  cardContent: { padding: 16 },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  cardSubTitle: {
    fontSize: 13,
    color: "#16a34a",
    fontStyle: "italic",
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 12,
  },
  cardTags: { flexDirection: "row", gap: 8 },
  tag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: { fontSize: 11, color: "#4b5563", fontWeight: "500" },

  emptyContainer: { alignItems: "center", marginTop: 40 },
  emptyText: { color: "#6b7280", fontSize: 16 },

  // Filter Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  filterSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "80%",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    marginBottom: 16,
  },
  filterHeaderTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  filterGroup: { marginBottom: 24 },
  filterGroupTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxSelected: { backgroundColor: "#10b981", borderColor: "#10b981" },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  checkboxLabel: { fontSize: 15, color: "#4b5563" },
  checkboxLabelSelected: { fontWeight: "bold", color: "#111827" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  chipActive: { backgroundColor: "#ecfdf5", borderColor: "#34d399" },
  chipText: { fontSize: 14, color: "#4b5563" },
  chipTextActive: { color: "#059669", fontWeight: "bold" },
  filterFooter: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  clearFilterBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#fef2f2",
  },
  clearFilterText: { color: "#dc2626", fontWeight: "bold", fontSize: 15 },
  applyFilterBtn: {
    flex: 2,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#16a34a",
  },
  applyFilterText: { color: "#fff", fontWeight: "bold", fontSize: 15 },

  // Detail Modal
  detailContainer: { flex: 1, backgroundColor: "#fff" },
  detailImageWrapper: { width: "100%", height: 300, position: "relative" },
  detailImage: { width: "100%", height: "100%", resizeMode: "cover" },
  closeDetailBtn: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  detailBadgeContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    gap: 8,
  },
  detailBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailBadgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  detailContent: { padding: 24 },
  detailTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  detailScientific: {
    fontSize: 16,
    color: "#16a34a",
    fontStyle: "italic",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 16,
  },

  propsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  propBox: {
    width: "48%",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  propTexts: { marginLeft: 10, flex: 1 },
  propLabel: {
    fontSize: 11,
    color: "#6b7280",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 2,
  },
  propVal: { fontSize: 14, color: "#111827", fontWeight: "600" },

  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionText: { fontSize: 15, color: "#374151", lineHeight: 24 },
  careSection: {
    backgroundColor: "#ecfdf5",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  careText: {
    fontSize: 15,
    color: "#065f46",
    lineHeight: 24,
    fontWeight: "500",
  },

  extraInfoBox: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 16,
    marginTop: 8,
  },
  extraText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 6,
    lineHeight: 22,
  },
  extraBold: { fontWeight: "bold", color: "#374151" },
});
