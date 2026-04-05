import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  ArrowLeft,
  PlusCircle,
  Package,
  TrendingUp,
  DollarSign,
  Box,
} from "lucide-react-native";

import { productApi, orderApi } from "@agri-scan/shared";

export default function MyShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      // 1. Lấy thông tin user hiện tại để biết sellerId
      let userStr =
        Platform.OS === "web"
          ? localStorage.getItem("user")
          : await SecureStore.getItemAsync("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user) return;
      const myId = user._id || user.id || user.userId;
      // 2. Gọi API lấy Sản phẩm của tôi và Đơn khách đặt
      const [productsRes, ordersRes] = await Promise.all([
        productApi.getProducts({ sellerId: myId, limit: 100 }),
        orderApi.getShopOrders(1, 100),
      ]);

      setProducts(productsRes.data || []);

      const shopOrders = ordersRes.data || [];
      setOrders(shopOrders);

      // 3. Tính tổng doanh thu từ các đơn hàng đã Giao thành công (DELIVERED)
      const totalRevenue = shopOrders
        .filter((o: any) => o.orderStatus === "DELIVERED")
        .reduce((sum: number, order: any) => sum + order.totalAmount, 0);

      setRevenue(totalRevenue);
    } catch (error) {
      console.error("Lỗi tải dữ liệu gian hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gian hàng của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#16a34a"
          style={{ marginTop: 50 }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* THỐNG KÊ DOANH THU */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View
                style={[styles.statIconBox, { backgroundColor: "#dcfce3" }]}
              >
                <DollarSign size={24} color="#16a34a" />
              </View>
              <Text style={styles.statLabel}>Tổng Doanh Thu</Text>
              <Text style={styles.statValueGreen}>
                {formatCurrency(revenue)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={[styles.statIconBox, { backgroundColor: "#e0f2fe" }]}
              >
                <Package size={24} color="#0284c7" />
              </View>
              <Text style={styles.statLabel}>Đơn khách đặt</Text>
              <Text style={styles.statValueBlue}>{orders.length} đơn</Text>
            </View>
          </View>

          {/* QUẢN LÝ SẢN PHẨM */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Sản phẩm đang bán ({products.length})
            </Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push("/add-product" as any)}
            >
              <PlusCircle size={18} color="#16a34a" />
              <Text style={styles.addBtnText}>Thêm mới</Text>
            </TouchableOpacity>
          </View>

          {products.length === 0 ? (
            <View style={styles.emptyBox}>
              <Box size={40} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                Bạn chưa đăng bán sản phẩm nào.
              </Text>
            </View>
          ) : (
            products.map((item) => (
              <View key={item._id} style={styles.productCard}>
                <Image
                  source={{
                    uri: item.images?.[0] || "https://placehold.co/100",
                  }}
                  style={styles.productImg}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    {formatCurrency(item.price)}
                  </Text>
                  <View style={styles.productMeta}>
                    <Text style={styles.stockText}>Kho: {item.stock}</Text>
                    <Text style={styles.soldText}>Đã bán: {item.sold}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
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
  content: { padding: 16, paddingBottom: 100 },

  statsContainer: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    alignItems: "center",
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statLabel: { fontSize: 13, color: "#64748b", marginBottom: 4 },
  statValueGreen: { fontSize: 18, fontWeight: "bold", color: "#16a34a" },
  statValueBlue: { fontSize: 18, fontWeight: "bold", color: "#0284c7" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#dcfce3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: "#16a34a", fontWeight: "bold", fontSize: 14 },

  emptyBox: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  emptyText: { marginTop: 12, color: "#64748b", fontSize: 14 },

  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  productImg: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  productInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ef4444",
    marginBottom: 8,
  },
  productMeta: { flexDirection: "row", gap: 16 },
  stockText: { fontSize: 12, color: "#16a34a", fontWeight: "600" },
  soldText: { fontSize: 12, color: "#64748b" },
});
