const ordersSeed = [
  {
    _id: "670000000000000000000001",
    buyerId: "69b405710d2eb65e97c3e690",
    sellerId: "69b3f7a80f9ec518c702b0b6",
    items: [
      { productId: "660000000000000000000001", quantity: 2, priceAtPurchase: 150000 },
      { productId: "660000000000000000000005", quantity: 1, priceAtPurchase: 80000 }
    ],
    totalAmount: 380000,
    shippingAddress: "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
    phoneNumber: "0901234567",
    orderStatus: "DELIVERED",
    paymentMethod: "COD",
    paymentStatus: "PAID",
    createdAt: new Date("2026-03-10T14:30:00.000Z"),
    updatedAt: new Date("2026-03-12T09:15:00.000Z")
  },
  {
    _id: "670000000000000000000002",
    buyerId: "69b3f7a80f9ec518c702b0b6",
    sellerId: "69b405710d2eb65e97c3e690",
    items: [
      { productId: "660000000000000000000003", quantity: 3, priceAtPurchase: 120000 }
    ],
    totalAmount: 360000,
    shippingAddress: "Thôn 2, Xã Bình Lộc, Huyện Diên Khánh, Đồng Nai",
    phoneNumber: "0987654321",
    orderStatus: "SHIPPING",
    paymentMethod: "VNPAY",
    paymentStatus: "PAID",
    createdAt: new Date("2026-03-15T08:20:00.000Z"),
    updatedAt: new Date("2026-03-16T10:10:00.000Z")
  },
  {
    _id: "670000000000000000000003",
    buyerId: "69b388e17aeb5caad91e5302",
    sellerId: "69b3f7a80f9ec518c702b0b6",
    items: [
      { productId: "660000000000000000000007", quantity: 10, priceAtPurchase: 25000 }
    ],
    totalAmount: 250000,
    shippingAddress: "Toà nhà Bitexco, Quận 1, TP.HCM",
    phoneNumber: "0912345678",
    orderStatus: "PENDING",
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    createdAt: new Date("2026-03-17T11:00:00.000Z"),
    updatedAt: new Date("2026-03-17T11:00:00.000Z")
  },
  {
    _id: "670000000000000000000004",
    buyerId: "69b3f7a80f9ec518c702b0b6",
    sellerId: "69b405710d2eb65e97c3e690",
    items: [
      { productId: "66000000000000000000000a", quantity: 1, priceAtPurchase: 650000 },
      { productId: "66000000000000000000000c", quantity: 2, priceAtPurchase: 35000 }
    ],
    totalAmount: 720000,
    shippingAddress: "Trang trại dưa lưới Đồng Xanh",
    phoneNumber: "0987654321",
    orderStatus: "CANCELLED",
    cancelReason: "Người mua đổi ý",
    paymentMethod: "MOMO",
    paymentStatus: "REFUNDED",
    createdAt: new Date("2026-03-05T09:00:00.000Z"),
    updatedAt: new Date("2026-03-05T15:00:00.000Z")
  },
  {
    _id: "670000000000000000000005",
    buyerId: "69b405710d2eb65e97c3e690",
    sellerId: "69b3f7a80f9ec518c702b0b6",
    items: [
      { productId: "66000000000000000000000b", quantity: 5, priceAtPurchase: 25000 }
    ],
    totalAmount: 125000,
    shippingAddress: "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
    phoneNumber: "0901234567",
    orderStatus: "CONFIRMED",
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    createdAt: new Date("2026-03-16T18:45:00.000Z"),
    updatedAt: new Date("2026-03-16T19:00:00.000Z")
  },
  {
    _id: "670000000000000000000006",
    buyerId: "69b388e17aeb5caad91e5302",
    sellerId: "69b405710d2eb65e97c3e690",
    items: [
      { productId: "660000000000000000000006", quantity: 2, priceAtPurchase: 45000 },
      { productId: "660000000000000000000008", quantity: 10, priceAtPurchase: 12000 }
    ],
    totalAmount: 210000,
    shippingAddress: "Phòng Admin",
    phoneNumber: "0911111111",
    orderStatus: "DELIVERED",
    paymentMethod: "BANK_TRANSFER",
    paymentStatus: "PAID",
    createdAt: new Date("2026-03-01T10:00:00.000Z"),
    updatedAt: new Date("2026-03-03T10:00:00.000Z")
  },
  {
    _id: "670000000000000000000007",
    buyerId: "69b405710d2eb65e97c3e690",
    sellerId: "69b3f7a80f9ec518c702b0b6",
    items: [
      { productId: "66000000000000000000000f", quantity: 1, priceAtPurchase: 55000 }
    ],
    totalAmount: 55000,
    shippingAddress: "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
    phoneNumber: "0901234567",
    orderStatus: "PENDING",
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    createdAt: new Date("2026-03-17T07:15:00.000Z"),
    updatedAt: new Date("2026-03-17T07:15:00.000Z")
  },
  {
    _id: "670000000000000000000008",
    buyerId: "69b3f7a80f9ec518c702b0b6",
    sellerId: "69b405710d2eb65e97c3e690",
    items: [
      { productId: "660000000000000000000004", quantity: 1, priceAtPurchase: 180000 }
    ],
    totalAmount: 180000,
    shippingAddress: "Thôn 2, Xã Bình Lộc, Huyện Diên Khánh",
    phoneNumber: "0987654321",
    orderStatus: "DELIVERED",
    paymentMethod: "VNPAY",
    paymentStatus: "PAID",
    createdAt: new Date("2026-03-08T09:20:00.000Z"),
    updatedAt: new Date("2026-03-10T14:10:00.000Z")
  },
  {
    _id: "670000000000000000000009",
    buyerId: "69b388e17aeb5caad91e5302",
    sellerId: "69b3f7a80f9ec518c702b0b6",
    items: [
      { productId: "660000000000000000000009", quantity: 20, priceAtPurchase: 55000 }
    ],
    totalAmount: 1100000,
    shippingAddress: "Toà nhà Bitexco, Quận 1",
    phoneNumber: "0912345678",
    orderStatus: "SHIPPING",
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    createdAt: new Date("2026-03-16T15:30:00.000Z"),
    updatedAt: new Date("2026-03-17T08:00:00.000Z")
  },
  {
    _id: "67000000000000000000000a",
    buyerId: "69b405710d2eb65e97c3e690",
    sellerId: "69b3f7a80f9ec518c702b0b6",
    items: [
      { productId: "66000000000000000000000d", quantity: 5, priceAtPurchase: 15000 },
      { productId: "660000000000000000000002", quantity: 2, priceAtPurchase: 35000 }
    ],
    totalAmount: 145000,
    shippingAddress: "123 Đường Nguyễn Văn Cừ, Quận 5",
    phoneNumber: "0901234567",
    orderStatus: "DELIVERED",
    paymentMethod: "MOMO",
    paymentStatus: "PAID",
    createdAt: new Date("2026-03-12T10:00:00.000Z"),
    updatedAt: new Date("2026-03-14T11:00:00.000Z")
  },
  {
    _id: "67000000000000000000000b",
    buyerId: "69b3f7a80f9ec518c702b0b6",
    sellerId: "69b405710d2eb65e97c3e690",
    items: [
      { productId: "66000000000000000000000e", quantity: 2, priceAtPurchase: 95000 }
    ],
    totalAmount: 190000,
    shippingAddress: "Thôn 2, Xã Bình Lộc",
    phoneNumber: "0987654321",
    orderStatus: "PENDING",
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    createdAt: new Date("2026-03-17T14:00:00.000Z"),
    updatedAt: new Date("2026-03-17T14:00:00.000Z")
  },
  {
    _id: "67000000000000000000000c",
    buyerId: "69b405710d2eb65e97c3e690",
    sellerId: "69b3f7a80f9ec518c702b0b6",
    items: [
      { productId: "660000000000000000000001", quantity: 10, priceAtPurchase: 150000 }
    ],
    totalAmount: 1500000,
    shippingAddress: "123 Đường Nguyễn Văn Cừ",
    phoneNumber: "0901234567",
    orderStatus: "CONFIRMED",
    paymentMethod: "BANK_TRANSFER",
    paymentStatus: "PAID",
    createdAt: new Date("2026-03-16T09:00:00.000Z"),
    updatedAt: new Date("2026-03-16T10:00:00.000Z")
  },
  {
    _id: "67000000000000000000000d",
    buyerId: "69b3f7a80f9ec518c702b0b6",
    sellerId: "69b405710d2eb65e97c3e690",
    items: [
      { productId: "660000000000000000000008", quantity: 50, priceAtPurchase: 12000 }
    ],
    totalAmount: 600000,
    shippingAddress: "Trang trại dưa lưới Đồng Xanh",
    phoneNumber: "0987654321",
    orderStatus: "DELIVERED",
    paymentMethod: "COD",
    paymentStatus: "PAID",
    createdAt: new Date("2026-03-02T11:00:00.000Z"),
    updatedAt: new Date("2026-03-05T09:00:00.000Z")
  },
  {
    _id: "67000000000000000000000e",
    buyerId: "69b388e17aeb5caad91e5302",
    sellerId: "69b3f7a80f9ec518c702b0b6",
    items: [
      { productId: "66000000000000000000000b", quantity: 1, priceAtPurchase: 25000 }
    ],
    totalAmount: 25000,
    shippingAddress: "Toà nhà Bitexco",
    phoneNumber: "0912345678",
    orderStatus: "CANCELLED",
    cancelReason: "Người bán hết hàng",
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    createdAt: new Date("2026-03-10T16:00:00.000Z"),
    updatedAt: new Date("2026-03-11T08:00:00.000Z")
  },
  {
    _id: "67000000000000000000000f",
    buyerId: "69b405710d2eb65e97c3e690",
    sellerId: "69b3f7a80f9ec518c702b0b6",
    items: [
      { productId: "660000000000000000000005", quantity: 3, priceAtPurchase: 80000 },
      { productId: "66000000000000000000000d", quantity: 10, priceAtPurchase: 15000 }
    ],
    totalAmount: 390000,
    shippingAddress: "123 Đường Nguyễn Văn Cừ",
    phoneNumber: "0901234567",
    orderStatus: "SHIPPING",
    paymentMethod: "VNPAY",
    paymentStatus: "PAID",
    createdAt: new Date("2026-03-16T12:00:00.000Z"),
    updatedAt: new Date("2026-03-17T09:00:00.000Z")
  }
];

export default ordersSeed;