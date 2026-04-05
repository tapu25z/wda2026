import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1, { message: 'Số lượng mua phải lớn hơn 0' })
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Thiếu thông tin người bán (sellerId)' })
  sellerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập địa chỉ giao hàng' })
  shippingAddress: string;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  phoneNumber: string;

  @IsEnum(['COD', 'VNPAY', 'MOMO', 'BANK_TRANSFER'])
  paymentMethod: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'], {
    message: 'Trạng thái đơn hàng không hợp lệ',
  })
  status: string;

  @IsOptional()
  @IsString()
  cancelReason?: string;
}
