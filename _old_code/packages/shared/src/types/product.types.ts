// packages/shared/src/types/product.types.ts

export type ProductCategory =
  | "FERTILIZER"
  | "PESTICIDE"
  | "SEED"
  | "TOOL"
  | "OTHER";
export type ProductStatus = "APPROVED" | "PENDING" | "REJECTED";

export interface IProduct {
  _id: string;
  sellerId: any; // Thông tin người bán (Có thể là ID dạng string hoặc Object chứa tên/email)
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  images: string[];
  stock: number;
  sold: number;
  rating: number;
  brand?: string;
  usageInstructions?: string;
  status: ProductStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProductCreate {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  images?: string[];
  stock?: number;
  brand?: string;
  usageInstructions?: string;
}

// Interface chuẩn khi API trả về danh sách có phân trang
export interface IProductListResponse {
  data: IProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
