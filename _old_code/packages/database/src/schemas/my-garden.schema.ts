import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type MyGardenDocument = HydratedDocument<MyGarden>;

@Schema({ _id: false })
export class DailyTask {
    @Prop({ required: true }) day: number;
    @Prop({ required: true }) date: Date;
    @Prop({ required: true }) weatherContext: string;
    @Prop({ required: true }) waterAction: string;
    @Prop({ required: true }) fertilizerAction: string;
    @Prop({ required: true }) careAction: string;
    @Prop({ default: false }) isCompleted: boolean;
}

@Schema({ timestamps: true, collection: 'my_gardens' })
export class MyGarden {
    @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
    userId: Types.ObjectId | User;

    // BỎ plantId, thay bằng dữ liệu định danh từ AI
    @Prop({ required: true })
    aiLabel: string; 

    @Prop()
    imageUrl: string; // Lưu ảnh cây của user

    @Prop({ type: Object })
    plantInfo: any; // Lưu toàn bộ JSON thông tin thực vật AI trả về (nếu là cây khỏe)

    @Prop({ default: 'Khỏe mạnh' })
    currentCondition: string;

    @Prop({ type: [String], default: [] })
    growthStages: string[];

    @Prop({ default: 0 })
    currentStageIndex: number; 
    
    @Prop({ default: 0 })
    progressPercentage: number; 

    @Prop({ default: Date.now })
    lastInteractionDate: Date; 
    
    @Prop({ required: true })
    customName: string; 

    @Prop()
    roadmapSummary: string; // Thêm trường này theo kết quả của Python

    @Prop({ enum: ['HEAL_DISEASE', 'GET_FRUIT', 'GET_FLOWER', 'MAINTAIN'], required: true })
    userGoal: string;

    @Prop({ type: [DailyTask], default: [] })
    careRoadmap: DailyTask[];

    @Prop({ enum: ['IN_PROGRESS', 'COMPLETED', 'FAILED'], default: 'IN_PROGRESS' })
    status: string;
}
export const MyGardenSchema = SchemaFactory.createForClass(MyGarden);