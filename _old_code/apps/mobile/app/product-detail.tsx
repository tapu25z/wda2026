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
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  ArrowLeft,
  Star,
  Store,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react-native";

import { productApi } from "@agri-scan/shared";

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      const res = await productApi.getProductById(id as string);
      setProduct(res);
    } catch (error) {
      console.error("Lỗi tải chi tiết sản phẩm:", error);
      // Dữ liệu giả lập phòng trường hợp API lỗi
      setProduct({
        _id: "mock-1",
        name: "Phân bón hữu cơ sinh học cao cấp",
        price: 150000,
        sold: 120,
        rating: 4.8,
        image: "https://placehold.co/600x600.png?text=Agri+Product",
        sellerId: { shopName: "AgriShop Official" },
        description:
          "Sản phẩm cung cấp dinh dưỡng thiết yếu cho cây trồng phát triển mạnh mẽ, thân thiện với môi trường.",
        usageInstruction:
          "Pha 1 nắp với 2 lít nước, tưới đều quanh gốc 1 tuần 1 lần.",
      });
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

  // 🔥 HÀM KIỂM TRA ĐĂNG NHẬP TRƯỚC KHI MUA HÀNG
  const requireAuth = async (actionCallback: () => void) => {
    const userStr =
      Platform.OS === "web"
        ? localStorage.getItem("user")
        : await SecureStore.getItemAsync("user");

    if (!userStr) {
      if (Platform.OS === "web") {
        window.alert("Bạn cần đăng nhập để mua sắm vật tư nhé!");
        router.push("/auth/login" as any);
      } else {
        Alert.alert(
          "Yêu cầu đăng nhập",
          "Bạn cần đăng nhập để mua sắm vật tư nhé!",
          [
            { text: "Hủy", style: "cancel" },
            {
              text: "Đăng nhập",
              onPress: () => router.push("/auth/login" as any),
            },
          ],
        );
      }
      return;
    }
    // Đã đăng nhập thì cho phép chạy tiếp
    actionCallback();
  };

  const handleAddToCart = () => {
    Platform.OS === "web"
      ? window.alert("Đã thêm sản phẩm vào giỏ hàng thành công!")
      : Alert.alert("Thành công", "Đã thêm sản phẩm vào giỏ hàng thành công!");
  };

  const handleBuyNow = () => {
    router.push({
      pathname: "/checkout",
      params: {
        productId: product?._id,
        sellerId: product?.sellerId?._id,
        name: product?.name,
        price: product?.price,
        image: product?.image,
      },
    } as any);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ marginTop: 12, color: "#64748b" }}>
          Đang tải sản phẩm...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View
        style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 10 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Ảnh Sản Phẩm */}
        <Image
          source={{
            uri:
              product?.image || "https://placehold.co/600x600.png?text=Product",
          }}
          style={styles.productImage}
        />

        {/* Thông tin Cơ bản */}
        <View style={styles.basicInfo}>
          <Text style={styles.productName}>
            {product?.name || "Tên sản phẩm"}
          </Text>
          <Text style={styles.productPrice}>
            {formatCurrency(product?.price || 0)}
          </Text>

          <View style={styles.ratingRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.ratingText}>{product?.rating || "4.8"}</Text>
            </View>
            <Text style={styles.soldText}>Đã bán {product?.sold || 0}</Text>
          </View>
        </View>

        {/* Thông tin Cửa hàng */}
        <View style={styles.sellerInfo}>
          <View style={styles.sellerAvatar}>
            <Store size={24} color="#16a34a" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.sellerName}>
              {product?.sellerId?.shopName || "Cửa hàng vật tư nông nghiệp"}
            </Text>
            <Text style={styles.sellerBadge}>
              <ShieldCheck size={14} color="#2563eb" /> Cửa hàng uy tín
            </Text>
          </View>
          <TouchableOpacity style={styles.visitShopBtn}>
            <Text style={styles.visitShopText}>Xem Shop</Text>
          </TouchableOpacity>
        </View>

        {/* Chi tiết sản phẩm */}
        <View style={styles.descSection}>
          <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
          <Text style={styles.descContent}>
            {product?.description || "Chưa có mô tả cho sản phẩm này."}
          </Text>

          {product?.usageInstruction && (
            <View style={styles.usageBox}>
              <Text style={styles.descTitle}>Hướng dẫn sử dụng:</Text>
              <Text style={styles.descContent}>{product.usageInstruction}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FOOTER THANH TOÁN */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 10) },
        ]}
      >
        <TouchableOpacity
          style={styles.addToCartBtn}
          // 🔥 ĐÃ BỌC HÀM BẢO VỆ Ở ĐÂY
          onPress={() => requireAuth(() => handleAddToCart())}
        >
          <ShoppingCart size={20} color="#16a34a" />
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyNowBtn}
          // 🔥 ĐÃ BỌC HÀM BẢO VỆ Ở ĐÂY
          onPress={() => requireAuth(() => handleBuyNow())}
        >
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centerBox: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 100 },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  productImage: {
    width: "100%",
    height: 350,
    backgroundColor: "#fff",
    resizeMode: "cover",
  },

  basicInfo: { backgroundColor: "#fff", padding: 16, marginBottom: 8 },
  productName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ef4444",
    marginBottom: 12,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#d97706",
    marginLeft: 4,
  },
  soldText: { fontSize: 14, color: "#64748b" },

  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#dcfce3",
    justifyContent: "center",
    alignItems: "center",
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  sellerBadge: { fontSize: 12, color: "#2563eb", fontWeight: "600" },
  visitShopBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#16a34a",
  },
  visitShopText: { fontSize: 13, fontWeight: "bold", color: "#16a34a" },

  descSection: { backgroundColor: "#fff", padding: 16, flex: 1 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 16,
  },
  descTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 8,
    marginBottom: 8,
  },
  descContent: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 16,
  },
  usageBox: {
    backgroundColor: "#e0f2fe",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 12,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#dcfce3",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  addToCartText: { fontSize: 15, fontWeight: "bold", color: "#16a34a" },
  buyNowBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#16a34a",
  },
  buyNowText: { fontSize: 15, fontWeight: "bold", color: "#fff" },
});
