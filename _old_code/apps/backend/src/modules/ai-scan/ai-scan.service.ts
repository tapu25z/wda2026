import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
  BadRequestException,
  UnauthorizedException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScanHistory, ChatHistory, User } from '@agri-scan/database';
import { PlantsService } from '../plants/plants.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import axios from 'axios';
import { Storage, StorageOptions } from '@google-cloud/storage';
import { extname } from 'path';

@Injectable()
export class AiScanService implements OnModuleInit {
  private readonly logger = new Logger(AiScanService.name);

  // 1. Khai báo biến storage
  private storage: Storage;
  private bucketName: string;

  constructor(
    @InjectModel(ScanHistory.name) private scanHistoryModel: Model<ScanHistory>,
    @InjectModel(ChatHistory.name) private chatHistoryModel: Model<ChatHistory>,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('SCAN_SERVICE') private readonly scanClient: ClientProxy,
    @Inject('CHAT_SERVICE') private readonly chatClient: ClientProxy,
    private readonly plantsService: PlantsService,
    private readonly configService: ConfigService,
  ) {
    // 2. Cấu hình Google Cloud Storage Client (Bọc thép chống lỗi)
    this.bucketName = this.configService.get<string>('GCS_BUCKET_NAME', '');

    const projectId = this.configService.get<string>('GCS_PROJECT_ID');
    const clientEmail = this.configService.get<string>('GCS_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('GCS_PRIVATE_KEY');

    const storageOptions: StorageOptions = {
      projectId: projectId,
    };

    // LOGIC TÙY CƠ ỨNG BIẾN: Local dùng Key, Server dùng ADC
    if (clientEmail && privateKey) {
      try {
        // Xử lý triệt để: Xóa dấu nháy kép thừa và chuyển chuỗi "\n" thành ký tự xuống dòng thực tế
        const formattedPrivateKey = privateKey
          .replace(/^"|"$/g, '')
          .replace(/\\n/g, '\n');

        storageOptions.credentials = {
          client_email: clientEmail,
          private_key: formattedPrivateKey,
        };
        this.logger.log('☁️ GCS Init: Đang chạy bằng Private Key (Local Mode)');
      } catch (error) {
        this.logger.error(
          '❌ Lỗi Parse Private Key GCS. Kiểm tra lại file .env!',
          error,
        );
      }
    } else {
      this.logger.log(
        '☁️ GCS Init: Không tìm thấy Key, tự động dùng ADC (Server Mode)',
      );
    }

    this.storage = new Storage(storageOptions);
  }

  // ═══════════════════════════════════════════════════════════════
  // ROOT CAUSE FIX: ClientProxy là lazy — không tự connect khi inject.
  // Lần đầu gọi .emit() nó cố connect; nếu RabbitMQ chưa sẵn sàng
  // hoặc URL sai → throw error → bị catch → rollback quota → 500.
  // ═══════════════════════════════════════════════════════════════
  async onModuleInit() {
    try {
      await this.scanClient.connect();
      this.logger.log('[RabbitMQ] scanClient (scan_queue) connected');
    } catch (err) {
      this.logger.error('[RabbitMQ] scanClient connect failed:', err.message);
    }

    try {
      await this.chatClient.connect();
      this.logger.log('[RabbitMQ] chatClient (chat_queue) connected');
    } catch (err) {
      this.logger.error('[RabbitMQ] chatClient connect failed:', err.message);
    }
  }

  private get aiServiceUrl(): string {
    return this.configService.get<string>(
      'AI_SERVICE_URL',
      'http://localhost:8000',
    );
  }

  // 3. Hàm uploadImage bảo mật, chống sập (Fault-tolerance)
  private async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.bucketName) {
        this.logger.error('❌ GCS_BUCKET_NAME chưa được cấu hình!');
        return reject(new Error('Lỗi cấu hình máy chủ lưu trữ.'));
      }

      if (!file || !file.buffer) {
        return reject(new Error('Không tìm thấy dữ liệu ảnh để upload.'));
      }

      const bucket = this.storage.bucket(this.bucketName);

      // Tạo tên file độc nhất (dùng Timestamp + Random)
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = extname(file.originalname || '.jpg');
      const filename = `scans/${uniqueSuffix}${ext}`;

      const blob = bucket.file(filename);

      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
      });

      blobStream.on('error', (err) => {
        this.logger.error(`❌ Lỗi ghi file lên GCS: ${err.message}`, err.stack);
        reject(new Error('Quá trình lưu ảnh thất bại. Vui lòng thử lại sau.'));
      });

      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${blob.name}`;
        this.logger.log(`✅ Upload thành công: ${publicUrl}`);
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  }

  // ==========================================
  // XỬ LÝ ẢNH (RABBITMQ)
  // ==========================================
  async processImageAndDiagnose(
    userId: string,
    imageFile: Express.Multer.File,
  ) {
    await this.checkAndIncrementQuota(userId, 'IMAGE');

    try {
      const savedImageUrl = await this.uploadImage(imageFile);

      const newScan = new this.scanHistoryModel({
        userId,
        imageUrl: savedImageUrl,
        aiPredictions: [],
        scannedAt: new Date(),
        status: 'PENDING',
      });
      await newScan.save();

      this.scanClient.emit('scan.image.requested', {
        scanId: newScan._id.toString(),
        userId,
        imageUrl: savedImageUrl,
      });

      return {
        scanHistoryId: newScan._id,
        imageUrl: savedImageUrl,
        status: 'PROCESSING',
        message:
          'Ảnh đang được hệ thống phân tích, kết quả sẽ cập nhật sau giây lát...',
      };
    } catch (error) {
      this.logger.error('Lỗi khi đẩy task scan vào queue:', error.message);
      if (
        !(error instanceof BadRequestException) &&
        !(error instanceof UnauthorizedException)
      ) {
        await this.userModel.findByIdAndUpdate(userId, {
          $inc: { dailyImageCount: -1 },
        });
      }
      throw error;
    }
  }

  async getScanStatus(userId: string, scanId: string) {
    const scan = await this.scanHistoryModel
      .findOne({ _id: scanId, userId })
      .populate({
        path: 'aiPredictions.diseaseId',
        select: 'name pathogen type symptoms treatments',
      })
      .exec();

    if (!scan) throw new NotFoundException('Không tìm thấy lịch sử quét này!');

    if (
      (scan as any).status === 'PENDING' ||
      (scan as any).status === 'PROCESSING'
    ) {
      return { status: 'PROCESSING', message: 'Đang phân tích...' };
    }

    if ((scan as any).status === 'FAILED') {
      return { status: 'FAILED', message: (scan as any).errorMessage };
    }

    return {
      status: 'COMPLETED',
      scanHistoryId: scan._id,
      imageUrl: scan.imageUrl,
      predictions: scan.aiPredictions,
      topDisease: scan.aiPredictions[0]?.diseaseId ?? null,
    };
  }

  // ==========================================
  // CHAT TRỢ LÝ ẢO (RABBITMQ)
  // ==========================================
  async askVirtualAssistant(
    userId: string | null,
    question: string,
    diseaseLabel?: string,
    sessionId?: string,
  ) {
    const finalLabel = diseaseLabel || 'Cây trồng';

    // Khách vãng lai → gọi thẳng HTTP, không qua queue
    if (!userId) {
      try {
        const aiResponse = await axios.post(`${this.aiServiceUrl}/chat`, {
          label: finalLabel,
          prompt: question,
        });
        return {
          sessionId: 'guest_session',
          question,
          answer: aiResponse.data.answer
            ? String(aiResponse.data.answer)
            : JSON.stringify(aiResponse.data),
          status: 'COMPLETED',
        };
      } catch (error) {
        this.logger.error('[GUEST CHAT] AI Service error:', error.message);
        throw new InternalServerErrorException(
          'Trợ lý ảo đang bận, vui lòng thử lại!',
        );
      }
    }

    // Người dùng đã đăng nhập → dùng RabbitMQ
    await this.checkAndIncrementQuota(userId, 'PROMPT');

    try {
      let chatDoc: any;
      if (sessionId) {
        chatDoc = await this.chatHistoryModel.findOne({
          _id: sessionId,
          userId,
        });
      }

      if (!chatDoc) {
        const autoTitle =
          question.trim().length > 0
            ? question.trim().slice(0, 50) +
              (question.trim().length > 50 ? '...' : '')
            : 'Cuộc hội thoại mới';
        chatDoc = new this.chatHistoryModel({
          userId,
          title: autoTitle,
          messages: [],
        });
      }

      chatDoc.messages.push({
        role: 'user',
        content: question,
        timestamp: new Date(),
        status: 'COMPLETED',
      });

      const pendingIndex = chatDoc.messages.length;
      chatDoc.messages.push({
        role: 'ai',
        content: '__PENDING__',
        timestamp: new Date(),
        status: 'PENDING',
      });

      await chatDoc.save();

      this.chatClient.emit('chat.message.requested', {
        sessionId: chatDoc._id.toString(),
        userId,
        label: finalLabel,
        question,
        pendingMessageIndex: pendingIndex,
      });

      return {
        sessionId: chatDoc._id,
        question,
        answer: null,
        status: 'PROCESSING',
        message: 'Trợ lý đang soạn câu trả lời...',
      };
    } catch (error) {
      // Chỉ rollback khi là lỗi hệ thống, không rollback khi quota hết
      if (
        !(error instanceof BadRequestException) &&
        !(error instanceof UnauthorizedException)
      ) {
        this.logger.error(
          `[CHAT] Lỗi hệ thống, hoàn lại lượt prompt cho user ${userId}: ${error.message}`,
        );
        await this.userModel.findByIdAndUpdate(userId, {
          $inc: { dailyPromptCount: -1 },
        });
      }
      throw new InternalServerErrorException(
        'Trợ lý ảo đang bận, vui lòng thử lại sau!',
      );
    }
  }

  // ==========================================
  // CÁC HÀM HỖ TRỢ
  // ==========================================
  private async checkAndIncrementQuota(
    userId: string,
    type: 'IMAGE' | 'PROMPT',
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('Không tìm thấy người dùng');

    const today = new Date();
    const lastReset = new Date(user.lastResetDate);

    if (lastReset.toDateString() !== today.toDateString()) {
      await this.userModel.findByIdAndUpdate(userId, {
        $set: { dailyImageCount: 0, dailyPromptCount: 0, lastResetDate: today },
      });
      user.dailyImageCount = 0;
      user.dailyPromptCount = 0;
    }

    if (
      user.plan !== 'FREE' &&
      user.planExpiresAt &&
      user.planExpiresAt < today
    ) {
      await this.userModel.findByIdAndUpdate(userId, {
        $set: { plan: 'FREE', planExpiresAt: null },
      });
      user.plan = 'FREE';
    }

    const limits = {
      IMAGE: { FREE: 3, PREMIUM: 10, VIP: Infinity },
      PROMPT: { FREE: 10, PREMIUM: 50, VIP: Infinity },
    };
    const maxCount = limits[type][user.plan] ?? 3;
    const countField =
      type === 'IMAGE' ? 'dailyImageCount' : 'dailyPromptCount';

    if (user[countField] >= maxCount) {
      throw new BadRequestException(`Đã hết lượt sử dụng gói ${user.plan}.`);
    }

    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { [countField]: 1 },
    });
  }

  async getScanDetail(userId: string, scanId: string) {
    const scan = await this.scanHistoryModel
      .findOne({ _id: scanId, userId })
      .populate('aiPredictions.diseaseId')
      .exec();
    if (!scan) throw new NotFoundException('Không tìm thấy lịch sử quét!');
    return scan;
  }

  async getChatMessageStatus(userId: string, sessionId: string) {
    const chatDoc = await this.chatHistoryModel
      .findOne({ _id: sessionId, userId })
      .exec();
    if (!chatDoc)
      throw new NotFoundException('Không tìm thấy phiên hội thoại!');

    const lastMessage = chatDoc.messages[chatDoc.messages.length - 1];
    if (!lastMessage) return { status: 'EMPTY' };

    if (
      lastMessage.role === 'ai' &&
      (lastMessage as any).status === 'PENDING'
    ) {
      return {
        status: 'PROCESSING',
        message: 'Trợ lý đang soạn câu trả lời...',
      };
    }

    return {
      status: 'COMPLETED',
      sessionId: chatDoc._id,
      answer: lastMessage.content,
      messages: chatDoc.messages,
    };
  }

  async getUserScanHistory(userId: string) {
    return this.scanHistoryModel
      .find({ userId })
      .populate({
        path: 'aiPredictions.diseaseId',
        select: 'name pathogen type treatments',
      })
      .sort({ scannedAt: -1 })
      .exec();
  }

  async getUserChatHistory(userId: string) {
    const sessions = await this.chatHistoryModel
      .find({ userId })
      .select('_id title createdAt updatedAt')
      .sort({ createdAt: -1 })
      .exec();
    return sessions.map((s) => ({
      sessionId: (s._id as any).toString(),
      title: s.title,
      createdAt: (s as any).createdAt,
      updatedAt: (s as any).updatedAt,
    }));
  }

  async getSessionMessages(userId: string, sessionId: string) {
    const chatDoc = await this.chatHistoryModel
      .findOne({ _id: sessionId, userId })
      .exec();
    if (!chatDoc) return { sessionId, title: null, messages: [] };
    return {
      sessionId: chatDoc._id,
      title: chatDoc.title,
      messages: chatDoc.messages,
    };
  }

  async updateAccuracyFeedback(scanId: string, isAccurate: boolean) {
    const updatedScan = await this.scanHistoryModel.findByIdAndUpdate(
      scanId,
      { isAccurate },
      { new: true },
    );
    if (!updatedScan)
      throw new NotFoundException('Không tìm thấy lịch sử quét này');
    return updatedScan;
  }
}
