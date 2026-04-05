import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Trash2, Minus, Plus } from "lucide-react-native";

export default function MyCartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Nấm đối kháng Trichoderma",
      price: 45000,
      qty: 2,
      image:
        "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=200",
    },
    {
      id: 2,
      name: "Phân trùn quế cao cấp",
      price: 80000,
      qty: 1,
      image:
        "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=200",
    },
  ]);

  const updateQty = (id: number, delta: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item,
      ),
    );
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.length === 0 ? (
          <Text style={styles.emptyText}>Giỏ hàng đang trống.</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image source={{ uri: item.image }} style={styles.itemImg} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemPrice}>
                  {item.price.toLocaleString("vi-VN")}đ
                </Text>
                <View style={styles.actionRow}>
                  <View style={styles.qtyBox}>
                    <TouchableOpacity
                      onPress={() => updateQty(item.id, -1)}
                      style={styles.qtyIcon}
                    >
                      <Minus size={14} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.qty}</Text>
                    <TouchableOpacity
                      onPress={() => updateQty(item.id, 1)}
                      style={styles.qtyIcon}
                    >
                      <Plus size={14} color="#374151" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeItem(item.id)}
                    style={styles.trashBtn}
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {items.length > 0 && (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
            <Text style={styles.totalPrice}>
              {total.toLocaleString("vi-VN")}đ
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => router.push("/buy-detail")}
          >
            <Text style={styles.checkoutText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
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
  scrollContent: { padding: 16, paddingBottom: 120 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#6b7280" },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 1,
  },
  itemImg: { width: 80, height: 80, borderRadius: 12 },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  itemName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  itemPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ef4444",
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  qtyIcon: { padding: 6 },
  qtyText: { fontSize: 14, fontWeight: "bold", width: 24, textAlign: "center" },
  trashBtn: { padding: 6 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalBox: { flex: 1 },
  totalLabel: { fontSize: 13, color: "#6b7280" },
  totalPrice: { fontSize: 20, fontWeight: "900", color: "#ef4444" },
  checkoutBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
