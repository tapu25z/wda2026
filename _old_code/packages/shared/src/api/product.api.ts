import { axiosClient } from "./axios-client";
import { API_ENDPOINTS } from "../constants/api.constants";
import { IProductListResponse, IProduct } from "../types/product.types";

export const productApi = {
  getProducts: async (params?: any): Promise<IProductListResponse> => {
    const response = await axiosClient.get(API_ENDPOINTS.PRODUCTS.BASE, {
      params,
    });
    return response.data;
  },

  getProductById: async (id: string): Promise<IProduct> => {
    const response = await axiosClient.get(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    return response.data;
  },

  createProduct: async (data: any): Promise<IProduct> => {
    const response = await axiosClient.post(API_ENDPOINTS.PRODUCTS.BASE, data);
    return response.data;
  },

  updateProduct: async (id: string, data: any): Promise<IProduct> => {
    const response = await axiosClient.patch(
      API_ENDPOINTS.PRODUCTS.BY_ID(id),
      data,
    );
    return response.data;
  },

  deleteProduct: async (id: string): Promise<any> => {
    const response = await axiosClient.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    return response.data;
  },
};
