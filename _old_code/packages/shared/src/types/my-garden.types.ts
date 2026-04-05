export interface IDailyTask {
  day: number;
  date: string;
  weatherContext: string;
  waterAction: string;
  fertilizerAction: string;
  careAction: string;
  isCompleted: boolean;
}

export interface IPlantInfo {
  commonName?: string;
  scientificName?: string;
  family?: string;
  description?: string;
  uses?: string;
  care?: string;
  category?: string[];
  plantGroup?: string;
  images?: string[];
}

export interface IMyGardenPlant {
  _id: string;
  userId: string;
  aiLabel: string;
  imageUrl?: string;
  plantInfo?: IPlantInfo | null;
  customName: string;
  userGoal: "HEAL_DISEASE" | "GET_FRUIT" | "GET_FLOWER" | "MAINTAIN";
  currentCondition: string;
  roadmapSummary?: string;
  growthStages: string[];
  currentStageIndex: number;
  progressPercentage: number;
  lastInteractionDate: string;
  careRoadmap: IDailyTask[];
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  createdAt?: string;
  updatedAt?: string;
}

export interface AddPlantPayload {
  plantName: string;
  diseaseName: string;
  imageUrl?: string;
  customName?: string;
  userGoal: "HEAL_DISEASE" | "GET_FRUIT" | "GET_FLOWER" | "MAINTAIN";
  lat: number;
  lon: number;
}

export interface DailyCheckInPayload {
  currentDay: number;
  imageUrl: string;
  lat: number;
  lon: number;
}
