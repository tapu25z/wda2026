import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ApproveProductDto {
  @IsEnum(['APPROVED', 'REJECTED'], {
    message:
      'Trạng thái chỉ có thể là APPROVED (Duyệt) hoặc REJECTED (Từ chối)',
  })
  status: 'APPROVED' | 'REJECTED';
}
export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Mô tả sản phẩm không được để trống' })
  description: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Giá bán phải là số' })
  @Min(0)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @IsEnum(['FERTILIZER', 'PESTICIDE', 'SEED', 'TOOL', 'OTHER'])
  category: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  usageInstructions?: string;
}

export class UpdateProductDto extends CreateProductDto {}

export class GetProductsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  sellerId?: string; // Để lọc xem sản phẩm của 1 người cụ thể

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
