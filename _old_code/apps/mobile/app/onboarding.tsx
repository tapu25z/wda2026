import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { ScanLine, Stethoscope, Users, ArrowRight } from "lucide-react-native";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Quét ảnh chuẩn xác",
    desc: "Chỉ với 1 thao tác chụp ảnh, AI sẽ lập tức nhận diện hơn 500 loại bệnh trên cây trồng.",
    icon: <ScanLine size={80} color="#16a34a" />,
  },
  {
    id: "2",
    title: "Bác sĩ thực vật 24/7",
    desc: "Trợ lý ảo AI sẵn sàng giải đáp mọi thắc mắc và đưa ra phác đồ điều trị sinh học an toàn.",
    icon: <Stethoscope size={80} color="#3b82f6" />,
  },
  {
    id: "3",
    title: "Cộng đồng nhà nông",
    desc: "Kết nối, chia sẻ kinh nghiệm và học hỏi kỹ thuật canh tác từ hàng ngàn chuyên gia.",
    icon: <Users size={80} color="#f59e0b" />,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.replace("/auth/login"); // Chạy xong thì ném qua Login
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.slide}>
      <View style={styles.iconCircle}>{item.icon}</View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.desc}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => router.replace("/auth/login")}
      >
        <Text style={styles.skipText}>Bỏ qua</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(e) =>
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentIndex === index && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextText}>
            {currentIndex === SLIDES.length - 1 ? "Bắt đầu ngay" : "Tiếp tục"}
          </Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  skipBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: { fontSize: 15, color: "#6b7280", fontWeight: "600" },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  desc: { fontSize: 16, color: "#4b5563", textAlign: "center", lineHeight: 26 },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  indicatorContainer: { flexDirection: "row", gap: 8 },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d1d5db",
  },
  indicatorActive: { width: 24, backgroundColor: "#16a34a" },
  nextBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nextText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
