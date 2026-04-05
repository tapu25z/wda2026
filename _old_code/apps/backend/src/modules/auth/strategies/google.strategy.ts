import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const { id, name, emails } = profile;

      if (!emails || emails.length === 0) {
        return done(
          new Error('Tài khoản Google không có email. Vui lòng dùng phương thức khác.'),
          false,
        );
      }

      const user = await this.authService.validateOAuthUser({
        email: emails[0].value,
        fullName: `${name.givenName ?? ''} ${name.familyName ?? ''}`.trim(),
        providerId: id,
        provider: 'google',
      });

      done(null, user as any);
    } catch (error) {
      done(error, false);
    }
  }
}
