import { axiosClient } from './axios-client';
import { IPlantListItem, IPlantDetail, IPlantCreate } from '../types/plant.types';
import { API_ENDPOINTS } from '../constants';



export const plantApi = {
  /**
   * Lấy danh sách cây trồng cho trang Từ Điển (đã được APPROVED)
   */
  getAllPlants: async (): Promise<IPlantListItem[]> => {
    const response = await axiosClient.get(API_ENDPOINTS.PLANTS.BASE);
    return response.data.map((p: any) => ({
      ...p,
      id: p.id ?? p._id,
    }));
  },

  /**
   * Lấy chi tiết một loại cây (bao gồm cả danh sách bệnh)
   */
  getPlantById: async (id: string): Promise<IPlantDetail> => {
    const response = await axiosClient.get(API_ENDPOINTS.PLANTS.BY_ID(id));
    const p = response.data;
    return { ...p, id: p.id ?? p._id };
  },

  /**
   * Đóng góp kiến thức (Tự động vào trạng thái PENDING)
   */
  contributePlant: async (data: IPlantCreate): Promise<any> => {
    const response = await axiosClient.post('/plants/contribute', data);
    return response.data;
  },


  
};