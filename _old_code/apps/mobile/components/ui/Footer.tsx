import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import {
  MapPin,
  Facebook,
  Youtube,
  Globe,
  ShieldCheck,
  Smartphone,
} from "lucide-react-native";

export function Footer() {
  return (
    <View style={styles.container}>
      {/* Cột 1: Tải ứng dụng & Mạng xã hội */}
      <View style={styles.section}>
        <Text style={styles.heading}>TẢI ỨNG DỤNG AGRI-SCAN</Text>
        <View style={styles.btnGroup}>
          <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.8}>
            <Smartphone size={20} color="#fff" style={styles.btnIcon} />
            <View>
              <Text style={styles.btnSubText}>Download on the</Text>
              <Text style={styles.btnMainText}>App Store</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.8}>
            <Globe size={20} color="#fff" style={styles.btnIcon} />
            <View>
              <Text style={styles.btnSubText}>Get it on</Text>
              <Text style={styles.btnMainText}>Google Play</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.heading, { marginTop: 24 }]}>KẾT NỐI</Text>
        <View style={styles.socialGroup}>
          <TouchableOpacity style={styles.socialIcon}>
            <Facebook size={24} color="#6EE7B7" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <Youtube size={24} color="#6EE7B7" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.zaloText}>Zalo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cột 2: Tổng đài hỗ trợ */}
      <View style={styles.section}>
        <Text style={styles.heading}>TỔNG ĐÀI HỖ TRỢ</Text>
        <View style={styles.contactItem}>
          <Text style={styles.contactLabel}>Tư vấn kỹ thuật (Miễn phí)</Text>
          <Text
            style={styles.contactValue}
            onPress={() => Linking.openURL("tel:18006601")}
          >
            1800 6601
          </Text>
        </View>
        <View style={styles.contactItem}>
          <Text style={styles.contactLabel}>Hỗ trợ tài khoản (8h-22h)</Text>
          <Text
            style={styles.contactValue}
            onPress={() => Linking.openURL("tel:18006602")}
          >
            1800 6602
          </Text>
        </View>
        <View style={styles.contactItem}>
          <Text style={styles.contactLabel}>Email</Text>
          <Text
            style={styles.contactValue}
            onPress={() => Linking.openURL("mailto:hotro@agriscan.ai")}
          >
            hotro@agriscan.ai
          </Text>
        </View>
      </View>

      {/* Cột 3: Chính sách */}
      <View style={styles.section}>
        <Text style={styles.heading}>CHÍNH SÁCH</Text>
        {[
          "Điều khoản sử dụng",
          "Chính sách bảo mật",
          "Chính sách thanh toán",
          "Hướng dẫn chẩn đoán",
          "Gửi góp ý & Khiếu nại",
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.policyLink}>
            <Text style={styles.policyText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cột 4: Địa chỉ */}
      <View style={styles.section}>
        <Text style={styles.heading}>ĐỊA CHỈ</Text>
        <View style={styles.addressRow}>
          <MapPin size={18} color="#A7F3D0" style={{ marginTop: 2 }} />
          <Text style={styles.addressText}>
            Lô E2a-7, Đường D1, Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ
            Đức, TP. Hồ Chí Minh
          </Text>
        </View>

        <View style={styles.certDivider}>
          <View style={styles.certRow}>
            <View style={styles.certBox}>
              <ShieldCheck size={14} color="#059669" />
              <Text style={styles.certBCT}>BỘ CÔNG THƯƠNG</Text>
            </View>
            <View style={styles.certBox}>
              <Text style={styles.certDMCA}>DMCA</Text>
            </View>
          </View>

          <View style={styles.payRow}>
            <View style={styles.payBox}>
              <Text style={[styles.payText, { color: "#1e3a8a" }]}>VISA</Text>
            </View>
            <View style={styles.payBox}>
              <Text style={[styles.payText, { color: "#dc2626" }]}>MC</Text>
            </View>
            <View style={styles.payBox}>
              <Text style={[styles.payText, { color: "#db2777" }]}>Momo</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom */}
      <View style={styles.bottomFooter}>
        <Text style={styles.bottomText}>
          © 2026 Công Ty Cổ Phần Công Nghệ Nông Nghiệp Agri-Scan AI.
        </Text>
        <Text style={styles.bottomText}>
          Website & AI Innovation Contest 2026 - Foundation Track
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#064E3B", // Xanh đậm ngọc bích giống web
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginTop: "auto",
  },
  section: {
    marginBottom: 32,
  },
  heading: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 16,
  },
  btnGroup: {
    flexDirection: "row",
    gap: 12,
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#065F46",
    borderWidth: 1,
    borderColor: "#047857",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1, // Chia đều 2 nút
  },
  btnIcon: {
    marginRight: 8,
  },
  btnSubText: {
    color: "#A7F3D0",
    fontSize: 9,
    textTransform: "uppercase",
  },
  btnMainText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  socialGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  socialIcon: {
    padding: 4,
  },
  zaloText: {
    color: "#6EE7B7",
    fontWeight: "bold",
    fontSize: 16,
    padding: 4,
  },
  contactItem: {
    marginBottom: 12,
  },
  contactLabel: {
    color: "#6EE7B7",
    fontSize: 13,
    marginBottom: 2,
  },
  contactValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  policyLink: {
    paddingVertical: 6,
  },
  policyText: {
    color: "#A7F3D0",
    fontSize: 14,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  addressText: {
    color: "#A7F3D0",
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  certDivider: {
    borderTopWidth: 1,
    borderTopColor: "#065F46",
    marginTop: 16,
    paddingTop: 16,
  },
  certRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  certBox: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  certBCT: {
    color: "#065F46",
    fontWeight: "bold",
    fontSize: 10,
    marginLeft: 4,
  },
  certDMCA: {
    color: "#1e40af",
    fontWeight: "bold",
    fontSize: 10,
    paddingHorizontal: 4,
  },
  payRow: {
    flexDirection: "row",
    gap: 8,
  },
  payBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  payText: {
    fontWeight: "bold",
    fontSize: 10,
  },
  bottomFooter: {
    borderTopWidth: 1,
    borderTopColor: "#065F46",
    paddingTop: 24,
    marginTop: 8,
    alignItems: "center",
  },
  bottomText: {
    color: "#34D399",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 4,
  },
});
