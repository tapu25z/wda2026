import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  // ✅ THAY ĐỔI: Không còn required vì OAuth user chưa có mật khẩu ban đầu
  @Prop({ type: String, default: null, required: false }) 
  password?: string | null;

  @Prop({ required: true })
  fullName: string;

  @Prop({ default: 'FARMER', enum: ['FARMER', 'EXPERT', 'ADMIN'] })
  role: string;

  // ── OAUTH FIELDS ─────────────────────────────────────────────────────────────

  // Google OAuth ID (sparse cho phép nhiều document có giá trị null)
  @Prop({ type: String, default: null, sparse: true }) // THÊM type: String VÀO ĐÂY
  googleId?: string | null;

  // Facebook OAuth ID
  @Prop({ type: String, default: null, sparse: true }) // THÊM type: String VÀO ĐÂY
  facebookId?: string | null;

  // Các phương thức đăng nhập đã liên kết: ['local'], ['google'], ['local','google']
  @Prop({ type: [String], default: [], enum: ['local', 'google', 'facebook'] })
  authProviders: string[];

  // false = OAuth user chưa thiết lập mật khẩu, true = đã có mật khẩu
  @Prop({ default: false })
  isPasswordSet: boolean;

  // ── PLAN FIELDS ──────────────────────────────────────────────────────────────

  @Prop({ default: 'FREE', enum: ['FREE', 'PREMIUM', 'VIP'] })
  plan: string;

  @Prop({ type: Date, default: null })
  planExpiresAt: Date | null;

  // ── RATE LIMIT FIELDS ────────────────────────────────────────────────────────

  @Prop({ default: 0 })
  dailyImageCount: number;

  @Prop({ default: 0 })
  dailyPromptCount: number;

  @Prop({ type: Date, default: Date.now })
  lastResetDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
