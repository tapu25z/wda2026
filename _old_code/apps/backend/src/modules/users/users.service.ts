import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { User, UserDocument } from '@agri-scan/database';
import { Payment, PaymentDocument } from '@agri-scan/database';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async createOAuthUser(data: {
    email: string;
    fullName: string;
    provider: 'google' | 'facebook';
    providerId: string;
  }): Promise<UserDocument> {
    const providerIdField = data.provider === 'google' ? 'googleId' : 'facebookId';

    const newUser = new this.userModel({
      email: data.email,
      fullName: data.fullName,
      password: null,
      isPasswordSet: false,
      authProviders: [data.provider],
      [providerIdField]: data.providerId,
    });

    return newUser.save();
  }

  // ── 2. Liên kết thêm OAuth provider vào user đã có ──────────
  async linkOAuthProvider(
    userId: string,
    data: { providerIdField: string; providerId: string; provider: string },
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { [data.providerIdField]: data.providerId },
      $addToSet: { authProviders: data.provider },
    });
  }

  // ── 3. Thiết lập mật khẩu lần đầu cho OAuth user ────────────
  async setPassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: {
        password: hashedPassword,
        isPasswordSet: true,
      },
      $addToSet: { authProviders: 'local' },
    });
  }

  // ── 4. Tìm user theo ID (nếu chưa có trong service) ─────────
  async findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }


  async create(userData: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    await this.userModel.updateOne({ email }, { password: newPassword }).exec();
  }
  // 🔥 THÊM MỚI: Hàm Mock Payment Nâng cấp gói
  async upgradePlan(userId: string, plan: 'PREMIUM' | 'VIP'): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');

    const now = new Date();
    // Cộng thêm 30 ngày (30 * 24 * 60 * 60 * 1000)
    const expirationDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    user.plan = plan;
    user.planExpiresAt = expirationDate;

    // Khi nâng cấp, reset luôn bộ đếm ngày hôm đó cho họ dùng thả ga
    user.dailyImageCount = 0;
    user.dailyPromptCount = 0;
    user.lastResetDate = now;

    const PLAN_PRICES = { PREMIUM: 99000, VIP: 199000 };
    await this.paymentModel.create({
      userId: user._id,
      plan,
      amount: PLAN_PRICES[plan],
      status: 'SUCCESS',
      method: 'MOCK',
    });
    return user.save();
  }
}