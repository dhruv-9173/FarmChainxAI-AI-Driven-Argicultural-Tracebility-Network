export type RetailerBatchStatus =
  | "Accepted"
  | "Available"
  | "Low Stock"
  | "Sold Out"
  | "Expired"
  | "Rejected";

export interface RetailerBatch {
  id: string;
  cropType: string;
  variety?: string;
  quantity: string;
  remainingQty: string;
  qualityScore: number;
  qualityGrade?: string;
  status: RetailerBatchStatus;
  sourceName: string;
  sourceId: string;
  sourceType: "Farmer" | "Distributor";
  sourceLocation: string;
  receivedAt: string;
  expiresAt: string;
  shelfLifeDays: number;
  shelfLifePercent: number;
  pricePerKg: number;
  sellingPricePerKg: number;
  organic?: boolean;
  inspectionNote?: string;
  soldQty?: string;
  revenue?: number;
  section?: string;
}

export interface RetailerNotification {
  id: string;
  type: "incoming_batch" | "low_stock" | "expiry_alert" | "system" | "payment";
  title: string;
  message: string;
  batchId?: string;
  from?: string;
  timestamp: string;
  read: boolean;
  icon: string;
}

export interface RetailerAnalyticsPoint {
  month: string;
  received: number;
  sold: number;
  expired: number;
  revenue: number;
}

export interface RetailerUserProfile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  memberSince: string;
  retailerId: string;
  avatarUrl?: string;
}

export interface RetailerBusinessProfile {
  storeName: string;
  licenseNumber: string;
  location: string;
  storeType: string;
  storeCapacity: string;
  operatingHours: string;
  specialization: string;
}

export interface RetailerActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  badge: string;
  badgeColor: string;
}

export interface SupplierBatchListing {
  id: string;
  cropType: string;
  variety?: string;
  quantity: string;
  qualityScore: number;
  qualityGrade: string;
  pricePerKg: number;
  availableUntil: string;
  organic: boolean;
}

export interface SupplierListing {
  id: string;
  name: string;
  businessName: string;
  type: "Farmer" | "Distributor";
  location: string;
  state: string;
  phone: string;
  email: string;
  specialization: string;
  rating: number;
  totalBatchesSent: number;
  activeBatches: number;
  organic: boolean;
  joinedDate: string;
  availableBatches: SupplierBatchListing[];
}
