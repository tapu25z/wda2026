
import { axiosClient } from '@agri-scan/shared';
import { API_ENDPOINTS } from '@agri-scan/shared';
import type {
  IPlant,
  IPlantCreate,
  IPlantListItem,
  IPlantDetail,
  IPaginatedResponse,
  ISearchParams
} from '@agri-scan/shared';

export const plantService = {
  /**
   * Lấy danh sách cây trồng (có phân trang)
   */
  async getPlants(params?: ISearchParams): Promise<IPaginatedResponse<IPlantListItem>> {
    const queryString = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : '';
    const response = await axiosClient.get<IPaginatedResponse<IPlantListItem>>(
      `${API_ENDPOINTS.PLANTS.BASE}${queryString}`
    );
    return response.data;
  },

  /**
   * Lấy chi tiết một cây trồng theo ID
   */
  async getPlantById(id: string): Promise<IPlantDetail> {
    const response = await axiosClient.get<IPlantDetail>(
      API_ENDPOINTS.PLANTS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Tìm kiếm cây trồng
   */
  async searchPlants(query: string, params?: ISearchParams): Promise<IPaginatedResponse<IPlantListItem>> {
    const searchParams: Record<string, string> = { query };
    if (params?.page) searchParams.page = String(params.page);
    if (params?.limit) searchParams.limit = String(params.limit);
    if (params?.sortBy) searchParams.sortBy = params.sortBy;
    if (params?.sortOrder) searchParams.sortOrder = params.sortOrder;
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await axiosClient.get<IPaginatedResponse<IPlantListItem>>(
      `${API_ENDPOINTS.PLANTS.SEARCH}?${queryString}`
    );
    return response.data;
  },

  /**
   * Lấy cây trồng theo bệnh
   */
  async getPlantsByDisease(diseaseId: string): Promise<IPlantListItem[]> {
    const response = await axiosClient.get<IPlantListItem[]>(
      API_ENDPOINTS.PLANTS.BY_DISEASE(diseaseId)
    );
    return response.data;
  },

  /**
   * Tạo cây trồng mới (Admin only)
   */
  async createPlant(data: IPlantCreate): Promise<IPlant> {
    const response = await axiosClient.post<IPlant>(
      API_ENDPOINTS.PLANTS.BASE,
      data
    );
    return response.data;
  },

  /**
   * Cập nhật cây trồng (Admin only)
   */
  async updatePlant(id: string, data: Partial<IPlantCreate>): Promise<IPlant> {
    const response = await axiosClient.put<IPlant>(
      API_ENDPOINTS.PLANTS.BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Xóa cây trồng (Admin only)
   */
  async deletePlant(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.PLANTS.BY_ID(id));
  },
};
