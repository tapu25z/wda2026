import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

/**
 * Người dùng: nông dân / người mua / admin.
 * Bỏ gói PREMIUM/OAuth nếu chưa cần — có thể bổ sung sau.
 */
@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, default: null })
  password: string | null;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ enum: ['USER', 'ADMIN'], default: 'USER' })
  role: string;

  /** Giới hạn ảnh chẩn đoán MyGarden (DAILY_CHECK) mỗi ngày — reset theo cron / đổi ngày */
  @Prop({ default: 0 })
  dailyMyGardenPhotoCount: number;

  /** Giới hạn tin nhắn chatbot (hỏi đáp chữ) mỗi ngày */
  @Prop({ default: 0 })
  dailyChatMessageCount: number;

  @Prop({ type: Date, default: Date.now })
  lastUsageResetAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
