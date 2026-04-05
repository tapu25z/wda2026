import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '@agri-scan/database';
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductsQueryDto,
  ApproveProductDto,
} from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(
    sellerId: string,
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    const newProduct = new this.productModel({
      ...createProductDto,
      sellerId: new Types.ObjectId(sellerId),
      status: 'APPROVED', // 🔥 KHÔNG CẦN DUYỆT: Đăng xong là lên kệ bán luôn cho lẹ!
    });
    return newProduct.save();
  }

  async findAll(query: GetProductsQueryDto) {
    const { page = 1, limit = 20, search, category, sellerId } = query;
    const skip = (page - 1) * limit;

    // Chỉ lấy sản phẩm đang bật isActive và được phép bán
    const filter: Record<string, any> = { isActive: true, status: 'APPROVED' };

    if (category) filter.category = category;
    if (sellerId) filter.sellerId = new Types.ObjectId(sellerId);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('sellerId', 'fullName email') // Kéo luôn tên ông chủ gian hàng ra
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ _id: id, isActive: true })
      .populate('sellerId', 'fullName email')
      .lean();
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm này!');
    return product;
  }

  async update(
    id: string,
    userId: string,
    userRole: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại!');

    // Chỉ chủ món hàng hoặc Admin mới được sửa
    if (product.sellerId.toString() !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa sản phẩm của người khác!',
      );
    }

    Object.assign(product, updateProductDto);
    return product.save();
  }

  async remove(id: string, userId: string, userRole: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại!');

    if (product.sellerId.toString() !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Bạn không có quyền xóa sản phẩm của người khác!',
      );
    }

    product.isActive = false; // Xóa mềm
    await product.save();
    return { message: 'Đã ngừng kinh doanh sản phẩm này!' };
  }

  // ==============================================================
  // CÁC HÀM HỖ TRỢ CHO ĐƠN HÀNG (GIỮ NGUYÊN)
  // ==============================================================

  async approveProduct(id: string, dto: ApproveProductDto) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại!');

    product.status = dto.status;
    await product.save();
    return {
      message: `Đã ${dto.status === 'APPROVED' ? 'duyệt' : 'từ chối'} sản phẩm thành công!`,
    };
  }

  // Hàm này Order sẽ gọi để trừ kho khi có người mua
  async updateStockAndSold(productId: string, quantityToDeduct: number) {
    const product = await this.productModel.findById(productId);

    if (!product || !product.isActive || product.status !== 'APPROVED') {
      throw new BadRequestException(
        `Sản phẩm không tồn tại hoặc đã ngừng bán!`,
      );
    }

    if (product.stock < quantityToDeduct) {
      throw new BadRequestException(
        `Sản phẩm ${product.name} không đủ số lượng tồn kho! (Chỉ còn ${product.stock})`,
      );
    }

    product.stock -= quantityToDeduct;
    product.sold += quantityToDeduct;

    await product.save();
    return product;
  }
}
