/**
 * distributorApi.ts
 *
 * All HTTP calls for the Distributor role.
 * Connected to backend endpoints at /api/v1/distributor/*
 */

import apiClient from "../../../api/apiClient";
import type {
  DistributorBatch,
  DistributorNotification,
  DistributorAnalyticsPoint,
  DistributorActivityItem,
  RetailRecipient,
  FarmerListing,
  KpiCard,
  DistributorProfileData,
} from "../types/distributor.types";

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

// ── Profile ───────────────────────────────────────────────────────────────────

/** GET /api/v1/distributor/profile */
export const getDistributorProfile =
  async (): Promise<DistributorProfileData> => {
    const res = await apiClient.get("/distributor/profile");
    return res.data.data;
  };

/** PATCH /api/v1/distributor/profile */
export const updateDistributorProfile = async (
  payload: Record<string, unknown>
): Promise<DistributorProfileData> => {
  const res = await apiClient.patch("/distributor/profile", payload);
  return res.data.data;
};

/** POST /api/v1/distributor/profile/change-password */
export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  await apiClient.post("/distributor/profile/change-password", payload);
};

// ── KPI Endpoints ─────────────────────────────────────────────────────────────

/** GET /api/v1/distributor/kpis */
export const getDistributorKpis = async (): Promise<KpiCard[]> => {
  const res = await apiClient.get("/distributor/kpis");
  return res.data.data;
};

// ── Batches ───────────────────────────────────────────────────────────────────

/** GET /api/v1/distributor/batches/received */
export const getReceivedBatches = async (): Promise<DistributorBatch[]> => {
  const res = await apiClient.get("/distributor/batches/received");
  return res.data.data;
};

/** GET /api/v1/distributor/batches/pending */
export const getPendingBatches = async (): Promise<DistributorBatch[]> => {
  const res = await apiClient.get("/distributor/batches/pending");
  return res.data.data;
};

/** GET /api/v1/distributor/batches (all batches - for compatibility) */
export const getDistributorBatches = async (): Promise<DistributorBatch[]> => {
  const res = await apiClient.get("/distributor/batches/received");
  return res.data.data;
};

/** GET /api/v1/transfers/batches/:batchId/receipt */
export const getDistributorTransferReceipt = async (
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

// ── Recipients & Directory ────────────────────────────────────────────────────

/** GET /api/v1/distributor/transfer-recipients */
export const getDistributorRecipients = async (): Promise<
  RetailRecipient[]
> => {
  const res = await apiClient.get("/distributor/transfer-recipients");
  return res.data.data;
};

/** GET /api/v1/distributor/search-retailers?query=searchTerm */
export const searchRetailers = async (
  query: string
): Promise<RetailRecipient[]> => {
  const res = await apiClient.get("/distributor/search-retailers", {
    params: { query },
  });
  return res.data.data;
};

/** GET /distributor/farmers — farmer directory */
export const getFarmerDirectory = async (): Promise<FarmerListing[]> => {
  const res = await apiClient.get("/distributor/farmers");
  return res.data.data;
};

// ── Dashboard widgets ─────────────────────────────────────────────────────────

/** GET /api/v1/distributor/activities */
export const getDistributorActivities = async (): Promise<
  DistributorActivityItem[]
> => {
  const res = await apiClient.get("/distributor/activities");
  return res.data.data;
};

/** GET /api/v1/distributor/analytics */
export const getDistributorAnalytics = async (): Promise<
  DistributorAnalyticsPoint[]
> => {
  const res = await apiClient.get("/distributor/analytics");
  return res.data.data;
};

// ── Notifications ─────────────────────────────────────────────────────────────

/** GET /api/v1/distributor/notifications */
export const getDistributorNotifications = async (): Promise<
  DistributorNotification[]
> => {
  const res = await apiClient.get("/distributor/notifications");
  return res.data.data;
};
