import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "./user.schema"; // Import schema User để liên kết

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, collection: "products" })
export class Product {
  // 🔥 ĐIỂM QUAN TRỌNG NHẤT: Lưu lại ai là người đăng bán món hàng này
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  sellerId: Types.ObjectId | User;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0 })
  originalPrice?: number;

  @Prop({
    required: true,
    enum: ["FERTILIZER", "PESTICIDE", "SEED", "TOOL", "OTHER"],
    default: "OTHER",
  })
  category: string;

  @Prop([String])
  images: string[];

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ default: 0, min: 0 })
  sold: number;

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ type: String, default: null })
  brand?: string | null;

  @Prop({ type: String, default: null })
  usageInstructions?: string | null;

  // Trạng thái kiểm duyệt: Chờ duyệt, Đã duyệt (Được bán), Bị từ chối
  @Prop({ enum: ["APPROVED", "PENDING", "REJECTED"], default: "APPROVED" })
  status: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ sellerId: 1, createdAt: -1 }); // Tối ưu khi tìm danh sách hàng của 1 shop
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ name: "text" });
