import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async register(dto: { email: string; fullName: string; password: string }) {
    const email = dto.email.toLowerCase();
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException("Email này đã được sử dụng.");
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email,
      fullName: dto.fullName,
      password: hashed,
    });
    return this.issueTokens(
      user._id.toString(),
      user.email,
      user.fullName,
      user.role,
    );
  }

  async login(dto: { email: string; password: string }) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException("Sai email hoặc mật khẩu.");
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException("Sai email hoặc mật khẩu.");
    }
    return this.issueTokens(
      user._id.toString(),
      user.email,
      user.fullName,
      user.role,
    );
  }

  async logout(userId: string) {
    await this.cache.del(`refresh_token:${userId}`);
    return { message: "Đăng xuất thành công." };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        role?: string;
      }>(refreshToken);
      const cached = await this.cache.get<string>(
        `refresh_token:${payload.sub}`,
      );
      if (cached !== refreshToken) {
        throw new UnauthorizedException(
          "Token không hợp lệ hoặc đã đăng xuất.",
        );
      }
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException("Người dùng không tồn tại.");
      }
      return this.issueTokens(
        user._id.toString(),
        user.email,
        user.fullName,
        user.role,
      );
    } catch {
      throw new UnauthorizedException(
        "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
      );
    }
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException("Người dùng không tồn tại.");
    }
    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }

  private async issueTokens(
    userId: string,
    email: string,
    fullName: string,
    role: string,
  ) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });
    await this.cache.set(
      `refresh_token:${userId}`,
      refreshToken,
      7 * 24 * 60 * 60 * 1000,
    );
    return {
      user: { id: userId, email, fullName, role },
      accessToken,
      refreshToken,
    };
  }
}
