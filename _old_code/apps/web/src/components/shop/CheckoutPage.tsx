"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { orderApi, productApi, PaymentMethod } from "@agri-scan/shared";

export function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  const [receiverName, setReceiverName] = useState("Trần Văn Nông");

  const [phoneNumber, setPhoneNumber] = useState("0934104327");

  const [shippingAddress, setShippingAddress] = useState(
    "475A Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh",
  );
  const [checkoutError, setCheckoutError] = useState("");

  const shippingFee = 30000;
  const totalPayment = cartTotal + shippingFee;

  // FE-only fallback cho demo khi API product trả sellerId = null
  const FALLBACK_SELLER_ID = "69b8f096a79ecb777a9ed3d7";

  const normalizeId = (value: any): string => {
    if (!value) return "";

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || trimmed === "null" || trimmed === "undefined") return "";
      return trimmed;
    }

    if (typeof value === "object") {
      if (value._id) return normalizeId(value._id);
      if (value.id) return normalizeId(value.id);
    }

    return "";
  };

  const extractSellerIdFromResponse = (source: any): string => {
    if (!source) return "";

    if (source.data) {
      const fromData = extractSellerIdFromResponse(source.data);
      if (fromData) return fromData;
    }

    if (source.product) {
      const fromProduct = extractSellerIdFromResponse(source.product);
      if (fromProduct) return fromProduct;
    }

    if (source.sellerId) {
      const fromSeller = normalizeId(source.sellerId);
      if (fromSeller) return fromSeller;
    }

    return "";
  };

  const resolveSellerId = async (): Promise<string> => {
    const firstItem = cartItems[0];
    if (!firstItem) return "";

    // 1) Ưu tiên lấy từ cart
    const fromCart = normalizeId((firstItem as any).sellerId);
    if (fromCart) return fromCart;

    // 2) Fallback: fetch lại product
    try {
      const freshProduct = await productApi.getProductById(String(firstItem._id));
      console.log("FRESH PRODUCT RESPONSE", freshProduct);

      const fromApi = extractSellerIdFromResponse(freshProduct);
      if (fromApi) return fromApi;
    } catch (error) {
      console.error("Không lấy lại được sellerId từ product:", error);
    }

    // 3) FE-only fallback cuối cùng
    return FALLBACK_SELLER_ID;
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;


    setCheckoutError("");
    setIsSubmitting(true);


    try {
      if (!receiverName.trim()) {
        setCheckoutError("Vui lòng nhập tên người nhận.");

        return;
      }

      if (!phoneNumber.trim()) {
        setCheckoutError("Vui lòng nhập số điện thoại nhận hàng.");
        return;
      }


      if (!shippingAddress.trim()) {
        setCheckoutError("Vui lòng nhập địa chỉ nhận hàng.");
        return;
      }


      const sellerId = await resolveSellerId();

      console.log("FIRST CART ITEM", cartItems[0]);
      console.log("RESOLVED SELLER ID", sellerId);

      if (!sellerId) {
        setCheckoutError(
          "Không xác định được người bán của sản phẩm. Vui lòng quay lại giỏ hàng và thêm lại sản phẩm.",
        );
        return;
      }

      const payload = {
        sellerId,
        items: cartItems.map((item) => ({
          productId: String(item._id),

          quantity: item.quantity,
        })),
        shippingAddress,
        phoneNumber: phoneNumber.replace(/\D/g, ""),
        paymentMethod,
      };

      console.log("ORDER PAYLOAD", payload);

      await orderApi.createOrder(payload);

      setIsSuccess(true);
      setTimeout(() => {
        clearCart();
        router.push("/shop");
      }, 2500);
    } catch (error) {
      console.error("Failed to place order:", error);
      setCheckoutError("Không thể đặt hàng lúc này. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30"
          >
            <CheckCircle2 size={48} className="text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Đặt hàng thành công!
          </h2>

          <p className="text-gray-500 mb-8">
            Cảm ơn bạn đã mua sắm tại Agri-Shop. Đơn hàng của bạn đang được xử lý
            và sẽ sớm được giao.
          </p>

          <button
            onClick={() => router.push("/shop")}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Giỏ hàng trống
          </h2>
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
          <span className="text-gray-900 font-medium">Thanh toán</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight"
        >
          Thanh toán
        </motion.h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            className="flex-1 space-y-6"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                  <MapPin size={20} className="text-primary" />
                  Địa chỉ nhận hàng
                </div>
                <span className="text-sm font-medium text-gray-400">
                  Nhập trực tiếp
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên người nhận
                    </label>
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="Nhập tên người nhận"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>

                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ nhận hàng
                  </label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Nhập số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  />
                </div>


                {checkoutError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {checkoutError}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 text-gray-900 font-bold text-lg mb-4">
                <Truck size={20} className="text-blue-500" />
                Đơn vị vận chuyển
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="relative flex cursor-pointer rounded-xl border bg-white p-4 shadow-sm focus:outline-none border-primary bg-primary/5">
                  <input type="radio" name="shipping" className="sr-only" checked readOnly />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        Giao hàng nhanh
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        Dự kiến giao: 2-3 ngày
                      </span>
                    </span>
                  </span>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </label>

                <label className="relative flex cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm focus:outline-none hover:border-gray-300">
                  <input type="radio" name="shipping" className="sr-only" readOnly />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        Giao hàng tiết kiệm
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        Dự kiến giao: 4-5 ngày
                      </span>
                    </span>
                  </span>
                </label>
              </div>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 text-gray-900 font-bold text-lg mb-4">
                <CreditCard size={20} className="text-purple-500" />
                Phương thức thanh toán
              </div>

              <div className="space-y-3">
                {[
                  {
                    value: "COD" as PaymentMethod,
                    label: "Thanh toán khi nhận hàng (COD)",
                  },
                  {
                    value: "BANK_TRANSFER" as PaymentMethod,
                    label: "Chuyển khoản ngân hàng",
                  },
                  { value: "MOMO" as PaymentMethod, label: "Ví MoMo" },
                  { value: "VNPAY" as PaymentMethod, label: "VNPay" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    onClick={() => setPaymentMethod(opt.value)}
                    className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        paymentMethod === opt.value
                          ? "border-primary"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === opt.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1 font-medium text-gray-900">
                      {opt.label}
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full lg:w-[400px] flex-shrink-0"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-lg mb-6">
                <ShoppingBag size={20} className="text-amber-500" />
                Đơn hàng của bạn
              </div>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                      <img
                        src={item.images?.[0] || "/placeholder-product.png"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                        {item.name}
                      </p>

                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">
                          SL: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t border-b border-gray-100 py-4 mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{cartTotal.toLocaleString("vi-VN")}đ</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span>{shippingFee.toLocaleString("vi-VN")}đ</span>
                </div>

                <div className="flex justify-between text-emerald-600">
                  <span>Giảm giá:</span>
                  <span>-0đ</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-lg font-bold text-gray-900">Tổng thanh toán:</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-extrabold text-red-500 tracking-tight">
                    {totalPayment.toLocaleString("vi-VN")}đ
                  </p>
                  <p className="text-sm text-gray-400 mt-1">(Đã bao gồm VAT)</p>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}

                className={`w-full py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg ${
                  isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600 hover:shadow-red-500/30"

                }`}
              >
                {isSubmitting ? "Đang xử lý..." : "Đặt hàng ngay"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}