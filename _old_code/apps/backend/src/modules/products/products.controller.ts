import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductsQueryDto,
} from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Yêu cầu đăng nhập để đăng bán
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() createProductDto: CreateProductDto) {
    // req.user.userId lấy từ token giải mã
    return this.productsService.create(req.user.userId, createProductDto);
  }

  // Không cần đăng nhập cũng xem được chợ
  @Get()
  findAll(@Query() query: GetProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // Yêu cầu đăng nhập để sửa (Service sẽ check quyền bên trong)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(
      id,
      req.user.userId,
      req.user.role,
      updateProductDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.productsService.remove(id, req.user.userId, req.user.role);
  }
}
