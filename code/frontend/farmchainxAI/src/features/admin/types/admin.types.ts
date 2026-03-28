/* ── Admin Dashboard Types ──────────────────────────── */

export type AdminUserRole = "FARMER" | "DISTRIBUTOR" | "RETAILER" | "CONSUMER";

export type AdminUserStatus = "Pending" | "Active" | "Inactive" | "Suspended";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  registeredAt: string;
  lastLogin: string;
  location: string;
  /** business / farm name */
  entityName: string;
  /** total batches transacted */
  batchCount: number;
  verified: boolean;
  avatarInitials: string;
}

export type AdminBatchStatus =
  | "Seeded"
  | "Incoming"
  | "Accepted"
  | "In Transit"
  | "Transferred"
  | "Available"
  | "Low Stock"
  | "Sold Out"
  | "Expired"
  | "Rejected";

export interface AdminBatch {
  id: string;
  cropType: string;
  variety?: string;
  quantity: string;
  qualityScore: number;
  qualityGrade?: string;
  status: AdminBatchStatus;
  organic: boolean;
  /** farmer who created the batch */
  farmerName: string;
  farmerId: string;
  farmLocation: string;
  createdAt: string;
  /** current holder */
  currentHolderName?: string;
  currentHolderRole?: "Farmer" | "Distributor" | "Retailer";
  /** final destination if transferred */
  destinationName?: string;
  transferredAt?: string;
  shelfLifePercent: number;
  basePrice?: number;
}

export interface AdminNotification {
  id: string;
  type:
    | "user_request"
    | "quality_alert"
    | "batch_issue"
    | "system"
    | "compliance";
  title: string;
  message: string;
  targetRole?: AdminUserRole | "ALL";
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
  icon: string;
}

export interface AdminAnalyticsPoint {
  month: string;
  farmers: number;
  distributors: number;
  retailers: number;
  batchesCreated: number;
  batchesDelivered: number;
}

export interface SystemHealthMetric {
  name: string;
  status: "Operational" | "Degraded" | "Down";
  uptime: string;
  latency: string;
  icon: string;
}

export interface AdminActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}

export interface AdminUserProfile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  adminId: string;
  avatarUrl?: string;
}
