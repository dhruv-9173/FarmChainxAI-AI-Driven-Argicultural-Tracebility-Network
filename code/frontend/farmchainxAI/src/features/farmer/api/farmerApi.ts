/**
 * farmerApi.ts
 *
 * All HTTP calls for the Farmer role.
 * Connect each function to the real backend endpoint when ready.
 * The function signatures and return types are intentionally stable —
 * callers (dashboards, hooks) never need to change.
 */

import apiClient from "../../../api/apiClient";
import type {
  Batch,
  KPICard,
  ActivityItem,
  QualityTrendPoint,
  ShelfLifeItem,
} from "../../../types/dashboard.types";

interface ApiResponseWrapper<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface TransferReceiptDto {
  transferId: string;
  batchId: string;
  status: string;
  senderName: string;
  senderRole: string;
  recipientName: string;
  recipientRole: string;
  recipientEmail?: string;
  recipientPhone?: string;
  cropType: string;
  quantity: number;
  quantityUnit?: string;
  transferNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBatchPayload {
  cropType: string;
  cropVariety: string;
  quantity: number;
  quantityUnit: "kg" | "ton" | "quintal";
  qualityGrade: string;
  initialQualityScore: number;
  farmId: string;
  farmCity: string;
  farmState: string;
  fieldArea: number;
  soilType: string;
  irrigationType: string;
  storageType: string;
  storageLocation: string;
  expectedShelfLife: number;
  moistureLevel: number;
  certifications: string[];
  sowingDate: string;
  harvestDate: string;
  notes?: string;
  cropImageBase64?: string;
}

export interface FarmerBatchDto {
  id: string;
  farmerId: number;
  cropType: string;
  variety: string;
  quantity: number;
  quantityUnit: "kg" | "ton" | "quintal";
  qualityScore: number;
  qualityGrade: string;
  status: string;
  farmCity: string;
  farmState: string;
  storageType: string;
  storageLocation: string;
  soilType: string;
  irrigationType: string;
  expectedShelfLifeDays: number;
  currentShelfLifeDays: number;
  moistureLevel: number;
  organic: boolean;
  gapCertified: boolean;
  certifications: string;
  sowingDate: string;
  harvestDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  cropImageUrl?: string;
  basePrice?: number;
  marketPrice?: number;
  qrCodeUrl?: string;
  qrCodeBase64?: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

/** GET /farmer/kpis */
export const getFarmerKPIs = async (): Promise<KPICard[]> => {
  const res = await apiClient.get<{ data: KPICard[] }>("/farmer/kpis");
  return res.data.data;
};

/** GET /farmer/batches */
export const getFarmerBatches = async (): Promise<Batch[]> => {
  const res = await apiClient.get<{
    data:
      | Batch[]
      | {
          content: Batch[];
          totalElements: number;
          totalPages: number;
          currentPage: number;
        };
  }>("/farmer/batches");
  const data = res.data.data;
  // Handle both paginated response and direct array response
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object" && "content" in data) {
    return data.content;
  }
  return [];
};

/** GET /farmer/batches/:id */
export const getFarmerBatchById = async (batchId: string): Promise<Batch> => {
  const res = await apiClient.get<{ data: Batch }>(
    `/farmer/batches/${batchId}`
  );
  return res.data.data;
};

/** PATCH /farmer/batches/:id/harvest */
export const markBatchAsHarvested = async (batchId: string): Promise<Batch> => {
  const res = await apiClient.patch<ApiResponseWrapper<Batch>>(
    `/farmer/batches/${batchId}/harvest`
  );

  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || "Failed to mark batch as harvested");
  }

  return res.data.data;
};

/** GET /transfers/batches/:id/receipt */
export const getBatchTransferReceipt = async (
  batchId: string
): Promise<TransferReceiptDto> => {
  const res = await apiClient.get<ApiResponseWrapper<TransferReceiptDto>>(
    `/transfers/batches/${batchId}/receipt`
  );

  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || "Failed to fetch transfer receipt");
  }

  return res.data.data;
};

/** POST /farmer/batches — create a new batch */
export const createBatch = async (
  payload: CreateBatchPayload
): Promise<FarmerBatchDto> => {
  const res = await apiClient.post<ApiResponseWrapper<FarmerBatchDto>>(
    "/farmer/batches",
    payload
  );

  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || "Failed to create batch");
  }

  return res.data.data;
};

/** GET /farmer/activities */
export const getFarmerActivities = async (): Promise<ActivityItem[]> => {
  const res = await apiClient.get<{ data: ActivityItem[] }>(
    "/farmer/activities"
  );
  return res.data.data;
};

/** GET /farmer/quality-trends */
export const getFarmerQualityTrends = async (): Promise<
  QualityTrendPoint[]
> => {
  const res = await apiClient.get<{ data: QualityTrendPoint[] }>(
    "/farmer/quality-trends"
  );
  return res.data.data;
};

/** GET /farmer/shelf-life */
export const getFarmerShelfLife = async (): Promise<ShelfLifeItem[]> => {
  const res = await apiClient.get<{ data: ShelfLifeItem[] }>(
    "/farmer/shelf-life"
  );
  return res.data.data;
};

/** GET /farmer/batches/:id/timeline — supply-chain events for batch detail view */
export const getBatchTimeline = async (batchId: string) => {
  const res = await apiClient.get(`/farmer/batches/${batchId}/timeline`);
  return res.data.data;
};

// ── Profile ───────────────────────────────────────────────────────────────────

/** GET /farmer/profile */
export const getFarmerProfile = async () => {
  const res = await apiClient.get("/farmer/profile");
  return res.data.data;
};

/** PATCH /farmer/profile */
export const updateFarmerProfile = async (payload: Record<string, unknown>) => {
  const res = await apiClient.patch("/farmer/profile", payload);
  return res.data.data;
};

/** PATCH /farmer/farm-details */
export const updateFarmDetails = async (payload: Record<string, unknown>) => {
  const res = await apiClient.patch("/farmer/farm-details", payload);
  return res.data.data;
};

/** POST /farmer/profile/change-password */
export const changeFarmerPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  const res = await apiClient.post<{ data: { message: string } }>(
    "/farmer/profile/change-password",
    { currentPassword, newPassword }
  );
  return res.data.data;
};
