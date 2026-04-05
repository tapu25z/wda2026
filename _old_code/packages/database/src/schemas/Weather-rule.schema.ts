import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherRuleDocument = WeatherRule & Document;

// =============================================
// SUB-SCHEMA: Điều kiện kích hoạt luật
// Tất cả các field đều optional - chỉ field nào
// có giá trị mới được đưa vào so sánh (AND logic)
// =============================================
@Schema({ _id: false })
export class WeatherConditions {
  /** Nhiệt độ tối thiểu để kích hoạt (°C) */
  @Prop({ type: Number, required: false })
  minTemp?: number;

  /** Nhiệt độ tối đa để kích hoạt (°C) */
  @Prop({ type: Number, required: false })
  maxTemp?: number;

  /** Độ ẩm tối thiểu để kích hoạt (%) */
  @Prop({ type: Number, required: false })
  minHumidity?: number;

  /** Độ ẩm tối đa để kích hoạt (%) */
  @Prop({ type: Number, required: false })
  maxHumidity?: number;

  /** Xác suất mưa tối thiểu để kích hoạt (0.0 - 1.0) */
  @Prop({ type: Number, required: false })
  minPop?: number;

  /** Tốc độ gió tối đa để kích hoạt (m/s) */
  @Prop({ type: Number, required: false })
  maxWindSpeed?: number;

   @Prop({ type: Number, required: false })
  minWindSpeed?: number;

  @Prop({ type: String, required: false })
  weatherMain?: string;

  /** Chỉ số UV tối thiểu để kích hoạt */
  @Prop({ type: Number, required: false })
  minUvi?: number;
}

export const WeatherConditionsSchema =
  SchemaFactory.createForClass(WeatherConditions);

// =============================================
// MAIN SCHEMA: WeatherRule
// Mỗi document là một "luật" trong hệ chuyên gia
// =============================================
@Schema({ timestamps: true, collection: 'weather_rules' })
export class WeatherRule {
  /**
   * Nhóm cây trồng mục tiêu của luật
   * 'ALL': Áp dụng cho mọi loại cây
   */
  @Prop({
    type: String,
    enum: ['ALL', 'FRUIT', 'FLOWER', 'VEGETABLE'],
    default: 'ALL',
    required: true,
  })
  targetCategory: 'ALL' | 'FRUIT' | 'FLOWER' | 'VEGETABLE';

  /**
   * Mức độ quan trọng của lời khuyên
   * WARNING: Cảnh báo nguy hiểm (màu đỏ/cam ở frontend)
   * INFO: Thông tin tham khảo (màu xanh dương)
   * RECOMMEND: Gợi ý hành động tối ưu (màu xanh lá)
   */
  @Prop({
    type: String,
    enum: ['WARNING', 'INFO', 'RECOMMEND'],
    required: true,
  })
  adviceType: 'WARNING' | 'INFO' | 'RECOMMEND';

  /** Tiêu đề ngắn gọn cho lời khuyên (hiển thị trên card) */
  @Prop({ type: String, required: true, trim: true })
  title: string;

  /** Nội dung chi tiết của lời khuyên */
  @Prop({ type: String, required: true, trim: true })
  message: string;

  /** Nguồn dữ liệu thời tiết được dùng để so sánh */
  @Prop({
    type: String,
    enum: ['current', 'hourly', 'daily'],
    default: 'current',
    required: true,
  })
  dataSource: 'current' | 'hourly' | 'daily';

  /** Tập hợp các điều kiện ngưỡng để kích hoạt luật này */
  @Prop({ type: WeatherConditionsSchema, required: true })
  conditions: WeatherConditions;

  /** Ưu tiên hiển thị (số càng cao càng quan trọng, sort DESC) */
  @Prop({ type: Number, default: 0 })
  priority: number;

  /** Trạng thái luật - cho phép bật/tắt mà không cần xóa */
  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const WeatherRuleSchema = SchemaFactory.createForClass(WeatherRule);

// Index để tối ưu query lọc theo category và trạng thái
WeatherRuleSchema.index({ targetCategory: 1, isActive: 1 });
WeatherRuleSchema.index({ priority: -1 });