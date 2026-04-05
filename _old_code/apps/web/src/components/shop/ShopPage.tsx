"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, ChevronRight, Star, Filter } from "lucide-react";
// import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { productApi } from "@agri-scan/shared";
import {
  CATEGORY_MAP,
  CATEGORY_LABEL,
  CATEGORIES,
} from "../../constants/shop.constants";
import { IProduct } from "@agri-scan/shared";
import { useRouter } from 'next/navigation';

// const CATEGORIES = ["Tất cả", "Phân bón", "Thuốc BVTV", "Hạt giống", "Dụng cụ"];

export function ShopPage() {
  const navigate = useRouter();
  const { cartCount } = useCart();
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await productApi.getProducts({
          category: CATEGORY_MAP[activeCategory] || undefined,
          search: searchQuery || undefined,
        });
        setProducts(res.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, searchQuery]);

  const filteredProducts = products.filter((p) => {
    const matchCat =
      activeCategory === "Tất cả" || p.category === activeCategory;
    const matchSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      {/* Header / Breadcrumb area */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span
              className="hover:text-primary cursor-pointer"
              onClick={() => navigate.push("/")}
            >
              Trang chủ
            </span>
            <ChevronRight size={16} />
            <span className="font-medium text-gray-900">
              Cửa hàng Agri-Shop
            </span>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm vật tư nông nghiệp..."
                className="w-full bg-gray-100 text-sm rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => navigate.push("/shop/cart")}
              className="p-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-full relative transition-colors"
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Categories (Desktop) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter size={18} className="text-primary" />
              Danh mục sản phẩm
            </h2>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Categories (Horizontal Scroll) */}
        <div className="md:hidden overflow-x-auto hide-scrollbar flex gap-2 pb-2 -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {activeCategory === "Tất cả" ? "Tất cả sản phẩm" : activeCategory}
            </h2>
            <span className="text-sm text-gray-500">
              {products.length} sản phẩm
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20 w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {products.map((product, index) => (
                  <motion.div
                    layout
                    key={product._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate.push(`/shop/product/${product._id}`)}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    <div className="aspect-square bg-gray-50 relative overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {product.stock < 10 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                          Sắp hết
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2 mb-2 leading-snug group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="mt-auto">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                          <Star
                            size={14}
                            className="text-amber-400 fill-amber-400"
                          />
                          <span className="font-medium text-amber-500">
                            {product.rating}
                          </span>
                          <span className="mx-1 text-gray-300">|</span>
                          <span>Đã bán {product.sold}</span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="text-red-500 font-bold text-lg">
                            {product.price.toLocaleString("vi-VN")} đ
                          </div>
                          <button className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ShoppingCart size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!isLoading && products.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed mt-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-gray-500">
                Vui lòng thử lại với từ khóa hoặc danh mục khác.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
