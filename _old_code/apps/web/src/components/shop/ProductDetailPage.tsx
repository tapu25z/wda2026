"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ShoppingCart,
  Star,
  Store,
  CheckCircle,
  Heart,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { productApi } from "@agri-scan/shared";
import { CATEGORY_LABEL } from "../../constants/shop.constants";
import { IProduct } from "@agri-scan/shared";

export function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { addToCart, cartCount } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await productApi.getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Sản phẩm không tồn tại
          </h2>
          <p className="text-gray-500 mb-6">
            Sản phẩm bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="px-6 py-2 bg-primary text-white rounded-full font-medium"
          >
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/shop/cart");
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span
              className="hover:text-primary cursor-pointer"
              onClick={() => router.push("/")}
            >
              Trang chủ
            </span>
            <ChevronRight size={16} />
            <span
              className="hover:text-primary cursor-pointer"
              onClick={() => router.push("/shop")}
            >
              Cửa hàng
            </span>
            <ChevronRight size={16} />
            <span className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-md">
              {product.name}
            </span>
          </div>
          <button
            onClick={() => router.push("/shop/cart")}
            className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full relative transition-colors"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left: Product Image */}
            <div className="w-full md:w-1/2 lg:w-5/12 p-6 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 relative group">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition-colors shadow-sm"
                >
                  <Heart
                    size={24}
                    className={
                      isLiked ? "fill-red-500 text-red-500" : "text-gray-400"
                    }
                  />
                </button>
              </div>

              {/* Thumbnails (if multiple images exist) */}
              {product.images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 hide-scrollbar">
                  {product.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-20 h-20 rounded-xl border-2 border-primary overflow-hidden flex-shrink-0 cursor-pointer"
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="w-full md:w-1/2 lg:w-7/12 p-6 lg:p-10 flex flex-col">
              <div className="mb-2 flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                  {CATEGORY_LABEL[product.category] ?? product.category}
                </span>
                {product.stock > 0 ? (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full flex items-center gap-1">
                    <CheckCircle size={12} /> Còn hàng
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                    Hết hàng
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  <Star size={18} className="text-amber-400 fill-amber-400" />
                  <span className="font-bold text-gray-900 text-base">
                    {product.rating}
                  </span>
                </div>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>
                  Đã bán{" "}
                  <span className="font-medium text-gray-900">
                    {product.sold}
                  </span>
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>
                  Kho:{" "}
                  <span className="font-medium text-gray-900">
                    {product.stock}
                  </span>
                </span>
              </div>

              <div className="text-4xl font-bold text-red-500 mb-8">
                {product.price.toLocaleString("vi-VN")} đ
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-gray-700 font-medium">Số lượng:</span>
                <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-gray-600 hover:bg-gray-200 rounded-l-xl transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="p-3 text-gray-600 hover:bg-gray-200 rounded-r-xl transition-colors disabled:opacity-50"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.stock} sản phẩm có sẵn
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAdding}
                  className={`flex-1 py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isAdding
                      ? "bg-emerald-500 text-white"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isAdding ? (
                      <motion.div
                        key="added"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle size={20} />
                        Đã thêm vào giỏ
                      </motion.div>
                    ) : (
                      <motion.div
                        key="add"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart size={20} />
                        Thêm vào giỏ hàng
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mua Ngay
                </motion.button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="text-emerald-500 flex-shrink-0"
                    size={24}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Cam kết chính hãng
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Hoàn tiền 111% nếu hàng giả
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="text-blue-500 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Giao hàng toàn quốc
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Hỗ trợ phí ship cho đơn từ 500k
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column: Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Mô tả sản phẩm
              </h3>
              <div className="prose prose-emerald max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          </div>

          {/* Right Column: Seller Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Thông tin người bán
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <Store size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    {product.sellerId && typeof product.sellerId === "object"
                      ? product.sellerId.fullName
                      : "Người bán"}
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium mt-1">
                    <CheckCircle size={14} /> Người bán uy tín
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="text-xl font-bold text-gray-900">4.9</div>
                  <div className="text-xs text-gray-500 mt-1">Đánh giá</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="text-xl font-bold text-gray-900">1.2k</div>
                  <div className="text-xs text-gray-500 mt-1">Sản phẩm</div>
                </div>
              </div>
              <button className="w-full py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors">
                Xem Shop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
