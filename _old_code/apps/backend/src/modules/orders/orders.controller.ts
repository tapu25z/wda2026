import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Toàn bộ API đơn hàng đều bắt buộc phải đăng nhập
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 1. Khách hàng bấm Đặt hàng
  @Post()
  create(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.userId, createOrderDto);
  }

  // 2. Khách hàng xem lịch sử đơn của mình
  @Get('my-orders')
  getBuyerOrders(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.ordersService.getBuyerOrders(req.user.userId, +page, +limit);
  }

  // 3. Người bán xem danh sách khách đặt hàng
  @Get('shop-orders')
  getSellerOrders(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.ordersService.getSellerOrders(req.user.userId, +page, +limit);
  }

  // 4. Người bán duyệt đơn / Hủy đơn
  @Patch(':id/status')
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      req.user.userId,
      req.user.role,
      updateOrderStatusDto,
    );
  }
}
