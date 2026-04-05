import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';
import { GardenPlant } from './garden-plant.schema';

export type ListingDocument = HydratedDocument<Listing>;

/**
 * E-Farm: niêm yết nông sản gắn bắt buộc với một cây/lô trong MyGarden.
 * traceCodeSnapshot: bản sao tại thời điểm đăng — QR vẫn đúng nếu plant đổi sau này.
 */
@Schema({ timestamps: true, collection: 'listings' })
export class Listing {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  sellerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: GardenPlant.name, required: true, index: true })
  gardenPlantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 'kg' })
  unit: string;

  @Prop({ required: true, min: 0 })
  quantityAvailable: number;

  @Prop({ type: [String], default: [] })
  imageUrls: string[];

  @Prop({ required: true })
  traceCodeSnapshot: string;

  @Prop({
    enum: ['DRAFT', 'ACTIVE', 'SOLD_OUT', 'ARCHIVED'],
    default: 'DRAFT',
    index: true,
  })
  status: string;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);

ListingSchema.index({ sellerId: 1, createdAt: -1 });
ListingSchema.index({ status: 1, createdAt: -1 });
