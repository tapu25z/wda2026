import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Order,
  OrderSchema,
  Product,
  ProductSchema,
} from '@agri-scan/database';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    // Phải import cả Order và Product vì OrderService có dùng ProductModel để trừ kho
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
