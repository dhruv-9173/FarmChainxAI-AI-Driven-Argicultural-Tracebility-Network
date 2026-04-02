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

/** Raw shape returned by GET /retailer/batches/received (mirrors DistributorBatchDto) */
interface RawReceivedBatch {
  id: string;
  cropType: string;
  variety?: string;
  quantity: string;
  qualityScore: number;
  status: string; // e.g. "Accepted", "Available", "Sold Out"
  farmerName: string; // sender name (farmer or distributor)
  farmerId: string; // sender role-prefixed id
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

/** GET /retailer/batches/received */
export const getRetailerBatches = async (): Promise<RetailerBatch[]> => {
  const res = await apiClient.get<{ data: RawReceivedBatch[] }>(
    "/retailer/batches/received"
  );
  const raw = res.data.data;
  return Array.isArray(raw) ? raw.map(mapToRetailerBatch) : [];
};

// ── Dashboard widgets ─────────────────────────────────────────────────────────

/** GET /retailer/activities */
export const getRetailerActivities = async (): Promise<
  RetailerActivityItem[]
> => {
  const res = await apiClient.get<{ data: RetailerActivityItem[] }>(
    "/retailer/activities"
  );
  return res.data.data;
};

/** GET /retailer/analytics/sales */
export const getRetailerAnalytics = async (): Promise<
  RetailerAnalyticsPoint[]
> => {
  const res = await apiClient.get<{ data: RetailerAnalyticsPoint[] }>(
    "/retailer/analytics/sales"
  );
  return res.data.data;
};

// ── Notifications ─────────────────────────────────────────────────────────────

/** GET /notifications/unread */
export const getRetailerNotifications = async (): Promise<
  RetailerNotification[]
> => {
  const res = await apiClient.get<{ data: any[] }>("/notifications/unread");
  return res.data.data.map((n) => ({
    id: n.id,
    type: "system",
    title: n.title,
    message: n.message,
    timestamp: n.createdAt || "",
    read: n.isRead,
    batchId: n.batchId,
    icon: "📢",
  }));
};

/** PATCH /notifications/:id/read */
export const markRetailerNotificationRead = async (
  notifId: string
): Promise<void> => {
  await apiClient.patch(`/notifications/${notifId}/read`);
};

export const markAllRetailerNotificationsRead = async (): Promise<void> => {
  await apiClient.patch(`/notifications/mark-all-as-read`);
};

// ── Suppliers ─────────────────────────────────────────────────────────────────

/** GET /browse/users */
export const getSupplierDirectory = async (): Promise<SupplierListing[]> => {
  const res = await apiClient.get<{ data: any[] }>(
    "/browse/users?role=FARMER&role=DISTRIBUTOR"
  );
  return res.data.data.map((user) => ({
    id: String(user.id),
    name: user.fullName || "Unknown",
    businessName: user.businessName || "Unknown",
    type: user.role === "FARMER" ? "Farmer" : "Distributor",
    rating: 4.5,
    location: user.location || "N/A",
    state: user.state || "N/A",
    phone: user.phone || "",
    email: user.email || "",
    specialization: user.specialization || "General",
    totalBatchesSent: 0,
    activeBatches: 0,
    organic: false,
    joinedDate: "2024",
    availableBatches: [],
  }));
};

// ── Profile ───────────────────────────────────────────────────────────────────

/** GET /retailer/profile */
export const getRetailerProfile = async () => {
  const res = await apiClient.get("/retailer/profile");
  return res.data.data;
};

/** PATCH /retailer/profile */
export const updateRetailerProfile = async (
  payload: Record<string, unknown>
) => {
  const res = await apiClient.patch("/retailer/profile", payload);
  return res.data.data;
};

// ── Additional endpoints ─────────────────────────────────────────────────────

/** GET /retailer/inventory/summary */
export const getInventorySummary = async (): Promise<
  Record<string, unknown>
> => {
  const res = await apiClient.get<{ data: Record<string, unknown> }>(
    "/retailer/inventory/summary"
  );
  return res.data.data;
};

/** @deprecated Use getRetailerBatches() instead */
export const getReceivedBatches = getRetailerBatches;

/** GET /retailer/batches/expiring */
export const getExpiringBatches = async (): Promise<RetailerBatch[]> => {
  const res = await apiClient.get<{ data: RetailerBatch[] }>(
    "/retailer/batches/expiring"
  );
  return res.data.data;
};

/** GET /retailer/batches/quality-alerts */
export const getQualityAlerts = async (): Promise<Record<string, unknown>> => {
  const res = await apiClient.get<{ data: Record<string, unknown> }>(
    "/retailer/batches/quality-alerts"
  );
  return res.data.data;
};

/** POST /retailer/batches/:id/accept */
export const acceptRetailerBatch = async (
  batchId: string,
  payload?: { shelfPrice?: number; inspectionNote?: string }
): Promise<RetailerBatch> => {
  const res = await apiClient.post<{ data: RetailerBatch }>(
    `/retailer/batches/${batchId}/accept`,
    payload ?? {}
  );
  return res.data.data;
};

/** POST /retailer/batches/:id/mark-sold */
export const markBatchAsSold = async (
  batchId: string,
  quantitySold: number,
  sellingPrice: number
): Promise<RetailerBatch> => {
  const res = await apiClient.post<{ data: RetailerBatch }>(
    `/retailer/batches/${batchId}/mark-sold`,
    { quantitySold, sellingPrice }
  );
  return res.data.data;
};

/** GET /retailer/quality-checks/pending */
export const getPendingQualityChecks = async (): Promise<
  Record<string, unknown>[]
> => {
  const res = await apiClient.get<{ data: Record<string, unknown>[] }>(
    "/retailer/quality-checks/pending"
  );
  return res.data.data;
};
