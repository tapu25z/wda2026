import { IDiseaseListItem } from './disease.types';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type GrowthRate = 'Nhanh' | 'Trung bình' | 'Chậm';
export type LightRequirement = 'Ưa sáng' | 'Ưa bóng' | 'Bán phần';
export type WaterRequirement = 'Ít' | 'Trung bình' | 'Nhiều';

export interface IPlant {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  description: string;
  images: string[];
  uses: string;
  care: string;
  category: string[];
  growthRate: GrowthRate;
  light: LightRequirement;
  water: WaterRequirement;
  height?: string;
  floweringTime?: string;
  suitableLocation?: string;
  soil?: string;
  diseases: string[];
  status: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlantCreate extends Omit<IPlant, 'id' | 'createdAt' | 'updatedAt' | 'diseases'> {
  diseases?: string[];
}

export interface IPlantListItem {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  images: string[];
  status: ApprovalStatus;
  category: string[];
  growthRate: GrowthRate;
  light: LightRequirement;
  water: WaterRequirement;
}

export interface IPlantDetail extends IPlant {
  diseasesInfo: IDiseaseListItem[];
}