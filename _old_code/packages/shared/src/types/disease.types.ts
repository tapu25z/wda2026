/**
 * Disease Types - Dùng chung cho Web và Mobile
 * Khớp với Collection: diseases trong MongoDB
 */

export enum DiseaseType {
  FUNGUS = 'FUNGUS',     // Nấm
  BACTERIA = 'BACTERIA', // Vi khuẩn
  VIRUS = 'VIRUS',       // Virus
  PEST = 'PEST',         // Sâu hại
  NUTRIENT = 'NUTRIENT', // Thiếu chất dinh dưỡng
}

export interface ITreatment {
  biological: string[];  // Biện pháp sinh học/hữu cơ
  chemical: string[];    // Thuốc hóa học gợi ý
  preventive: string[];  // Cách phòng ngừa
}

export interface IDisease {
  id: string;
  name: string;          // Tên bệnh (VD: "Bệnh đốm vòng / Early Blight")
  pathogen: string;      // Tác nhân gây bệnh (VD: "Nấm Alternaria solani")
  type: DiseaseType;
  symptoms: string[];    // Danh sách triệu chứng
  treatments: ITreatment;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDiseaseCreate {
  name: string;
  pathogen: string;
  type: DiseaseType;
  symptoms: string[];
  treatments: ITreatment;
}

export interface IDiseaseListItem {
  id: string;
  name: string;
  type: DiseaseType;
  pathogen: string;
}
