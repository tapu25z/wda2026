import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId: Types.ObjectId | User;

  @Prop({ required: true, enum: ['PREMIUM', 'VIP'] })
  plan: string;

  @Prop({ required: true })
  amount: number; // VND

  @Prop({ default: 'SUCCESS', enum: ['SUCCESS', 'FAILED', 'PENDING'] })
  status: string;

  @Prop({ default: 'MOCK', enum: ['MOCK', 'VNPAY', 'MOMO', 'STRIPE', 'ADMIN_GRANT'] })
  method: string;

  @Prop({ default: 30 })
  planDuration: number; // số ngày
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Index để aggregate doanh thu theo ngày/tháng
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });