import {
  IsEnum,
  IsOptional,
  IsString,
  Min,
  IsInt,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserPlanDto {
  @IsEnum(['FREE', 'PREMIUM', 'VIP'])
  plan: 'FREE' | 'PREMIUM' | 'VIP';
}

export class GetUsersQueryDto {
  @IsOptional()
  @IsEnum(['FREE', 'PREMIUM', 'VIP'])
  plan?: string;

  @IsOptional()
  @IsEnum(['FARMER', 'EXPERT', 'ADMIN'])
  role?: string;

  @IsOptional()
  @IsString()
  search?: string; // tìm theo email hoặc fullName

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class SubmitFeedbackDto {
  @IsString()
  @IsEnum(['BUG', 'FEATURE', 'COMPLAINT', 'GENERAL'])
  category: string;

  @IsString()
  @MinLength(10, { message: 'Nội dung phản hồi phải có ít nhất 10 ký tự.' })
  @MaxLength(1000, { message: 'Nội dung không được vượt quá 1000 ký tự.' })
  content: string;
}
