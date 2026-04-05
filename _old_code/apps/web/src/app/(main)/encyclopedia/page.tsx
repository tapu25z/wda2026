import { TreeDictionary } from "@/components/TreeDictionary";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Từ Điển Cây Trồng | Agri-Scan AI",
  description:
    "Khám phá thế giới thực vật phong phú với thông tin chi tiết về đặc điểm, công dụng và cách chăm sóc từng loại cây.",
};

export default function EncyclopediaPage() {
  return <TreeDictionary />;
}
