/**
 * useNotifications.ts
 *
 * Custom React hook for managing notifications.
 * Provides easy access to notification API functions and state management.
 */

import { useState, useCallback } from "react";
import {
  getNewNotifications,
  getUnreadNotifications,
  getNotifications,
  getUnreadCount,
  createNotification,
  markNotificationAsRead,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../api/notificationApi";
import type {
  Notification,
  CreateNotificationPayload,
  PaginatedNotificationsResponse,
} from "../types/notification.types";

interface UseNotificationsReturn {
  // State
  loading: boolean;
  error: string | null;

  // Fetch functions
  fetchNewNotifications: () => Promise<Notification[]>;
  fetchUnreadNotifications: () => Promise<Notification[]>;
  fetchNotifications: (
    page?: number,
    size?: number,
    sort?: string
  ) => Promise<PaginatedNotificationsResponse>;
  fetchUnreadCount: () => Promise<number>;

  // Action functions
  createNewNotification: (
    payload: CreateNotificationPayload
  ) => Promise<Notification>;
  markAsRead: (id: string) => Promise<Notification>;
  markMultipleAsRead: (ids: string[]) => Promise<{ message: string }>;
  markAllAsRead: () => Promise<{ message: string }>;
  deleteOne: (id: string) => Promise<{ message: string }>;
  deleteAll: () => Promise<{ message: string }>;
}

export function useNotifications(): UseNotificationsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wrapper to handle loading and error states
  const handleApiCall = useCallback(
    async <T>(apiCall: () => Promise<T>): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiCall();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch functions
  const fetchNewNotifications = useCallback(
    () => handleApiCall(() => getNewNotifications()),
    [handleApiCall]
  );

  const fetchUnreadNotifications = useCallback(
    () => handleApiCall(() => getUnreadNotifications()),
    [handleApiCall]
  );

  const fetchNotifications = useCallback(
    (page?: number, size?: number, sort?: string) =>
      handleApiCall(() => getNotifications(page, size, sort)),
    [handleApiCall]
  );

  const fetchUnreadCount = useCallback(
    () => handleApiCall(() => getUnreadCount()),
    [handleApiCall]
  );

  // Action functions
  const createNewNotification = useCallback(
    (payload: CreateNotificationPayload) =>
      handleApiCall(() => createNotification(payload)),
    [handleApiCall]
  );

  const markAsRead = useCallback(
    (id: string) => handleApiCall(() => markNotificationAsRead(id)),
    [handleApiCall]
  );

  const markMultipleAsRead = useCallback(
    (ids: string[]) => handleApiCall(() => markNotificationsAsRead(ids)),
    [handleApiCall]
  );

  const markAllAsRead = useCallback(
    () => handleApiCall(() => markAllNotificationsAsRead()),
    [handleApiCall]
  );

  const deleteOne = useCallback(
    (id: string) => handleApiCall(() => deleteNotification(id)),
    [handleApiCall]
  );

  const deleteAll = useCallback(
    () => handleApiCall(() => deleteAllNotifications()),
    [handleApiCall]
  );

  return {
    loading,
    error,
    fetchNewNotifications,
    fetchUnreadNotifications,
    fetchNotifications,
    fetchUnreadCount,
    createNewNotification,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteOne,
    deleteAll,
  };
}
