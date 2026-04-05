import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type ChatHistoryDocument = HydratedDocument<ChatHistory>;

// Định nghĩa cấu trúc của 1 tin nhắn trong hội thoại
export interface IChatMessage {
  role: 'user' | 'ai'; 
  content: string;     
  timestamp: Date;  
  status?: 'PENDING' | 'COMPLETED' | 'FAILED'; 
}


@Schema({
  timestamps: true, 
  collection: 'chat_histories' 
})

export class ChatHistory  {

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId: Types.ObjectId | User;


  @Prop({ type: String, default: 'Cuộc hội thoại mới' })
  title: string;


  @Prop({
    type: [
      {
        role: { type: String, enum: ['user', 'ai'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        status: {                                     
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'COMPLETED',
      },
      }
    ],
    default: []
  })
  messages: IChatMessage[];
}

export const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory);

// Index kết hợp: tối ưu truy vấn lấy tất cả sessions của 1 user
ChatHistorySchema.index({ userId: 1, createdAt: -1 });