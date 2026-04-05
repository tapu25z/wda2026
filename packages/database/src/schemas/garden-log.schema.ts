import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';
import { GardenPlant } from './garden-plant.schema';

export type GardenLogDocument = HydratedDocument<GardenLog>;

/**
 * MyGarden — nhật ký canh tác.
 * Luồng chẩn đoán: mỗi lần user gửi **ảnh theo ngày** cho một cây → một dòng `DAILY_CHECK`;
 * worker/AI ghi `diagnosisText` khi xong (bất đồng bộ thì dùng diagnosisStatus).
 */
@Schema({ timestamps: true, collection: 'garden_logs' })
export class GardenLog {
  @Prop({ type: Types.ObjectId, ref: GardenPlant.name, required: true, index: true })
  gardenPlantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  authorId: Types.ObjectId;

  @Prop({
    enum: ['NOTE', 'DAILY_CHECK', 'HARVEST', 'CARE'],
    required: true,
  })
  kind: string;

  @Prop({ type: String, default: null })
  note: string | null;

  /** Bắt buộc khi kind = DAILY_CHECK — ảnh chụp cây trong ngày */
  @Prop({ type: String, default: null })
  imageUrl: string | null;

  /** Kết quả chẩn đoán dạng văn bản (một đoạn), điền sau khi AI xử lý xong */
  @Prop({ type: String, default: null })
  diagnosisText: string | null;

  @Prop({
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'NA'],
    default: 'NA',
  })
  diagnosisStatus: string;

  @Prop({ type: String, default: null })
  diagnosisError: string | null;

  @Prop({ type: Number, default: null })
  harvestQuantity: number | null;

  @Prop({ type: String, default: null })
  harvestUnit: string | null;
}

export const GardenLogSchema = SchemaFactory.createForClass(GardenLog);

GardenLogSchema.index({ gardenPlantId: 1, createdAt: -1 });
