import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '@agri-scan/database'; // Import từ package chứa schema của bạn

// Tạm thời comment Controller và Service lại vì mình chưa tạo
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    // Đăng ký ProductSchema với Mongoose để có thể thao tác với Database
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
