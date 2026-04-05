"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

export function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-gray-500">
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
          <span className="font-medium text-gray-900">Giỏ hàng</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Giỏ hàng của bạn
        </h1>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-gray-400"
          >
            <ShoppingBag size={80} className="mb-6 text-gray-200" />
            <p className="text-xl font-medium text-gray-600 mb-2">
              Giỏ hàng đang trống
            </p>
            <p className="text-gray-500 mb-8">
              Chưa có sản phẩm nào trong giỏ hàng của bạn.
            </p>
            <button
              onClick={() => router.push("/shop")}
              className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Tiếp tục mua sắm
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="flex-1 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-sm font-bold text-gray-600">
                  <div className="col-span-6">Sản phẩm</div>
                  <div className="col-span-2 text-center">Đơn giá</div>
                  <div className="col-span-2 text-center">Số lượng</div>
                  <div className="col-span-2 text-right">Thành tiền</div>
                </div>

                <div className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <motion.div
                        key={item._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                        className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center relative group"
                      >
                        {/* Mobile Delete Button */}
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="sm:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-full"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="col-span-6 flex items-center gap-4 w-full">
                          <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 pr-8 sm:pr-0">
                            <h3
                              className="font-medium text-gray-900 line-clamp-2 hover:text-primary cursor-pointer transition-colors"
                              onClick={() =>
                                router.push(`/shop/product/${item._id}`)
                              }
                            >
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.category}
                            </p>
                            {/* Mobile Price */}
                            <div className="sm:hidden text-red-500 font-bold mt-2">
                              {item.price.toLocaleString("vi-VN")} đ
                            </div>
                          </div>
                        </div>

                        {/* Desktop Price */}
                        {/* THÊM whitespace-nowrap ĐỂ KHÔNG BỊ RỚT DÒNG CHỮ "đ" */}
                        <div className="hidden sm:block col-span-2 text-center font-medium text-gray-900 whitespace-nowrap">
                          {item.price.toLocaleString("vi-VN")} đ
                        </div>

                        <div className="col-span-2 flex justify-center w-full sm:w-auto mt-4 sm:mt-0">
                          <div className="flex items-center bg-gray-50 rounded-md border border-gray-200">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                updateQuantity(item._id, item.quantity - 1)
                              }
                              className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-l-md transition-colors disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} strokeWidth={2.5} />
                            </motion.button>

                            <span className="w-8 text-center text-sm font-semibold text-gray-900">
                              {item.quantity}
                            </span>

                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                updateQuantity(item._id, item.quantity + 1)
                              }
                              className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-r-md transition-colors"
                            >
                              <Plus size={14} strokeWidth={2.5} />
                            </motion.button>
                          </div>
                        </div>

                        {/* Desktop Total & Delete */}
                        <div className="hidden sm:flex col-span-2 items-center justify-end gap-3 sm:gap-4">
                          {/* THÊM whitespace-nowrap Ở ĐÂY ĐỂ GIỮ CHỮ "đ" CÙNG DÒNG */}
                          <div className="font-bold text-red-500 whitespace-nowrap">
                            {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item._id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  Tóm tắt đơn hàng
                </h2>

                <div className="space-y-4 text-sm mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                    <span className="font-medium text-gray-900">
                      {cartTotal.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí giao hàng</span>
                    <span className="text-gray-400">Tính ở bước sau</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                    <span className="font-bold text-gray-900">Tổng cộng</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-red-500 block leading-none mb-1">
                        {cartTotal.toLocaleString("vi-VN")} đ
                      </span>
                      <span className="text-xs text-gray-500">
                        (Đã bao gồm VAT nếu có)
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/shop/checkout")}
                  className="w-full py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  Tiến hành thanh toán
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}