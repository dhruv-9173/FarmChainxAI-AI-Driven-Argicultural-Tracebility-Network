/**
 * notification.types.ts
 *
 * Centralized notification types for the FarmChainX platform.
 * Used across all roles: Farmer, Distributor, Retailer, and Admin.
 */

export type NotificationType =
  | "incoming_batch"
  | "transfer_confirmed"
  | "quality_alert"
  | "low_stock"
  | "expiry_alert"
  | "system"
  | "payment"
  | "user_request"
  | "batch_issue"
  | "compliance";

export type NotificationPriority = "low" | "medium" | "high";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon?: string;
  priority?: NotificationPriority;
  batchId?: string;
  from?: string;
  targetRole?: string;
}

export interface NotificationCountResponse {
  count: number;
}

export interface CreateNotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  priority?: NotificationPriority;
  batchId?: string;
  from?: string;
  targetRole?: string;
}

export interface MarkAsReadPayload {
  notificationIds: string[];
}

export interface PaginatedNotificationsResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
