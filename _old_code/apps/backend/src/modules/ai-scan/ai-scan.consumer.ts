import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
// ═══════════════════════════════════════════════════════════════
// BUG #8 FIX: Chuyển từ dynamic import sang static import.
// Dynamic import bên trong async handler gây ra:
//   1. Không được resolve ở thời điểm module load → lỗi tiềm ẩn khi bundle
//   2. Mỗi lần xử lý message đều phải require lại module → chậm không cần thiết
// ═══════════════════════════════════════════════════════════════
import FormData from 'form-data';
import { ScanHistory, ChatHistory } from '@agri-scan/database';
import { PlantsService } from '../plants/plants.service';

@Controller()
export class AiScanConsumer {
  private readonly logger = new Logger(AiScanConsumer.name);

  constructor(
    @InjectModel(ScanHistory.name) private scanHistoryModel: Model<ScanHistory>,
    @InjectModel(ChatHistory.name) private chatHistoryModel: Model<ChatHistory>,
    private readonly configService: ConfigService,
    private readonly plantsService: PlantsService,
  ) {}

  private get aiServiceUrl(): string {
    return this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
  }

  // --------------------------------------------------
  // CONSUMER 1: Xử lý scan ảnh từ scan_queue
  // --------------------------------------------------
  @EventPattern('scan.image.requested')
  async handleScanImage(
    @Payload() data: { scanId: string; userId: string; imageUrl: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(`[SCAN] Nhận scanId: ${data.scanId}`);

    try {
      await this.scanHistoryModel.findByIdAndUpdate(data.scanId, {
        $set: { status: 'PROCESSING' },
      });

      // Tải ảnh từ URL về buffer
      const imgRes = await axios.get(data.imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
      });

      // Gửi sang Python /predict dạng multipart/form-data
      // BUG #8 FIX: FormData đã được import static ở đầu file
      const form = new FormData();
      form.append('file', Buffer.from(imgRes.data), {
        filename: 'plant.jpg',
        contentType: 'image/jpeg',
      });

      const aiRes = await axios.post(`${this.aiServiceUrl}/predict`, form, {
        headers: form.getHeaders(),
        timeout: 60000,
      });

      const result = aiRes.data;

      if (!result.success) {
        await this.scanHistoryModel.findByIdAndUpdate(data.scanId, {
          $set: {
            status: 'FAILED',
            errorMessage: result.error || 'Không nhận diện được, vui lòng chụp rõ hơn.',
          },
        });
      } else {
        const disease = await this.plantsService.findDiseaseByLabel(result.yolo_label);

        if (!disease) {
          this.logger.warn(`[SCAN] Không tìm thấy disease cho label: ${result.yolo_label}`);
          await this.scanHistoryModel.findByIdAndUpdate(data.scanId, {
            $set: {
              status: 'COMPLETED',
              aiPredictions: [],
            },
          });
        } else {
          await this.scanHistoryModel.findByIdAndUpdate(data.scanId, {
            $set: {
              status: 'COMPLETED',
              aiPredictions: [{
                diseaseId: disease._id,
                confidence: result.confidence,
              }],
            },
          });
          this.logger.log(`[SCAN] Xong ${data.scanId} → ${disease.name} (${result.confidence})`);
        }
      }

      channel.ack(originalMsg);
    } catch (err) {
      this.logger.error(`[SCAN] Lỗi scanId: ${data.scanId}`, err.stack);
      await this.scanHistoryModel.findByIdAndUpdate(data.scanId, {
        $set: { status: 'FAILED', errorMessage: 'Hệ thống AI đang bận, vui lòng thử lại.' },
      }).catch(() => {});
      channel.nack(originalMsg, false, false);
    }
  }

  // --------------------------------------------------
  // CONSUMER 2: Xử lý chat từ chat_queue
  // --------------------------------------------------
  @EventPattern('chat.message.requested')
  async handleChatMessage(
    @Payload() data: {
      sessionId: string;
      userId: string;
      label: string;
      question: string;
      pendingMessageIndex: number;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(`[CHAT] Nhận sessionId: ${data.sessionId}`);

    try {
      const aiRes = await axios.post(
        `${this.aiServiceUrl}/chat`,
        { label: data.label, prompt: data.question },
        { timeout: 60000 },
      );

      const answerText = aiRes.data.answer
        ? String(aiRes.data.answer)
        : JSON.stringify(aiRes.data);

      const field = `messages.${data.pendingMessageIndex}`;
      await this.chatHistoryModel.findByIdAndUpdate(data.sessionId, {
        $set: {
          [`${field}.content`]: answerText,
          [`${field}.status`]: 'COMPLETED',
        },
      });

      this.logger.log(`[CHAT] Xong sessionId: ${data.sessionId}`);
      channel.ack(originalMsg);
    } catch (err) {
      this.logger.error(`[CHAT] Lỗi sessionId: ${data.sessionId}`, err.stack);
      const field = `messages.${data.pendingMessageIndex}`;
      await this.chatHistoryModel.findByIdAndUpdate(data.sessionId, {
        $set: {
          [`${field}.content`]: 'Xin lỗi, trợ lý đang bận. Vui lòng thử lại!',
          [`${field}.status`]: 'FAILED',
        },
      }).catch(() => {});
      channel.nack(originalMsg, false, false);
    }
  }
}
