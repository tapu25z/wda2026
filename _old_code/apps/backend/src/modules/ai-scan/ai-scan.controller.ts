import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiScanService } from './ai-scan.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('scan')
// ĐÃ GỠ @UseGuards() Ở ĐÂY ĐỂ PHÂN QUYỀN XUỐNG TỪNG HÀM
export class AiScanController {
  constructor(private readonly aiScanService: AiScanService) { }

  @UseGuards(JwtAuthGuard) // Bắt buộc đăng nhập
  @Post('analyze')
  @UseInterceptors(FileInterceptor('image'))
  async analyzePlantImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10485760 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp|heic)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user.userId || req.user._id || req.user.sub;
    return this.aiScanService.processImageAndDiagnose(userId, file);
  }

  @UseGuards(JwtAuthGuard) // Bắt buộc đăng nhập
  @Post('chat')
  async chatWithAi(
    @Req() req: any,
    @Body('question') question: string,
    @Body('label') label?: string,
    @Body('sessionId') sessionId?: string,
  ) {
    const userId = req.user.userId || req.user._id || req.user.sub;
    return this.aiScanService.askVirtualAssistant(userId, question, label, sessionId);
  }

  // 🔥 THÊM MỚI: API riêng cho Khách vãng lai (Không cần Auth)
  @Post('guest-chat')
  async guestChatWithAi(
    @Body('question') question: string,
    @Body('label') label?: string,
  ) {
    // Truyền null vào userId để Service hiểu đây là khách
    return this.aiScanService.askVirtualAssistant(null, question, label);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('history')
  // @Get('chat/history')
  // async getChatHistory(@Req() req: any) {
  //   const userId = req.user.userId || req.user._id || req.user.sub;
  //   return this.aiScanService.getUserChatHistory(userId);
  // }

  // 1. API lấy danh sách Lịch sử Quét ảnh (Scan)
  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getScanHistoryList(@Req() req: any) {
    const userId = req.user.userId || req.user._id || req.user.sub;
    return this.aiScanService.getUserScanHistory(userId); // Gọi đúng hàm Scan
  }

  // 2. API lấy danh sách Lịch sử Trò chuyện (Chat)
  @UseGuards(JwtAuthGuard)
  @Get('chat/history')
  async getChatHistory(@Req() req: any) {
    const userId = req.user.userId || req.user._id || req.user.sub;
    return this.aiScanService.getUserChatHistory(userId); // Gọi đúng hàm Chat
  }

  @UseGuards(JwtAuthGuard)
  @Get('chat/sessions/:sessionId/status')
  async getChatStatus(@Req() req: any, @Param('sessionId') sessionId: string) {
    const userId = req.user.userId || req.user._id || req.user.sub;
    return this.aiScanService.getChatMessageStatus(userId, sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history/:id')
  async getScanDetail(@Req() req: any, @Param('id') scanId: string) {
    const userId = req.user.userId || req.user._id || req.user.sub;
    return this.aiScanService.getScanDetail(userId, scanId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status/:scanId')
  async getScanStatus(@Req() req: any, @Param('scanId') scanId: string) {
    const userId = req.user.userId || req.user._id || req.user.sub;
    return this.aiScanService.getScanStatus(userId, scanId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('chat/sessions/:sessionId')
  async getSessionMessages(@Req() req: any, @Param('sessionId') sessionId: string) {
    const userId = req.user.userId || req.user._id || req.user.sub;
    return this.aiScanService.getSessionMessages(userId, sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('history/:id/feedback')
  async submitFeedback(@Param('id') scanId: string, @Body('isAccurate') isAccurate: boolean) {
    return this.aiScanService.updateAccuracyFeedback(scanId, isAccurate);
  }
}

