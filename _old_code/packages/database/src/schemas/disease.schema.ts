import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DiseaseDocument = HydratedDocument<Disease>;

@Schema()
class Treatment {
  @Prop([String])
  biological: string[]; // Biện pháp sinh học

  @Prop([String])
  chemical: string[];   // Biện pháp hóa học

  @Prop([String])
  preventive: string[]; // Biện pháp phòng ngừa
}

@Schema({ timestamps: true })
export class Disease {
  @Prop({ required: true })
  name: string; // Tên bệnh

  // ĐỔI required: false vì AI data không có pathogen cụ thể
  @Prop({ type: String, default: null })
  pathogen?: string | null;

  @Prop({ type: String, default: null })
  commonName?: string | null;

   @Prop({ type: String, default: null })
  description?: string | null;

  @Prop({ enum: ['FUNGUS', 'BACTERIA', 'VIRUS', 'PEST', 'NUTRIENT', 'HEALTHY'] })
  type: string;

  @Prop([String])
  symptoms: string[]; // Danh sách triệu chứng

  @Prop({ type: Treatment })
  treatments: Treatment; // Phác đồ điều trị

  // 🔥 THÊM MỚI: Trạng thái phê duyệt
  @Prop({ enum: ['APPROVED', 'PENDING', 'REJECTED'], default: 'PENDING' })
  status: string;
}

export const DiseaseSchema = SchemaFactory.createForClass(Disease);