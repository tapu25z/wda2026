import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type GardenPlantDocument = HydratedDocument<GardenPlant>;

/**
 * Một "cây / lô" trong MyGarden — hồ sơ canh tác + QR truy xuất.
 * traceCode: mã công khai (đưa vào URL QR), unique toàn cục.
 */
@Schema({ timestamps: true, collection: 'garden_plants' })
export class GardenPlant {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  displayName: string;

  /** Gợi ý loài cây (AI hoặc người nhập) — không cần bảng Plant riêng */
  @Prop({ type: String, default: null, trim: true })
  speciesLabel: string | null;

  @Prop({ type: String, default: null })
  coverImageUrl: string | null;

  /** Trạng thái sức khỏe tóm tắt (cập nhật khi có chẩn đoán / nhật ký) */
  @Prop({ type: String, default: 'UNKNOWN' })
  healthSummary: string;

  @Prop({ required: true, unique: true, index: true })
  traceCode: string;

  /**
   * Chỉ listing khi đạt chuẩn (rule nghiệp vụ: ví dụ sau khi admin / quy trình xác nhận).
   * Đơn giản hóa: một boolean; sau có thể thay bằng enum + thời điểm duyệt.
   */
  @Prop({ default: false })
  eligibleForListing: boolean;

  @Prop({ enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' })
  status: string;
}

export const GardenPlantSchema = SchemaFactory.createForClass(GardenPlant);

GardenPlantSchema.index({ ownerId: 1, updatedAt: -1 });
