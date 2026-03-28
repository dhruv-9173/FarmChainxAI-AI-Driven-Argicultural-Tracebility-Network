/**
 * adminApi.ts
 *
 * All HTTP calls for the Admin role.
 * Connect each function to the real backend endpoint when ready.
 */

import apiClient from "../../../api/apiClient";
import type {
  AdminUser,
  AdminBatch,
  AdminNotification,
  AdminAnalyticsPoint,
  SystemHealthMetric,
} from "../types/admin.types";

// ── Users ─────────────────────────────────────────────────────────────────────

/** GET /admin/users */
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const res = await apiClient.get<AdminUser[]>("/admin/users");
  return res.data;
};

/** PATCH /admin/users/:id/approve */
export const approveUser = async (userId: string): Promise<AdminUser> => {
  const res = await apiClient.patch<AdminUser>(
    `/admin/users/${userId}/approve`
  );
  return res.data;
};

/** PATCH /admin/users/:id/suspend */
export const suspendUser = async (userId: string): Promise<AdminUser> => {
  const res = await apiClient.patch<AdminUser>(
    `/admin/users/${userId}/suspend`
  );
  return res.data;
};

/** PATCH /admin/users/:id/activate */
export const activateUser = async (userId: string): Promise<AdminUser> => {
  const res = await apiClient.patch<AdminUser>(
    `/admin/users/${userId}/activate`
  );
  return res.data;
};

// ── Batches ───────────────────────────────────────────────────────────────────

/** GET /admin/batches */
export const getAdminBatches = async (): Promise<AdminBatch[]> => {
  const res = await apiClient.get<AdminBatch[]>("/admin/batches");
  return res.data;
};

// ── Notifications ─────────────────────────────────────────────────────────────

/** GET /admin/notifications */
export const getAdminNotifications = async (): Promise<AdminNotification[]> => {
  const res = await apiClient.get<AdminNotification[]>("/admin/notifications");
  return res.data;
};

/** PATCH /admin/notifications/:id/read */
export const markAdminNotificationRead = async (id: string): Promise<void> => {
  await apiClient.patch(`/admin/notifications/${id}/read`);
};

/** POST /admin/notifications — broadcast to a role or all users */
export const sendAdminNotification = async (payload: {
  targetRole: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
}): Promise<AdminNotification> => {
  const res = await apiClient.post<AdminNotification>(
    "/admin/notifications",
    payload
  );
  return res.data;
};

// ── Analytics & Health ────────────────────────────────────────────────────────

/** GET /admin/analytics */
export const getAdminAnalytics = async (): Promise<AdminAnalyticsPoint[]> => {
  const res = await apiClient.get<AdminAnalyticsPoint[]>("/admin/analytics");
  return res.data;
};

/** GET /admin/system-health */
export const getSystemHealth = async (): Promise<SystemHealthMetric[]> => {
  const res = await apiClient.get<SystemHealthMetric[]>("/admin/system-health");
  return res.data;
};

// ── Profile ───────────────────────────────────────────────────────────────────

/** GET /admin/profile */
export const getAdminProfile = async () => {
  const res = await apiClient.get("/admin/profile");
  return res.data;
};
