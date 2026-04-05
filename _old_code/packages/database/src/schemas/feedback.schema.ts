import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type FeedbackDocument = HydratedDocument<Feedback>;

@Schema({ timestamps: true, collection: 'feedbacks' })
export class Feedback {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId: Types.ObjectId | User;

  @Prop({ required: true, minlength: 10, maxlength: 1000 })
  content: string;

  @Prop({
    default: 'GENERAL',
    enum: ['BUG', 'FEATURE', 'COMPLAINT', 'GENERAL'],
  })
  category: string;

  @Prop({ default: 'PENDING', enum: ['PENDING', 'REPLIED'] })
  status: string;

  // Admin reply fields
  @Prop({ type: String, default: null })
  adminReply?: string | null;

  @Prop({ type: Types.ObjectId, ref: User.name, default: null })
  repliedBy?: Types.ObjectId | User | null;

  @Prop({ type: Date, default: null })
  repliedAt?: Date | null;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

// Index để admin lấy danh sách feedback mới nhất nhanh
FeedbackSchema.index({ status: 1, createdAt: -1 });