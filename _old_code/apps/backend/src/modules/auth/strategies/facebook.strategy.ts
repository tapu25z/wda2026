import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.getOrThrow<string>('FACEBOOK_APP_SECRET'),
      callbackURL: configService.getOrThrow<string>('FACEBOOK_CALLBACK_URL'),
      // Bắt buộc phải request email permission trong Facebook App Dashboard
      profileFields: ['id', 'displayName', 'emails'],
      scope: ['email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: Function,
  ): Promise<void> {
    try {
      const { id, displayName, emails } = profile;

      // Facebook không bắt buộc email → cần báo lỗi rõ ràng
      if (!emails || emails.length === 0) {
        return done(
          new Error(
            'Tài khoản Facebook không chia sẻ email. Vui lòng cấp quyền email hoặc dùng phương thức đăng nhập khác.',
          ),
          false,
        );
      }

      const user = await this.authService.validateOAuthUser({
        email: emails[0].value,
        fullName: displayName,
        providerId: id,
        provider: 'facebook',
      });

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
