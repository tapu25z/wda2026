import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import axios from 'axios'; // Nhớ import cái này ở đầu file
// Kiểu dữ liệu nhận từ Google/Facebook Strategy
interface OAuthUserProfile {
  email: string;
  fullName: string;
  providerId: string;
  provider: 'google' | 'facebook';
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private mailerService: MailerService,
  ) { }

  // ════════════════════════════════════════════════════════════
  // 1. ĐĂNG KÝ BẰNG EMAIL + MẬT KHẨU
  // ════════════════════════════════════════════════════════════
  async register(data: any) {
    const existingUser = await this.usersService.findByEmail(data.email);

    if (existingUser) {
      // Case: Email đã tồn tại nhưng user này chỉ đăng ký qua OAuth (chưa có password)
      // → Hướng dẫn user đăng nhập bằng OAuth rồi thiết lập mật khẩu sau
      if (!existingUser.isPasswordSet) {
        const providers = existingUser.authProviders
          .filter((p) => p !== 'local')
          .join(', ');
        throw new BadRequestException(
          `Email này đã được đăng ký qua ${providers || 'mạng xã hội'}. ` +
          `Vui lòng đăng nhập bằng ${providers || 'tài khoản mạng xã hội'} ` +
          `và thiết lập mật khẩu trong mục Cài đặt tài khoản.`,
        );
      }
      throw new BadRequestException('Email này đã được sử dụng!');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await this.usersService.create({
      ...data,
      password: hashedPassword,
      isPasswordSet: true,
      authProviders: ['local'],
    });

    return this.generateTokens(
      newUser._id.toString(),
      newUser.email,
      newUser.fullName,
      newUser.plan,
      true,
      newUser.role,
    );
  }

  // ════════════════════════════════════════════════════════════
  // 2. ĐĂNG NHẬP BẰNG EMAIL + MẬT KHẨU
  // ════════════════════════════════════════════════════════════
  async login(data: any) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) throw new UnauthorizedException('Sai email hoặc mật khẩu!');

    // Case: User chỉ đăng ký qua OAuth, chưa thiết lập mật khẩu
    if (!user.isPasswordSet || !user.password) {
      const providers = user.authProviders
        .filter((p) => p !== 'local')
        .map((p) => (p === 'google' ? 'Google' : 'Facebook'))
        .join(' hoặc ');

      throw new UnauthorizedException(
        `Tài khoản này chưa có mật khẩu. ` +
        `Vui lòng đăng nhập bằng ${providers || 'mạng xã hội'} ` +
        `và thiết lập mật khẩu trong Cài đặt tài khoản.`,
      );
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Sai email hoặc mật khẩu!');

    return this.generateTokens(
      user._id.toString(),
      user.email,
      user.fullName,
      user.plan,
      user.isPasswordSet,
      user.role,
    );
  }

  // ════════════════════════════════════════════════════════════
  // 3. XÁC THỰC NGƯỜI DÙNG TỪ OAUTH (Google / Facebook)
  //    Được gọi bởi GoogleStrategy và FacebookStrategy
  // ════════════════════════════════════════════════════════════
  async validateOAuthUser(profile: OAuthUserProfile) {
    const { email, fullName, providerId, provider } = profile;
    const providerIdField = provider === 'google' ? 'googleId' : 'facebookId';

    let user = await this.usersService.findByEmail(email);

    if (user) {
      // ── Case A: Email đã tồn tại (đăng ký local hoặc OAuth khác)
      // → Tự động link provider này vào tài khoản hiện có nếu chưa link
      if (!user[providerIdField]) {
        await this.usersService.linkOAuthProvider(user._id.toString(), {
          providerIdField,
          providerId,
          provider,
        });
        // Reload user sau khi update
        user = await this.usersService.findById(user._id.toString());
      }
    } else {
      // ── Case B: Email chưa tồn tại → Tạo tài khoản mới từ OAuth
      user = await this.usersService.createOAuthUser({
        email,
        fullName,
        provider,
        providerId,
      });
    }

    return user;
  }

  // ════════════════════════════════════════════════════════════
  // 4. XỬ LÝ SAU KHI OAUTH CALLBACK THÀNH CÔNG
  //    Được gọi từ Controller sau khi Passport xác thực xong
  // ════════════════════════════════════════════════════════════
  async handleOAuthCallback(user: any) {
    return this.generateTokens(
      user._id.toString(),
      user.email,
      user.fullName,
      user.plan,
      user.isPasswordSet,
      user.role,
    );
  }

  // ════════════════════════════════════════════════════════════
  // 5. THIẾT LẬP MẬT KHẨU LẦN ĐẦU (CHO OAUTH USER)
  // ════════════════════════════════════════════════════════════
  async setPassword(userId: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại!');

    if (user.isPasswordSet) {
      throw new BadRequestException(
        'Mật khẩu đã được thiết lập trước đó. Vui lòng sử dụng chức năng Đổi mật khẩu.',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.setPassword(userId, hashedPassword);

    return {
      message:
        'Thiết lập mật khẩu thành công! Bạn có thể đăng nhập bằng email và mật khẩu từ bây giờ.',
    };
  }

  // ════════════════════════════════════════════════════════════
  // 6. ĐĂNG XUẤT
  // ════════════════════════════════════════════════════════════
  async logout(userId: string) {
    const tokenKey = `refresh_token:${userId}`;
    const existingToken = await this.cacheManager.get(tokenKey);

    if (!existingToken) {
      throw new BadRequestException('Bạn đã đăng xuất trước đó rồi!');
    }

    await this.cacheManager.del(tokenKey);
    return { message: 'Đăng xuất thành công!' };
  }

  // ════════════════════════════════════════════════════════════
  // 7. CẤP LẠI TOKEN (Refresh Token)
  // ════════════════════════════════════════════════════════════
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const userId = payload.sub;

      const cachedToken = await this.cacheManager.get(
        `refresh_token:${userId}`,
      );
      if (cachedToken !== refreshToken) {
        throw new UnauthorizedException(
          'Token không hợp lệ hoặc bạn đã đăng xuất!',
        );
      }

      const user = await this.usersService.findByEmail(payload.email);

      return this.generateTokens(
        userId,
        payload.email,
        user?.fullName,
        user?.plan,
        user?.isPasswordSet,
        user?.role,
      );
    } catch {
      throw new UnauthorizedException(
        'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!',
      );
    }
  }

  // ════════════════════════════════════════════════════════════
  // 8. QUÊN MẬT KHẨU - GỬI OTP
  // ════════════════════════════════════════════════════════════
  async forgotPassword(email: string) {
    const isLocked = await this.cacheManager.get(`lockout:${email}`);
    if (isLocked) {
      throw new BadRequestException(
        'Tài khoản đang bị vô hiệu hóa 30 phút do nhập sai OTP quá nhiều lần.',
      );
    }

    const user = await this.usersService.findByEmail(email);
    if (!user)
      throw new NotFoundException('Email không tồn tại trong hệ thống!');

    // OAuth user chưa có password → gợi ý dùng set-password thay vì reset
    if (!user.isPasswordSet) {
      throw new BadRequestException(
        'Tài khoản này chưa thiết lập mật khẩu. ' +
        'Vui lòng đăng nhập bằng Google/Facebook và dùng chức năng Thiết lập mật khẩu.',
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.cacheManager.set(`otp:${email}`, otp, 60 * 1000);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2e7d32; text-align: center;">Agri-Scan AI</h2>
        <p>Xin chào <strong>${user.fullName}</strong>,</p>
        <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu. Vui lòng dùng mã OTP dưới đây:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: red; font-size: 14px;"><em>* Mã OTP chỉ có hiệu lực trong 60 giây.</em></p>
        <p>Nếu bạn không yêu cầu thay đổi mật khẩu, hãy bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">Đội ngũ Agri-Scan AI - HUTECH</p>
      </div>
    `;

    await this.mailerService.sendMail({
      to: email,
      subject: '🔑 Khôi phục mật khẩu - Agri-Scan AI',
      html: emailHtml,
    });

    return { message: 'Mã OTP đã được gửi đến email của bạn!' };
  }

  // ════════════════════════════════════════════════════════════
  // 9. XÁC NHẬN OTP
  // ════════════════════════════════════════════════════════════
  async verifyOtp(email: string, otp: string) {
    const isLocked = await this.cacheManager.get(`lockout:${email}`);
    if (isLocked) {
      throw new BadRequestException(
        'Tài khoản đang bị vô hiệu hóa 30 phút do nhập sai OTP quá nhiều lần.',
      );
    }

    const cachedOtp = await this.cacheManager.get(`otp:${email}`);
    if (!cachedOtp) {
      throw new BadRequestException('Mã OTP đã hết hạn hoặc không tồn tại!');
    }

    if (cachedOtp !== otp) {
      let attempts =
        (await this.cacheManager.get<number>(`otp_attempts:${email}`)) || 0;
      attempts += 1;

      if (attempts >= 5) {
        await this.cacheManager.set(`lockout:${email}`, true, 30 * 60 * 1000);
        await this.cacheManager.del(`otp_attempts:${email}`);
        await this.cacheManager.del(`otp:${email}`);
        throw new BadRequestException(
          'Bạn đã nhập sai 5 lần. Chức năng khôi phục bị khóa 30 phút!',
        );
      }

      await this.cacheManager.set(
        `otp_attempts:${email}`,
        attempts,
        10 * 60 * 1000,
      );
      throw new BadRequestException(
        `Mã OTP không chính xác! Bạn còn ${5 - attempts} lần thử.`,
      );
    }

    await this.cacheManager.del(`otp:${email}`);
    await this.cacheManager.del(`otp_attempts:${email}`);

    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.cacheManager.set(
      `reset_token:${email}`,
      resetToken,
      5 * 60 * 1000,
    );

    return { message: 'Xác thực OTP thành công!', resetToken };
  }

  // ════════════════════════════════════════════════════════════
  // 10. ĐẶT LẠI MẬT KHẨU MỚI
  // ════════════════════════════════════════════════════════════
  async resetPassword(email: string, resetToken: string, newPassword: string) {
    const cachedToken = await this.cacheManager.get(`reset_token:${email}`);

    if (!cachedToken || cachedToken !== resetToken) {
      throw new BadRequestException(
        'Phiên đổi mật khẩu đã hết hạn hoặc không hợp lệ!',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(email, hashedPassword);
    await this.cacheManager.del(`reset_token:${email}`);

    return { message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập.' };
  }

  // ════════════════════════════════════════════════════════════
  // 11. LẤY THÔNG TIN PROFILE
  // ════════════════════════════════════════════════════════════
  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại!');

    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      plan: user.plan,
      planExpiresAt: user.planExpiresAt,
      dailyImageCount: user.dailyImageCount,
      dailyPromptCount: user.dailyPromptCount,
      // OAuth info để frontend biết đã link những provider nào
      authProviders: user.authProviders,
      isPasswordSet: user.isPasswordSet,
      isGoogleLinked: !!user.googleId,
      isFacebookLinked: !!user.facebookId,
    };
  }

  // ════════════════════════════════════════════════════════════
  // PRIVATE: TẠO ACCESS TOKEN + REFRESH TOKEN
  // ════════════════════════════════════════════════════════════
  async generateTokens(
    userId: string,
    email: string,
    fullName?: string,
    plan?: string,
    isPasswordSet?: boolean,
    role?: string,             // ← THÊM
  ) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.cacheManager.set(
      `refresh_token:${userId}`,
      refreshToken,
      7 * 24 * 60 * 60 * 1000,
    );

    return {
      user: { id: userId, email, fullName, plan, isPasswordSet, role },
      accessToken,
      refreshToken,
    };
  }
  // 🔥 THÊM MỚI: Hàm xử lý Đăng nhập Google cho Mobile
  async verifyGoogleTokenForMobile(idToken: string) {
    try {
      // 1. Gọi thẳng lên API của Google để xác minh idToken
      const verifyRes = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
      );
      const payload = verifyRes.data;

      if (!payload || !payload.email) {
        throw new BadRequestException('Token Google không hợp lệ!');
      }

      const email = payload.email;
      const fullName = payload.name || 'Người dùng Google';
      const googleId = payload.sub; // ID duy nhất của user này trên Google

      // 2. Tìm trong Database xem user có chưa
      let user = await this.usersService.findByEmail(email);

      if (!user) {
        // Chưa có -> Tự động đăng ký tài khoản mới siêu tốc
        user = await this.usersService.create({
          email,
          fullName,
          password: null, // Google không cần password
          googleId,
          authProviders: ['google'],
          isPasswordSet: false,
          plan: 'FREE',
        });
      } else {
        // Đã có tài khoản -> Liên kết thêm Google ID vào nếu chưa có
        let isUpdated = false;
        if (!user.authProviders.includes('google')) {
          user.authProviders.push('google');
          isUpdated = true;
        }
        if (!user.googleId) {
          user.googleId = googleId;
          isUpdated = true;
        }
        if (isUpdated) {
          await user.save(); // Lưu lại vào Database
        }
      }

      // 3. Trả về Token JWT cho Mobile (Dùng lại hàm cũ, không sợ lỗi)
      return this.generateTokens(
        user._id.toString(),
        user.email,
        user.fullName,
        user.plan,
        user.isPasswordSet,
        user.role,
      );
    } catch (error) {
      console.error('Lỗi Google Auth:', error?.response?.data || error.message);
      throw new UnauthorizedException(
        'Xác thực Google thất bại. Vui lòng thử lại!',
      );
    }
  }
}
