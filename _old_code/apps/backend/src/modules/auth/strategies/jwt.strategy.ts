import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      // Lấy token từ Header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Tự động từ chối nếu token hết hạn (15 phút)
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Hàm này tự động chạy nếu Token hợp lệ và chưa hết hạn
  async validate(payload: any) {
    // payload chính là dữ liệu { sub: userId, email } ta đã mã hóa lúc login
    const user = await this.usersService.findByEmail(payload.email);
    
    if (!user) {
      throw new UnauthorizedException('Người dùng không còn tồn tại trong hệ thống!');
    }

    // Kết quả return ở đây sẽ tự động được NestJS gán vào biến `req.user`
    return { userId: payload.sub, email: payload.email, role: user.role };
  }
}