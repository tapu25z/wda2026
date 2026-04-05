import { axiosClient } from "./axios-client";
import { API_ENDPOINTS } from "../constants/api.constants";
import { IOrderListResponse, IOrder, OrderStatus } from "../types/order.types";

export const orderApi = {
  createOrder: async (data: any): Promise<IOrder> => {
    const response = await axiosClient.post(API_ENDPOINTS.ORDERS.BASE, data);
    return response.data;
  },

  getMyOrders: async (page = 1, limit = 10): Promise<IOrderListResponse> => {
    const response = await axiosClient.get(API_ENDPOINTS.ORDERS.MY_ORDERS, {
      params: { page, limit },
    });
    return response.data;
  },

  getShopOrders: async (page = 1, limit = 10): Promise<IOrderListResponse> => {
    const response = await axiosClient.get(API_ENDPOINTS.ORDERS.SHOP_ORDERS, {
      params: { page, limit },
    });
    return response.data;
  },

  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus,
    cancelReason?: string,
  ): Promise<any> => {
    const response = await axiosClient.patch(
      API_ENDPOINTS.ORDERS.STATUS(orderId),
      {
        status,
        cancelReason,
      },
    );
    return response.data;
  },
};
