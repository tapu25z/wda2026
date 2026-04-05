// packages/shared/src/types/order.types.ts
import { IProduct } from "./product.types";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";
export type PaymentMethod = "COD" | "VNPAY" | "MOMO" | "BANK_TRANSFER";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export interface IOrderItem {
  productId: string | IProduct; // Khi populate sẽ là nguyên cái Object Product
  quantity: number;
  priceAtPurchase: number;
}

export interface IOrder {
  _id: string;
  buyerId: any;
  sellerId: any;
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: string;
  phoneNumber: string;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderCreatePayload {
  sellerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: string;
  phoneNumber: string;
  paymentMethod: PaymentMethod;
}

export interface IOrderListResponse {
  data: IOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
