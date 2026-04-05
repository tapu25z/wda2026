import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Disease } from './disease.schema.js';

export type PlantDocument = HydratedDocument<Plant>;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Plant {
  @Prop({ required: true })
  commonName: string;

  @Prop({ required: true })
  scientificName: string;

  @Prop()
  family: string;

  @Prop()
  description: string;

  @Prop([String])
  images: string[];

  // 🔥 THÊM CÁC TRƯỜNG TỪ FRONTEND
  @Prop()
  uses: string;

  @Prop()
  care: string;

  @Prop([String])
  category: string[];

  @Prop({
    type: String,
    enum: ['Slow', 'Medium', 'Fast', 'Rất nhanh', 'Nhanh', 'Trung bình', 'Chậm'], // Thêm vào đây
    default: 'Medium'
  })
  growthRate: string;

  @Prop({ required: true })
  light: string;


  @Prop({ required: true })
  water: string;
  @Prop()
  height: string;

  @Prop()
  floweringTime: string;

  @Prop()
  suitableLocation: string;

  @Prop()
  soil: string;

  @Prop({ enum: ['APPROVED', 'PENDING', 'REJECTED'], default: 'PENDING' })
  status: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Disease' }] })
  diseases: Disease[];
}

export const PlantSchema = SchemaFactory.createForClass(Plant);