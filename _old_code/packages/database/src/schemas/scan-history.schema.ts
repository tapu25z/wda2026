import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema.js';
import { Disease } from './disease.schema.js';

export type ScanHistoryDocument = HydratedDocument<ScanHistory>;

@Schema()
class AIPrediction {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Disease' })
  diseaseId: Disease;

  @Prop()
  confidence: number; // Độ tin cậy (0.95 = 95%)
}

@Schema({ timestamps: true })
export class ScanHistory {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  imageUrl: string;

  @Prop([AIPrediction])
  aiPredictions: AIPrediction[];

  @Prop({ type: Boolean, default: null })
  isAccurate: boolean | null;

  @Prop({
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING', // FIX: Phải là PENDING, Consumer sẽ cập nhật thành COMPLETED sau khi xử lý xong
  })
  status: string;
  
  @Prop({ type: String, default: null })
  errorMessage?: string | null;

  @Prop({ default: () => new Date() })
  scannedAt: Date;
}

export const ScanHistorySchema = SchemaFactory.createForClass(ScanHistory);