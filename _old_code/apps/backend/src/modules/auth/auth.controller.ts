import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  // ── EMAIL + PASSWORD ────────────────────────────────────────

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Req() req: any) {
    return this.authService.logout(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshToken(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new BadRequestException('Vui lòng cung cấp Refresh Token!');
    }
    return this.authService.refreshToken(body.refreshToken);
  }

  // ── QUÊN / ĐỔI MẬT KHẨU ────────────────────────────────────

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.email, body.resetToken, body.newPassword);
  }

  // ── THIẾT LẬP MẬT KHẨU LẦN ĐẦU (CHỈ DÀNH CHO OAUTH USER) ──
  // Điều kiện: Đã đăng nhập (có JWT) nhưng isPasswordSet = false

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('set-password')
  setPassword(@Req() req: any, @Body() body: SetPasswordDto) {
    return this.authService.setPassword(req.user.userId, body.newPassword);
  }

  // ── GOOGLE OAUTH ────────────────────────────────────────────

  /**
   * Bước 1: Chuyển hướng người dùng sang trang đăng nhập Google.
   * Frontend gọi: GET /auth/google
   * (Với mobile: mở in-app browser hoặc WebView tới URL này)
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Passport tự redirect → không cần return gì
  }

  /**
   * Bước 2: Google gọi lại URL này sau khi user chấp thuận.
   * Sau đó redirect về frontend kèm token trong query string.
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.handleOAuthCallback(req.user);
    this.redirectWithTokens(res, result);
  }

  // ── FACEBOOK OAUTH ──────────────────────────────────────────

  /**
   * Bước 1: Chuyển hướng người dùng sang trang đăng nhập Facebook.
   * Frontend gọi: GET /auth/facebook
   */
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookLogin() {
    // Passport tự redirect → không cần return gì
  }

  /**
   * Bước 2: Facebook gọi lại URL này sau khi user chấp thuận.
   */
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.handleOAuthCallback(req.user);
    this.redirectWithTokens(res, result);
  }
private redirectWithTokens(
  res: Response,
  result: { user: any; accessToken: string; refreshToken: string },
) {
  const baseUrl = this.configService.getOrThrow<string>('OAUTH_SUCCESS_REDIRECT');
  const url = new URL(baseUrl);
  url.searchParams.set('accessToken', result.accessToken);
  url.searchParams.set('refreshToken', result.refreshToken);
  url.searchParams.set('user', encodeURIComponent(JSON.stringify(result.user)));
  res.redirect(url.toString());
}
  // 🔥 THÊM MỚI: API dành riêng cho Mobile xác thực Google Token
  @HttpCode(HttpStatus.OK)
  @Post('google/verify-token')
  verifyGoogleToken(@Body() body: { idToken: string }) {
    if (!body.idToken) {
      throw new BadRequestException('Không tìm thấy Google Token!');
    }
    return this.authService.verifyGoogleTokenForMobile(body.idToken);
  }
}
