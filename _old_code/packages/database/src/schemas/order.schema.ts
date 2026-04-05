import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "./user.schema";
import { Product } from "./product.schema";

export type OrderDocument = HydratedDocument<Order>;

// ==========================================
// SUB-SCHEMA: CHI TIẾT ĐƠN HÀNG (ORDER DETAIL)
// Nằm bên trong Order để tăng tốc độ truy vấn
// ==========================================
@Schema({ _id: false }) // _id: false vì nó chỉ là sub-document
export class OrderDetail {
  @Prop({ type: Types.ObjectId, ref: "Product", required: true })
  productId: Types.ObjectId | Product;

  @Prop({ required: true, min: 1 })
  quantity: number;

  // CỰC KỲ QUAN TRỌNG: Lưu lại giá tiền tại thời điểm mua.
  // Tránh trường hợp hôm sau người bán tăng giá làm sai lệch lịch sử đơn hàng cũ.
  @Prop({ required: true, min: 0 })
  priceAtPurchase: number;
}
export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);

// ==========================================
// MAIN SCHEMA: ĐƠN HÀNG (ORDER)
// ==========================================
@Schema({ timestamps: true, collection: "orders" })
export class Order {
  // 1. Người mua
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  buyerId: Types.ObjectId | User;

  // 2. Người bán (Mỗi đơn hàng thuộc về 1 shop. Nếu khách mua từ 2 shop, ta tách thành 2 đơn)
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  sellerId: Types.ObjectId | User;

  // 3. Danh sách các món hàng (Order Details)
  @Prop({ type: [OrderDetailSchema], required: true })
  items: OrderDetail[];

  // 4. Tổng tiền đơn hàng
  @Prop({ required: true, min: 0 })
  totalAmount: number;

  // 5. Thông tin giao hàng
  @Prop({ required: true })
  shippingAddress: string;

  @Prop({ required: true })
  phoneNumber: string;

  // 6. Trạng thái Đơn hàng
  @Prop({
    enum: ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"],
    default: "PENDING",
    index: true,
  })
  orderStatus: string;

  // 7. Thông tin Thanh toán
  @Prop({
    enum: ["COD", "VNPAY", "MOMO", "BANK_TRANSFER"],
    default: "COD",
  })
  paymentMethod: string;

  @Prop({
    enum: ["UNPAID", "PAID", "REFUNDED"],
    default: "UNPAID",
  })
  paymentStatus: string;

  // 8. Lý do hủy đơn (Nếu có)
  @Prop({ type: String, default: null })
  cancelReason?: string | null;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// 🚀 Tối ưu truy vấn (Indexes)
OrderSchema.index({ buyerId: 1, createdAt: -1 }); // Tối ưu: Lịch sử mua hàng của tôi
OrderSchema.index({ sellerId: 1, createdAt: -1 }); // Tối ưu: Danh sách đơn khách đặt của Shop
OrderSchema.index({ orderStatus: 1 }); // Tối ưu: Lọc đơn chờ xác nhận
