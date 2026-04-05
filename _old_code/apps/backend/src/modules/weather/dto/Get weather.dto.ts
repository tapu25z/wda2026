import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class GetWeatherDto {
  /**
   * Vĩ độ của vị trí cần lấy thời tiết
   * @example 10.8231 (TP.HCM)
   */
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Transform(({ value }) => parseFloat(value)) // Query param đến dưới dạng string, cần parse
  lat: number;

  /**
   * Kinh độ của vị trí cần lấy thời tiết
   * @example 106.6297 (TP.HCM)
   */
  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Transform(({ value }) => parseFloat(value))
  lon: number;

  /**
   * Loại cây trồng để lọc lời khuyên phù hợp
   * Mặc định 'ALL' nếu không truyền
   */
  @IsOptional()
  @IsEnum(['ALL', 'FRUIT', 'FLOWER', 'VEGETABLE'], {
    message: 'category phải là một trong: ALL, FRUIT, FLOWER, VEGETABLE',
  })
  category?: 'ALL' | 'FRUIT' | 'FLOWER' | 'VEGETABLE' = 'ALL';
}