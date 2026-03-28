import apiClient from "../../../api/apiClient";

interface ApiResponseWrapper<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export type TransferRole = "DISTRIBUTOR" | "RETAILER" | "CONSUMER";
export type SenderRole = "FARMER" | "DISTRIBUTOR";

export interface TransferRecipientDto {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  transferCount: number;
  lastTransferDate: string;
}

export interface InitiateBatchTransferRequest {
  batchId: string;
  recipientId: number;
  recipientRole: TransferRole;
  note?: string;
}

export interface BatchTransferResponse {
  transferId: string;
  batchId: string;
  recipientId: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
}

const unwrap = <T>(res: ApiResponseWrapper<T>): T => {
  if (!res.success || !res.data) {
    throw new Error(res.message || "Transfer request failed");
  }
  return res.data;
};

const ALLOWED_RECIPIENT_ROLES: Record<SenderRole, TransferRole[]> = {
  FARMER: ["DISTRIBUTOR", "RETAILER", "CONSUMER"],
  DISTRIBUTOR: ["RETAILER", "CONSUMER"],
};

export const isRecipientRoleAllowed = (
  senderRole: SenderRole,
  recipientRole: TransferRole
): boolean => ALLOWED_RECIPIENT_ROLES[senderRole].includes(recipientRole);

export const assertTransferRoleAllowed = (
  senderRole: SenderRole,
  recipientRole: TransferRole
): void => {
  if (!isRecipientRoleAllowed(senderRole, recipientRole)) {
    throw new Error(
      senderRole === "DISTRIBUTOR"
        ? "Validation failed: Distributor can transfer only to RETAILER or CONSUMER"
        : "Validation failed: Farmer can transfer only to DISTRIBUTOR, RETAILER, or CONSUMER"
    );
  }
};

export const getRecipientsByRole = async (
  role: TransferRole
): Promise<TransferRecipientDto[]> => {
  const response = await apiClient.get<ApiResponseWrapper<TransferRecipientDto[]>>(
    "/transfers/recipients",
    { params: { role } }
  );
  return unwrap(response.data);
};

export const searchUsers = async (
  role: TransferRole,
  query: string
): Promise<TransferRecipientDto[]> => {
  const response = await apiClient.get<ApiResponseWrapper<TransferRecipientDto[]>>(
    "/transfers/search",
    { params: { role, query } }
  );
  return unwrap(response.data);
};

export const initiateBatchTransfer = async (
  request: InitiateBatchTransferRequest
): Promise<BatchTransferResponse> => {
  const response = await apiClient.post<ApiResponseWrapper<BatchTransferResponse>>(
    "/transfers/initiate",
    request
  );
  return unwrap(response.data);
};

export const initiateFarmerTransfer = async (
  request: InitiateBatchTransferRequest
): Promise<BatchTransferResponse> => {
  assertTransferRoleAllowed("FARMER", request.recipientRole);
  return initiateBatchTransfer(request);
};

export const initiateDistributorTransfer = async (
  request: InitiateBatchTransferRequest
): Promise<BatchTransferResponse> => {
  assertTransferRoleAllowed("DISTRIBUTOR", request.recipientRole);
  return initiateBatchTransfer(request);
};

export const acceptTransfer = async (
  transferId: string,
  inspectionNote?: string
): Promise<BatchTransferResponse> => {
  const response = await apiClient.post<ApiResponseWrapper<BatchTransferResponse>>(
    `/transfers/${transferId}/accept`,
    { inspectionNote }
  );
  return unwrap(response.data);
};

export const rejectTransfer = async (
  transferId: string,
  rejectionReason?: string
): Promise<BatchTransferResponse> => {
  const response = await apiClient.post<ApiResponseWrapper<BatchTransferResponse>>(
    `/transfers/${transferId}/reject`,
    { rejectionReason }
  );
  return unwrap(response.data);
};

export const cancelTransfer = async (
  transferId: string
): Promise<BatchTransferResponse> => {
  const response = await apiClient.delete<ApiResponseWrapper<BatchTransferResponse>>(
    `/transfers/${transferId}`
  );
  return unwrap(response.data);
};
