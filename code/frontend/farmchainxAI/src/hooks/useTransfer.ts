/**
 * useTransfer.ts
 *
 * Custom React hook for managing batch transfers.
 * Provides easy access to transfer API functions and state management.
 */

import { useState, useCallback } from "react";
import {
  getTransferRecipients,
  searchRecipients,
  initiateTransfer,
  acceptTransfer,
  rejectTransfer,
  cancelTransfer,
  getTransferableBatches,
} from "../api/transferApi";
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

interface UseTransferReturn {
  // State
  loading: boolean;
  error: string | null;

  // Fetch functions
  fetchRecipients: (role: RecipientRole) => Promise<Recipient[]>;
  searchUsers: (role: RecipientRole, query: string) => Promise<Recipient[]>;
  fetchTransferableBatches: (
    status?: BatchStatus,
    page?: number,
    limit?: number
  ) => Promise<TransferableBatch[]>;

  // Action functions
  createTransfer: (
    payload: InitiateTransferPayload
  ) => Promise<TransferResponse>;
  acceptBatchTransfer: (
    transferId: string,
    payload?: AcceptTransferPayload
  ) => Promise<TransferResponse>;
  rejectBatchTransfer: (
    transferId: string,
    payload?: RejectTransferPayload
  ) => Promise<TransferResponse>;
  cancelBatchTransfer: (transferId: string) => Promise<{ message: string }>;
}

export function useTransfer(): UseTransferReturn {
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
  const fetchRecipients = useCallback(
    (role: RecipientRole) => handleApiCall(() => getTransferRecipients(role)),
    [handleApiCall]
  );

  const searchUsers = useCallback(
    (role: RecipientRole, query: string) =>
      handleApiCall(() => searchRecipients(role, query)),
    [handleApiCall]
  );

  const fetchTransferableBatches = useCallback(
    (status?: BatchStatus, page?: number, limit?: number) =>
      handleApiCall(() => getTransferableBatches(status, page, limit)),
    [handleApiCall]
  );

  // Action functions
  const createTransfer = useCallback(
    (payload: InitiateTransferPayload) =>
      handleApiCall(() => initiateTransfer(payload)),
    [handleApiCall]
  );

  const acceptBatchTransfer = useCallback(
    (transferId: string, payload?: AcceptTransferPayload) =>
      handleApiCall(() => acceptTransfer(transferId, payload)),
    [handleApiCall]
  );

  const rejectBatchTransfer = useCallback(
    (transferId: string, payload?: RejectTransferPayload) =>
      handleApiCall(() => rejectTransfer(transferId, payload)),
    [handleApiCall]
  );

  const cancelBatchTransfer = useCallback(
    (transferId: string) => handleApiCall(() => cancelTransfer(transferId)),
    [handleApiCall]
  );

  return {
    loading,
    error,
    fetchRecipients,
    searchUsers,
    fetchTransferableBatches,
    createTransfer,
    acceptBatchTransfer,
    rejectBatchTransfer,
    cancelBatchTransfer,
  };
}
