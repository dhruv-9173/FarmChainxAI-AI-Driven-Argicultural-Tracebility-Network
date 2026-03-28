/**
 * transferApi.ts
 *
 * Batch transfer API for FarmChainX platform.
 * Handles all transfer-related operations across different roles.
 *
 * Backend Base URL: http://localhost:8080/api/v1
 *
 * Available Endpoints:
 * - GET /transfers/recipients?role=X - Get past recipients
 * - GET /transfers/search?role=X&query=Y - Search recipients
 * - POST /transfers/initiate - Create transfer
 * - POST /transfers/{id}/accept - Accept transfer
 * - POST /transfers/{id}/reject - Reject transfer
 * - DELETE /transfers/{id} - Cancel transfer
 */

import type { AxiosResponse } from "axios";
import { isAxiosError } from "axios";
import apiClient from "./apiClient";
import type {
  Recipient,
  RecipientRole,
  InitiateTransferPayload,
  TransferResponse,
  AcceptTransferPayload,
  RejectTransferPayload,
  TransferableBatch,
  BatchStatus,
} from "../types/transfer.types";

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

// ── Transfer API Functions ─────────────────────────────────────────────────────

/**
 * GET /transfers/recipients
 * Get list of past transfer recipients by role
 * @param role - Recipient role to filter (DISTRIBUTOR | RETAILER | CONSUMER | FARMER | ADMIN)
 */
export const getTransferRecipients = async (
  role: RecipientRole
): Promise<Recipient[]> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<Recipient[]>> =
      await apiClient.get("/transfers/recipients", {
        params: { role },
      });
    return res.data.data;
  } catch (error) {
    throw new Error(
      extractMessage(error, "Failed to fetch transfer recipients.")
    );
  }
};

/**
 * GET /transfers/search
 * Search for users by name or email
 * @param role - Recipient role to filter
 * @param query - Search string (name or email)
 */
export const searchRecipients = async (
  role: RecipientRole,
  query: string
): Promise<Recipient[]> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<Recipient[]>> =
      await apiClient.get("/transfers/search", {
        params: { role, query },
      });
    return res.data.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to search recipients."));
  }
};

/**
 * POST /transfers/initiate
 * Create a new batch transfer
 * @param payload - Transfer initiation data
 *
 * Validation Rules:
 * - Batch must exist and belong to sender
 * - Batch status must be ACTIVE or PENDING
 * - Recipient must exist with matching role
 * - Cannot transfer to self
 * - Role-based permissions:
 *   - FARMER → CONSUMER, DISTRIBUTOR, RETAILER
 *   - DISTRIBUTOR → RETAILER, CONSUMER
 *   - Others → Cannot transfer
 *
 * Side Effects:
 * - Batch status changes to TRANSFERRED
 * - Creates notification to both parties
 * - Creates activity log
 */
export const initiateTransfer = async (
  payload: InitiateTransferPayload
): Promise<TransferResponse> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<TransferResponse>> =
      await apiClient.post("/transfers/initiate", payload);
    return res.data.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to initiate transfer."));
  }
};

/**
 * POST /transfers/{transferId}/accept
 * Accept a pending transfer as recipient
 * @param transferId - Transfer ID to accept
 * @param payload - Optional inspection note
 *
 * Validation:
 * - User must be recipient
 * - Transfer status must be PENDING
 *
 * Side Effects:
 * - Transfer status changes to ACCEPTED
 * - Batch status changes to RECEIVED
 * - Notification sent to sender
 * - Activity log created
 */
export const acceptTransfer = async (
  transferId: string,
  payload?: AcceptTransferPayload
): Promise<TransferResponse> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<TransferResponse>> =
      await apiClient.post(`/transfers/${transferId}/accept`, payload || {});
    return res.data.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to accept transfer."));
  }
};

/**
 * POST /transfers/{transferId}/reject
 * Reject a pending transfer as recipient
 * @param transferId - Transfer ID to reject
 * @param payload - Optional rejection reason
 *
 * Validation:
 * - User must be recipient
 * - Transfer status must be PENDING
 *
 * Side Effects:
 * - Transfer status changes to REJECTED
 * - Batch status reverts to ACTIVE
 * - Notification sent to sender
 * - Activity log created
 */
export const rejectTransfer = async (
  transferId: string,
  payload?: RejectTransferPayload
): Promise<TransferResponse> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<TransferResponse>> =
      await apiClient.post(`/transfers/${transferId}/reject`, payload || {});
    return res.data.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to reject transfer."));
  }
};

/**
 * DELETE /transfers/{transferId}
 * Cancel a pending transfer as sender
 * @param transferId - Transfer ID to cancel
 *
 * Validation:
 * - User must be sender
 * - Transfer status must be PENDING
 *
 * Side Effects:
 * - Transfer status changes to CANCELLED
 * - Batch status reverts to ACTIVE
 * - Notification sent to recipient
 * - Activity log created
 */
export const cancelTransfer = async (
  transferId: string
): Promise<{ message: string }> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<{ message: string }>> =
      await apiClient.delete(`/transfers/${transferId}`);
    return res.data.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to cancel transfer."));
  }
};

/**
 * GET /farmer/batches?status=ACTIVE
 * Get active batches available for transfer
 * @param status - Optional status filter (defaults to ACTIVE)
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 */
export const getTransferableBatches = async (
  status?: BatchStatus,
  page: number = 0,
  limit: number = 20
): Promise<TransferableBatch[]> => {
  try {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    const role = userStr ? JSON.parse(userStr).role : "FARMER";

    if (role?.toUpperCase() === "DISTRIBUTOR") {
      // Distributor needs to fetch their received batches
      const res = await apiClient.get("/distributor/batches/received");
      const data = res.data.data;
      if (Array.isArray(data)) {
        // Backend allows RECEIVED_BY_DIST and QUALITY_PASSED to be transferred.
        // If a specific status is requested, honour it; otherwise show both eligible statuses.
        const TRANSFERABLE_DIST_STATUSES: string[] = ["RECEIVED_BY_DIST", "QUALITY_PASSED", "ACCEPTED"];
        const allowedStatuses: string[] = status
          ? [(status as string).toUpperCase()]
          : TRANSFERABLE_DIST_STATUSES;
        return data
          .filter((b: Record<string, unknown>) => {
             const bStatus = String(b.status || "").toUpperCase();
             return allowedStatuses.includes(bStatus);
          })
          .map((b: Record<string, unknown>): TransferableBatch => {
            // DistributorBatchDto.quantity is a formatted string like "2,400 kg"
            // Parse out the numeric part
            const rawQty = String(b.quantity ?? "0");
            const numericQty = parseFloat(rawQty.replace(/[^0-9.]/g, "")) || 0;
            // Extract unit from quantity string (default kg)
            const unitMatch = rawQty.match(/\b(kg|ton|quintal)\b/i);
            const unit = (unitMatch ? unitMatch[1].toLowerCase() : "kg") as "kg" | "ton" | "quintal";

            return {
              id: String(b.id ?? ""),
              cropType: String(b.cropType ?? ""),
              variety: b.variety ? String(b.variety) : undefined,
              quantity: numericQty,
              quantityUnit: unit,
              qualityScore: Number(b.qualityScore ?? 0),
              qualityGrade: b.qualityGrade ? String(b.qualityGrade) : undefined,
              status: (b.status as BatchStatus) ?? "QUALITY_PASSED",
              farmCity: undefined,
              farmState: undefined,
              expectedShelfLifeDays: Number(b.shelfLifeDays ?? 30),
              currentShelfLifeDays: Math.round(
                (Number(b.shelfLifePercent ?? 100) / 100) * Number(b.shelfLifeDays ?? 30)
              ),
              organic: Boolean(b.organic ?? false),
              gapCertified: false,
              createdAt: String(b.receivedAt ?? ""),
              updatedAt: String(b.receivedAt ?? ""),
              notes: b.inspectionNote ? String(b.inspectionNote) : undefined,
            };
          });
      }
      return [];
    }

    // Default to FARMER
    const targetStatus = status || "ACTIVE";
    const res: AxiosResponse<
      ApiResponseWrapper<{
        content: TransferableBatch[];
        totalElements: number;
        totalPages: number;
        currentPage: number;
      }>
    > = await apiClient.get("/farmer/batches", {
      params: { status: targetStatus, page, limit },
    });

    // Handle both paginated and direct array responses
    const data = res.data.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === "object" && "content" in data) {
      return data.content;
    }
    return [];
  } catch (error) {
    throw new Error(
      extractMessage(error, "Failed to fetch transferable batches.")
    );
  }
};
