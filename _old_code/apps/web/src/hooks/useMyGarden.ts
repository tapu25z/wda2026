"use client";
import { useState, useCallback } from "react";
import { myGardenApi } from "@agri-scan/shared";
import type {
  IMyGardenPlant,
  AddPlantPayload,
  DailyCheckInPayload,
} from "@agri-scan/shared";

interface UseMyGardenReturn {
  garden: IMyGardenPlant[];
  isLoading: boolean;
  isAdding: boolean;
  error: string | null;
  fetchGarden: () => Promise<void>;
  addPlant: (payload: AddPlantPayload) => Promise<IMyGardenPlant | null>;
  removePlant: (gardenId: string) => Promise<boolean>;
  checkIn: (
    gardenId: string,
    payload: DailyCheckInPayload,
  ) => Promise<{
    requireRegeneration: boolean;
    message: string;
    progressPercentage?: number;
    status?: string;
  } | null>;
}

export function useMyGarden(): UseMyGardenReturn {
  const [garden, setGarden] = useState<IMyGardenPlant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGarden = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await myGardenApi.getUserGarden();
      setGarden(data || []);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không thể tải khu vườn.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPlant = useCallback(
    async (payload: AddPlantPayload): Promise<IMyGardenPlant | null> => {
      setIsAdding(true);
      setError(null);
      try {
        const res = await myGardenApi.addPlantToGarden(payload);
        setGarden((prev) => [res.data, ...prev]);
        return res.data;
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ?? "Không thể thêm cây vào vườn.";
        setError(msg);
        return null;
      } finally {
        setIsAdding(false);
      }
    },
    [],
  );

  const removePlant = useCallback(async (gardenId: string): Promise<boolean> => {
    setError(null);
    try {
      await myGardenApi.removePlant(gardenId);
      setGarden((prev) => prev.filter((p) => p._id !== gardenId));
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không thể xóa cây.";
      setError(msg);
      return false;
    }
  }, []);

  const checkIn = useCallback(
    async (gardenId: string, payload: DailyCheckInPayload) => {
      setError(null);
      try {
        const res = await myGardenApi.dailyCheckIn(gardenId, payload);

        if (!res.requireRegeneration && res.progressPercentage !== undefined) {
          setGarden((prev) =>
            prev.map((p) =>
              p._id === gardenId
                ? {
                    ...p,
                    progressPercentage: res.progressPercentage!,
                    status: (res.status as any) ?? p.status,
                  }
                : p,
            ),
          );
        }

        return res;
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? "Không thể check-in.";
        setError(msg);
        return null;
      }
    },
    [],
  );

  return {
    garden,
    isLoading,
    isAdding,
    error,
    fetchGarden,
    addPlant,
    removePlant,
    checkIn,
  };
}