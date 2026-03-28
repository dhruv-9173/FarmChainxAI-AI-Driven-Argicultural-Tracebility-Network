/**
 * retailerApi.ts
 *
 * All HTTP calls for the Retailer role.
 * Connect each function to the real backend endpoint when ready.
 */

import apiClient from "../../../api/apiClient";
import type {
  RetailerBatch,
  RetailerNotification,
  RetailerAnalyticsPoint,
  RetailerActivityItem,
  SupplierListing,
} from "../types/retailer.types";

// ── Batches / Inventory ───────────────────────────────────────────────────────

/** Raw shape returned by GET /api/v1/retailer/batches/received (mirrors DistributorBatchDto) */
interface RawReceivedBatch {
  id: string;
  cropType: string;
  variety?: string;
  quantity: string;
  qualityScore: number;
  status: string;        // e.g. "Accepted", "Available", "Sold Out"
  farmerName: string;    // sender name (farmer or distributor)
  farmerId: string;      // sender role-prefixed id
  farmLocation: string;
  receivedAt: string;
  shelfLifeDays: number;
  shelfLifePercent: number;
  qualityGrade?: string;
  organic?: boolean;
  inspectionNote?: string;
}

/** Map backend response → RetailerBatch */
function mapToRetailerBatch(raw: RawReceivedBatch): RetailerBatch {
  // Derive sourceType from the farmerId prefix ("FARMER-123" or "DISTRIBUTOR-123")
  const sourceType: "Farmer" | "Distributor" = raw.farmerId
    ?.toLowerCase()
    .startsWith("distributor")
    ? "Distributor"
    : "Farmer";

  return {
    id: raw.id,
    cropType: raw.cropType,
    variety: raw.variety,
    quantity: raw.quantity,
    remainingQty: raw.quantity, // no partial sales tracking yet
    qualityScore: raw.qualityScore ?? 0,
    qualityGrade: raw.qualityGrade,
    status: (raw.status as RetailerBatch["status"]) ?? "Accepted",
    sourceName: raw.farmerName,
    sourceId: raw.farmerId,
    sourceType,
    sourceLocation: raw.farmLocation ?? "",
    receivedAt: raw.receivedAt ?? "",
    expiresAt: "",
    shelfLifeDays: raw.shelfLifeDays ?? 0,
    shelfLifePercent: raw.shelfLifePercent ?? 0,
    pricePerKg: 0,
    sellingPricePerKg: 0,
    organic: raw.organic,
    inspectionNote: raw.inspectionNote,
  };
}

/** GET /api/v1/retailer/batches/received */
export const getRetailerBatches = async (): Promise<RetailerBatch[]> => {
  const res = await apiClient.get<{ data: RawReceivedBatch[] }>(
    "/api/v1/retailer/batches/received"
  );
  const raw = res.data.data;
  return Array.isArray(raw) ? raw.map(mapToRetailerBatch) : [];
};

// ── Dashboard widgets ─────────────────────────────────────────────────────────

/** GET /api/v1/retailer/activities */
export const getRetailerActivities = async (): Promise<
  RetailerActivityItem[]
> => {
  const res = await apiClient.get<{ data: RetailerActivityItem[] }>(
    "/api/v1/retailer/activities"
  );
  return res.data.data;
};

/** GET /api/v1/retailer/analytics/sales */
export const getRetailerAnalytics = async (): Promise<
  RetailerAnalyticsPoint[]
> => {
  const res = await apiClient.get<{ data: RetailerAnalyticsPoint[] }>(
    "/api/v1/retailer/analytics/sales"
  );
  return res.data.data;
};

// ── Notifications ─────────────────────────────────────────────────────────────

/** GET /api/v1/retailer/notifications */
export const getRetailerNotifications = async (): Promise<
  RetailerNotification[]
> => {
  const res = await apiClient.get<{ data: RetailerNotification[] }>(
    "/api/v1/retailer/notifications"
  );
  return res.data.data;
};

/** PATCH /api/v1/retailer/notifications/:id/read */
export const markRetailerNotificationRead = async (
  notifId: string
): Promise<void> => {
  await apiClient.patch(`/api/v1/retailer/notifications/${notifId}/read`);
};

// ── Suppliers ─────────────────────────────────────────────────────────────────

/** GET /api/v1/retailer/suppliers */
export const getSupplierDirectory = async (): Promise<SupplierListing[]> => {
  const res = await apiClient.get<{ data: SupplierListing[] }>(
    "/api/v1/retailer/suppliers"
  );
  return res.data.data;
};

// ── Profile ───────────────────────────────────────────────────────────────────

/** GET /api/v1/retailer/profile */
export const getRetailerProfile = async () => {
  const res = await apiClient.get("/api/v1/retailer/profile");
  return res.data.data;
};

/** PATCH /api/v1/retailer/profile */
export const updateRetailerProfile = async (
  payload: Record<string, unknown>
) => {
  const res = await apiClient.patch("/api/v1/retailer/profile", payload);
  return res.data.data;
};

// ── Additional endpoints ─────────────────────────────────────────────────────

/** GET /api/v1/retailer/inventory/summary */
export const getInventorySummary = async (): Promise<
  Record<string, unknown>
> => {
  const res = await apiClient.get<{ data: Record<string, unknown> }>(
    "/api/v1/retailer/inventory/summary"
  );
  return res.data.data;
};

/** @deprecated Use getRetailerBatches() instead */
export const getReceivedBatches = getRetailerBatches;

/** GET /api/v1/retailer/batches/expiring */
export const getExpiringBatches = async (): Promise<RetailerBatch[]> => {
  const res = await apiClient.get<{ data: RetailerBatch[] }>(
    "/api/v1/retailer/batches/expiring"
  );
  return res.data.data;
};

/** GET /api/v1/retailer/batches/quality-alerts */
export const getQualityAlerts = async (): Promise<Record<string, unknown>> => {
  const res = await apiClient.get<{ data: Record<string, unknown> }>(
    "/api/v1/retailer/batches/quality-alerts"
  );
  return res.data.data;
};

/** POST /api/v1/retailer/batches/:id/mark-sold */
export const markBatchAsSold = async (
  batchId: string,
  quantitySold: number,
  sellingPrice: number
): Promise<RetailerBatch> => {
  const res = await apiClient.post<{ data: RetailerBatch }>(
    `/api/v1/retailer/batches/${batchId}/mark-sold`,
    { quantitySold, sellingPrice }
  );
  return res.data.data;
};

/** GET /api/v1/retailer/quality-checks/pending */
export const getPendingQualityChecks = async (): Promise<
  Record<string, unknown>[]
> => {
  const res = await apiClient.get<{ data: Record<string, unknown>[] }>(
    "/api/v1/retailer/quality-checks/pending"
  );
  return res.data.data;
};
