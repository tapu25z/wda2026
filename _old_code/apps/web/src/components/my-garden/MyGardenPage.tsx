"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { IMyGardenPlant, IScanStatusResponse } from "@agri-scan/shared";
import { useScan } from "../../hooks/useScan";
import { useMyGarden } from "../../hooks/useMyGarden";
import { UploadView } from "./upload/UploadView";
import { AnalyzingView } from "./upload/AnalyzingView";
import { ResultView } from "./result/ResultView";
import { GardenOverview } from "./overview/GardenOverview";
import { TrackingView } from "./tracking/TrackingView";

type Step = "OVERVIEW" | "UPLOAD" | "ANALYZING" | "RESULT" | "TRACKING";
type ActiveTab = "TRACKING" | "FRUIT" | "FLOWER" | "ORNAMENTAL";

function normalizeText(value?: string | null) {
  return value?.trim()?.replace(/\s+/g, " ") || "";
}

function extractDiseaseName(result: IScanStatusResponse | null): string {
  return normalizeText(result?.topDisease?.name) || "Khỏe mạnh";
}

function extractPlantName(result: IScanStatusResponse | null): string {
  const disease = result?.topDisease as
    | { commonName?: string; name?: string }
    | undefined
    | null;

  const commonName = normalizeText(disease?.commonName);
  if (commonName) {
    const cleaned = commonName.replace(/\(.*?\)/g, "").trim();
    if (cleaned) return cleaned;
  }

  const diseaseName = normalizeText(disease?.name);
  if (diseaseName) {
    const parts = diseaseName.split(" ");
    if (parts.length > 1) return parts[0];
  }

  return "Cây trồng";
}

function getDefaultGoalFromDisease(diseaseName: string) {
  const normalized = diseaseName.toLowerCase();

  if (
    normalized === "khỏe mạnh" ||
    normalized === "khoe manh" ||
    normalized === "healthy" ||
    normalized === "normal"
  ) {
    return "MAINTAIN" as const;
  }

  return "HEAL_DISEASE" as const;
}

function useToast() {
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    if (typeof window !== "undefined") {
      console[type === "error" ? "error" : "log"](`[toast:${type}] ${message}`);
    }
  };

  return { showToast };
}

const ANALYZING_MESSAGES = [
  "AI đang nhận diện cây trồng...",
  "Đang đối chiếu đặc điểm bệnh lý...",
  "Đang xây dựng kết quả chẩn đoán...",
  "Đang chuẩn bị gợi ý chăm sóc...",
];

export function MyGardenPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<Step>("OVERVIEW");
  const [activeTab, setActiveTab] = useState<ActiveTab>("TRACKING");
  const [selectedPlant, setSelectedPlant] = useState<IMyGardenPlant | null>(
    null,
  );
  const [scanResult, setScanResult] = useState<IScanStatusResponse | null>(
    null,
  );
  const [isViewingTracked, setIsViewingTracked] = useState(false);
  const [isUpdatingTracked, setIsUpdatingTracked] = useState(false);
  const [analyzingText, setAnalyzingText] = useState(ANALYZING_MESSAGES[0]);

  const { showToast } = useToast();

  const { scan, error: scanError } = useScan();
  const {
    garden,
    isLoading,
    isAdding,
    error: gardenError,
    fetchGarden,
    addPlant,
    removePlant,
    checkIn,
  } = useMyGarden();

  useEffect(() => {
    fetchGarden();
  }, [fetchGarden]);

  useEffect(() => {
    if (scanError) showToast(scanError, "error");
  }, [scanError]);

  useEffect(() => {
    if (gardenError) showToast(gardenError, "error");
  }, [gardenError]);

  useEffect(() => {
    if (step !== "ANALYZING") return;

    let index = 0;
    setAnalyzingText(ANALYZING_MESSAGES[0]);

    const interval = window.setInterval(() => {
      index = (index + 1) % ANALYZING_MESSAGES.length;
      setAnalyzingText(ANALYZING_MESSAGES[index]);
    }, 1400);

    return () => window.clearInterval(interval);
  }, [step]);

  const trackedPlants = useMemo(() => garden || [], [garden]);

  const handleReset = () => {
    setSelectedPlant(null);
    setScanResult(null);
    setIsViewingTracked(false);
    setIsUpdatingTracked(false);
    setStep("OVERVIEW");
  };

  const handleViewTrackedPlant = (plant: IMyGardenPlant) => {
    setSelectedPlant(plant);
    setScanResult(null);
    setIsViewingTracked(true);
    setIsUpdatingTracked(false);
    setStep("RESULT");
  };

  const handleTrackPlant = (plant: IMyGardenPlant) => {
    setSelectedPlant(plant);
    setScanResult(null);
    setIsViewingTracked(true);
    setIsUpdatingTracked(false);
    setStep("TRACKING");
  };

  const handleRemovePlant = async (id: string) => {
    const ok = await removePlant(id);

    if (!ok) {
      showToast("Xóa cây thất bại. Vui lòng thử lại.", "error");
      return;
    }

    showToast("Đã xóa cây khỏi khu vườn.");
    setSelectedPlant(null);
    setScanResult(null);
    setIsViewingTracked(false);
    setIsUpdatingTracked(false);
    setStep("OVERVIEW");
  };

  const handleAddToGarden = async () => {
    if (!selectedPlant) return;

    const defaultGoal = getDefaultGoalFromDisease(
      normalizeText(selectedPlant.currentCondition),
    );

    const diseaseName =
      normalizeText(selectedPlant.currentCondition) || "Khỏe mạnh";

    const plantName =
      normalizeText(selectedPlant.aiLabel) ||
      normalizeText(selectedPlant.customName) ||
      "Cây trồng";

    const lat = 10.7769;
    const lon = 106.7009;

    const result = await addPlant({
      plantName,
      diseaseName,
      imageUrl: selectedPlant.imageUrl,
      customName: selectedPlant.customName,
      userGoal: defaultGoal,
      lat,
      lon,
    });

    if (!result) {
      showToast("Không thể thêm cây vào khu vườn.", "error");
      return;
    }

    setSelectedPlant(result);
    setIsViewingTracked(true);
    setStep("TRACKING");
    showToast("Đã thêm cây vào khu vườn.");
  };

  const handleUpdateTrackedPlant = () => {
    if (!selectedPlant) return;
    setIsUpdatingTracked(true);
    setStep("UPLOAD");
  };

  const handleRealUpload = async (file: File) => {
    setStep("ANALYZING");

    try {
      const result = await scan(file);

      if (!result || result.status !== "COMPLETED") {
        showToast("Không thể phân tích ảnh. Vui lòng thử lại.", "error");
        setStep("UPLOAD");
        return;
      }

      setScanResult(result);

      if (isUpdatingTracked && selectedPlant?._id) {
        const lat = 10.7769;
        const lon = 106.7009;
        const imageUrl =
          result.imageUrl || selectedPlant.imageUrl || "/placeholder-plant.png";

        const currentDay =
          (selectedPlant.careRoadmap?.find((task) => !task.isCompleted)?.day ??
            selectedPlant.currentStageIndex + 1) ||
          1;

        const checkInResult = await checkIn(selectedPlant._id, {
          currentDay,
          imageUrl,
          lat,
          lon,
        });

        if (!checkInResult) {
          showToast("Không thể cập nhật tình trạng cây.", "error");
          setIsUpdatingTracked(false);
          setStep("TRACKING");
          return;
        }

        setSelectedPlant((prev) =>
          prev
            ? {
                ...prev,
                imageUrl,
                currentCondition: extractDiseaseName(result),
                progressPercentage:
                  checkInResult.progressPercentage ?? prev.progressPercentage,
                status:
                  (checkInResult.status as IMyGardenPlant["status"]) ??
                  prev.status,
                lastInteractionDate: new Date().toISOString(),
              }
            : prev,
        );

        setIsUpdatingTracked(false);
        setStep("TRACKING");
        showToast(checkInResult.message || "Đã cập nhật trạng thái cây.");
        return;
      }

      const diseaseName = extractDiseaseName(result);
      const plantName = extractPlantName(result);

      const scannedPlant: IMyGardenPlant = {
        _id: result.scanHistoryId || crypto.randomUUID(),
        userId: "",
        aiLabel: plantName,
        imageUrl: result.imageUrl,
        plantInfo: null,
        customName: plantName,
        userGoal: getDefaultGoalFromDisease(diseaseName),
        currentCondition: diseaseName,
        roadmapSummary: "",
        growthStages: [],
        currentStageIndex: 0,
        progressPercentage: 0,
        lastInteractionDate: new Date().toISOString(),
        careRoadmap: [],
        status: "IN_PROGRESS",
      };

      setSelectedPlant(scannedPlant);
      setIsViewingTracked(false);
      setIsUpdatingTracked(false);
      setStep("RESULT");
    } catch {
      showToast("Lỗi kết nối. Vui lòng thử lại.", "error");
      setIsUpdatingTracked(false);
      setStep("UPLOAD");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] pt-16">
      {step === "OVERVIEW" && (
        <GardenOverview
          trackedPlants={trackedPlants}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setStep={setStep}
          setSelectedPlant={setSelectedPlant}
          setIsViewingTracked={setIsViewingTracked}
          handleRemovePlant={handleRemovePlant}
          handleTrackPlant={handleTrackPlant}
          handleViewTrackedPlant={handleViewTrackedPlant}
          navigate={router.push}
          isLoading={isLoading}
        />
      )}

      {step === "UPLOAD" && (
        <UploadView
          onBack={isUpdatingTracked ? () => setStep("TRACKING") : handleReset}
          handleRealUpload={handleRealUpload}
          fileInputRef={fileInputRef}
        />
      )}

      {step === "ANALYZING" && (
        <AnalyzingView
          analyzingText={
            isAdding
              ? "AI đang tạo lộ trình chăm sóc..."
              : isUpdatingTracked
                ? "AI đang cập nhật tình trạng cây..."
                : analyzingText
          }
        />
      )}

      {step === "RESULT" && (
        <ResultView
          selectedPlant={selectedPlant}
          isViewingTracked={isViewingTracked}
          handleReset={handleReset}
          handleRemovePlant={handleRemovePlant}
          handleAddToGarden={handleAddToGarden}
        />
      )}

      {step === "TRACKING" && (
        <TrackingView
          plant={selectedPlant}
          onBack={handleReset}
          onUpdatePhoto={handleUpdateTrackedPlant}
        />
      )}
    </div>
  );
}
