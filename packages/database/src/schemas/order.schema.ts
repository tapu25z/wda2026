import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';
import { Listing } from './listing.schema';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: false })
class OrderLine {
  @Prop({ type: Types.ObjectId, ref: Listing.name, required: true })
  listingId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  /** Sao chép trace để người mua quét QR / hiển thị nguồn gốc không phụ thuộc listing sau này */
  @Prop({ required: true })
  traceCodeSnapshot: string;

  @Prop({ required: true, trim: true })
  productTitleSnapshot: string;
}

const OrderLineSchema = SchemaFactory.createForClass(OrderLine);

/**
 * Đơn hàng đơn giản: một seller, nhiều dòng (thường 1 dòng cho MVP).
 */
@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  buyerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  sellerId: Types.ObjectId;

  @Prop({ type: [OrderLineSchema], required: true })
  lines: OrderLine[];

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ type: String, default: '' })
  shippingAddress: string;

  @Prop({ type: String, default: '' })
  buyerPhone: string;

  @Prop({
    enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
    index: true,
  })
  orderStatus: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ buyerId: 1, createdAt: -1 });
OrderSchema.index({ sellerId: 1, createdAt: -1 });
