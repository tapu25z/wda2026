import { axiosClient } from '@agri-scan/shared';
import { API_ENDPOINTS } from '@agri-scan/shared';
import type {
  IScanHistoryListItem,
  IScanHistoryDetail,
  IScanResult,
} from '@agri-scan/shared';

export const scanService = {

  async scanImage(imageFile: File): Promise<IScanResult> {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await axiosClient.post<IScanResult>(
      API_ENDPOINTS.SCAN.ANALYZE, // Vẫn giữ ANALYZE (nếu TS không báo lỗi dòng này)
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async getScanResult(scanId: string): Promise<IScanHistoryDetail> {
    const response = await axiosClient.get<IScanHistoryDetail>(
      `${API_ENDPOINTS.HISTORY.SCAN_BASE}/${scanId}`
    );
    return response.data;
  },

  async getMyHistory(): Promise<IScanHistoryListItem[]> {
    const response = await axiosClient.get<IScanHistoryListItem[]>(
      API_ENDPOINTS.HISTORY.SCAN_BASE
    );
    return response.data;
  },

  async getHistoryById(historyId: string): Promise<IScanHistoryDetail> {
    const response = await axiosClient.get<IScanHistoryDetail>(
      `${API_ENDPOINTS.HISTORY.SCAN_BASE}/${historyId}`
    );
    return response.data;
  },

  /**
   * Xóa lịch sử quét
   */
  async deleteHistory(historyId: string): Promise<void> {
    await axiosClient.delete(`${API_ENDPOINTS.HISTORY.SCAN_BASE}/${historyId}`);
  },

  /**
   * Gửi feedback cho kết quả chẩn đoán (đúng/sai)
   */
  async sendFeedback(scanId: string, isAccurate: boolean): Promise<void> {
    await axiosClient.patch(
      API_ENDPOINTS.SCAN.FEEDBACK(scanId),
      { isAccurate }
    );
  },


};