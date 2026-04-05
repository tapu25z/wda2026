import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type ChatSessionDocument = HydratedDocument<ChatSession>;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

/**
 * Chatbot hỏi–đáp dạng văn bản (kiểu GPT/Gemini), không gắn chẩn đoán ảnh.
 * Một phiên = nhiều tin nhắn; role "assistant" = phản hồi model.
 */
@Schema({ timestamps: true, collection: 'chat_sessions' })
export class ChatSession {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ trim: true, default: 'Cuộc trò chuyện mới' })
  title: string;

  @Prop({
    type: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  messages: ChatMessage[];
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);

ChatSessionSchema.index({ userId: 1, updatedAt: -1 });
