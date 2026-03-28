/**
 * notificationApi.ts
 *
 * Notification service API for FarmChainX platform.
 * Provides centralized notification management across all user roles.
 *
 * Backend Base URL: http://localhost:8080/api/v1/notifications
 *
 * Available Endpoints:
 * - GET /api/v1/notifications/new - Get new notifications
 * - GET /api/v1/notifications/unread - Get all unread notifications
 * - GET /api/v1/notifications - Get paginated notifications
 * - GET /api/v1/notifications/unread/count - Get unread notification count
 * - POST /api/v1/notifications - Create new notification
 * - PATCH /api/v1/notifications/{id}/read - Mark single notification as read
 * - POST /api/v1/notifications/mark-as-read - Mark batch notifications as read
 * - PATCH /api/v1/notifications/mark-all-as-read - Mark all notifications as read
 * - DELETE /api/v1/notifications/{id} - Delete single notification
 * - DELETE /api/v1/notifications/all - Delete all notifications
 */

import type { AxiosResponse } from "axios";
import { isAxiosError } from "axios";
import apiClient from "./apiClient";
import type {
  Notification,
  NotificationCountResponse,
  CreateNotificationPayload,
  MarkAsReadPayload,
  PaginatedNotificationsResponse,
} from "../types/notification.types";

// ── Type for API responses from backend ────────────────────────────────────────
interface ApiResponseWrapper<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: number;
}

// ── Helper function ────────────────────────────────────────────────────────────
function extractMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const errorData = error.response?.data as
      | Record<string, unknown>
      | undefined;
    const message =
      (errorData?.message as string | undefined) ??
      (errorData?.error as string | undefined) ??
      error.response?.statusText ??
      fallback;
    return typeof message === "string" ? message : fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

// ── Notification API Functions ─────────────────────────────────────────────────

/**
 * GET /api/v1/notifications/new
 * Fetch new notifications (typically unread or recent)
 */
export const getNewNotifications = async (): Promise<Notification[]> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<Notification[]>> =
      await apiClient.get("/notifications/new");
    return res.data.data;
  } catch (error) {
    throw new Error(
      extractMessage(error, "Failed to fetch new notifications.")
    );
  }
};

/**
 * GET /api/v1/notifications/unread
 * Fetch all unread notifications
 */
export const getUnreadNotifications = async (): Promise<Notification[]> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<Notification[]>> =
      await apiClient.get("/notifications/unread");
    return res.data.data;
  } catch (error) {
    throw new Error(
      extractMessage(error, "Failed to fetch unread notifications.")
    );
  }
};

/**
 * GET /api/v1/notifications
 * Fetch paginated notifications
 * @param page - Page number (0-indexed)
 * @param size - Number of items per page
 * @param sort - Sort criteria (e.g., "timestamp,desc")
 */
export const getNotifications = async (
  page: number = 0,
  size: number = 20,
  sort: string = "timestamp,desc"
): Promise<PaginatedNotificationsResponse> => {
  try {
    const res: AxiosResponse<
      ApiResponseWrapper<PaginatedNotificationsResponse>
    > = await apiClient.get("/notifications", {
      params: { page, size, sort },
    });
    return res.data.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to fetch notifications."));
  }
};

/**
 * GET /api/v1/notifications/unread/count
 * Get count of unread notifications
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<NotificationCountResponse>> =
      await apiClient.get("/notifications/unread/count");
    return res.data.data.count;
  } catch (error) {
    throw new Error(
      extractMessage(error, "Failed to fetch unread notification count.")
    );
  }
};

/**
 * POST /api/v1/notifications
 * Create a new notification
 * @param payload - Notification creation data
 */
export const createNotification = async (
  payload: CreateNotificationPayload
): Promise<Notification> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<Notification>> =
      await apiClient.post("/notifications", payload);
    return res.data.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to create notification."));
  }
};

/**
 * PATCH /api/v1/notifications/{id}/read
 * Mark a single notification as read
 * @param id - Notification ID
 */
export const markNotificationAsRead = async (
  id: string
): Promise<Notification> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<Notification>> =
      await apiClient.patch(`/notifications/${id}/read`);
    return res.data.data;
  } catch (error) {
    throw new Error(
      extractMessage(error, "Failed to mark notification as read.")
    );
  }
};

/**
 * POST /api/v1/notifications/mark-as-read
 * Mark multiple notifications as read
 * @param notificationIds - Array of notification IDs to mark as read
 */
export const markNotificationsAsRead = async (
  notificationIds: string[]
): Promise<{ message: string }> => {
  try {
    const payload: MarkAsReadPayload = { notificationIds };
    const res: AxiosResponse<ApiResponseWrapper<{ message: string }>> =
      await apiClient.post("/notifications/mark-as-read", payload);
    return res.data.data;
  } catch (error) {
    throw new Error(
      extractMessage(error, "Failed to mark notifications as read.")
    );
  }
};

/**
 * PATCH /api/v1/notifications/mark-all-as-read
 * Mark all notifications as read for the current user
 */
export const markAllNotificationsAsRead = async (): Promise<{
  message: string;
}> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<{ message: string }>> =
      await apiClient.patch("/notifications/mark-all-as-read");
    return res.data.data;
  } catch (error) {
    throw new Error(
      extractMessage(error, "Failed to mark all notifications as read.")
    );
  }
};

/**
 * DELETE /api/v1/notifications/{id}
 * Delete a single notification
 * @param id - Notification ID
 */
export const deleteNotification = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<{ message: string }>> =
      await apiClient.delete(`/notifications/${id}`);
    return res.data.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to delete notification."));
  }
};

/**
 * DELETE /api/v1/notifications/all
 * Delete all notifications for the current user
 */
export const deleteAllNotifications = async (): Promise<{
  message: string;
}> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<{ message: string }>> =
      await apiClient.delete("/notifications/all");
    return res.data.data;
  } catch (error) {
    throw new Error(
      extractMessage(error, "Failed to delete all notifications.")
    );
  }
};
