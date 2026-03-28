/**
 * transfer.types.ts
 *
 * Types for batch transfer operations across the FarmChainX platform.
 * ✅ UPDATED: New unified 12-state BatchStatus with auto-accept model
 */

export type RecipientRole =
  | "DISTRIBUTOR"
  | "RETAILER"
  | "CONSUMER"
  | "FARMER"
  | "ADMIN";

export type TransferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

/**
 * ✅ Unified batch status with auto-accept flow (no PENDING/IN_TRANSIT states)
 *
 * Flow:
 * CREATED → HARVESTED → RECEIVED_BY_DIST → QUALITY_PASSED → RECEIVED_BY_RETAIL → AVAILABLE → DELIVERED → CONSUMED/EXPIRED/DISCARDED
 *
 * Key improvements:
 * - No manual acceptance delays (auto-accept when transfer accepted)
 * - Clear ownership transition at each step
 * - Terminal states for lifecycle completion
 */
export type BatchStatus =
  // Farmer stage
  | "CREATED" // Batch created but not harvested
  | "HARVESTED" // Ready for transfer to distributor (no PENDING state)
  | "REJECTED_BY_FARMER" // Farmer rejected during quality check

  // Distributor stage (auto-received on transfer acceptance)
  | "RECEIVED_BY_DIST" // Auto-received when distributor accepts transfer (no IN_TRANSIT)
  | "QUALITY_PASSED" // Distributor quality check passed
  | "REJECTED_BY_DIST" // Distributor rejected batch

  // Retailer stage (auto-received on transfer acceptance)
  | "RECEIVED_BY_RETAIL" // Auto-received when retailer accepts transfer (no IN_TRANSIT)
  | "AVAILABLE" // Available for sale
  | "LOW_STOCK" // Low stock warning
  | "REJECTED_BY_RETAIL" // Retailer rejected batch

  // Consumer/End stage (auto-delivered)
  | "DELIVERED" // Auto-delivered to consumer on sale (no IN_TRANSIT)

  // Terminal states
  | "CONSUMED" // Consumer received and consumed
  | "EXPIRED" // Exceeded shelf life
  | "DISCARDED"; // Discarded/damaged

export interface Recipient {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: RecipientRole;
  transferCount: number;
  lastTransferDate: string;
}

export interface InitiateTransferPayload {
  batchId: string;
  recipientId: number;
  recipientRole: RecipientRole;
  note?: string;
}

export interface TransferResponse {
  transferId: string;
  batchId: string;
  recipientId: number;
  status: TransferStatus;
  createdAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

/**
 * ✅ NEW: Ownership tracking for batch audit trail
 * Tracks all ownership changes as batch moves through supply chain
 */
export interface OwnershipRecord {
  userId: number;
  role: RecipientRole;
  acquiredAt: string;
  transferredAt?: string;
}

/**
 * Batch status helper utilities for frontend
 */
export const BatchStatusLabels: Record<BatchStatus, string> = {
  CREATED: "Created",
  HARVESTED: "Harvested",
  REJECTED_BY_FARMER: "Rejected by Farmer",
  RECEIVED_BY_DIST: "Received by Distributor",
  QUALITY_PASSED: "Quality Checked",
  REJECTED_BY_DIST: "Rejected by Distributor",
  RECEIVED_BY_RETAIL: "Received by Retailer",
  AVAILABLE: "Available for Sale",
  LOW_STOCK: "Low Stock",
  REJECTED_BY_RETAIL: "Rejected by Retailer",
  DELIVERED: "Delivered",
  CONSUMED: "Consumed",
  EXPIRED: "Expired",
  DISCARDED: "Discarded",
};

export const BatchStatusColors: Record<BatchStatus, string> = {
  CREATED: "#FFA500", // Orange
  HARVESTED: "#FFA500", // Orange
  REJECTED_BY_FARMER: "#F44336", // Red
  RECEIVED_BY_DIST: "#4CAF50", // Green
  QUALITY_PASSED: "#2196F3", // Blue
  REJECTED_BY_DIST: "#F44336", // Red
  RECEIVED_BY_RETAIL: "#4CAF50", // Green
  AVAILABLE: "#2196F3", // Blue
  LOW_STOCK: "#FF9800", // Amber
  REJECTED_BY_RETAIL: "#F44336", // Red
  DELIVERED: "#4CAF50", // Green
  CONSUMED: "#8BC34A", // Light Green
  EXPIRED: "#F44336", // Red
  DISCARDED: "#F44336", // Red
};

export interface AcceptTransferPayload {
  inspectionNote?: string;
}

export interface RejectTransferPayload {
  rejectionReason?: string;
}

export interface TransferableBatch {
  id: string;
  cropType: string;
  variety?: string;
  quantity: number;
  quantityUnit: "kg" | "ton" | "quintal";
  qualityScore: number;
  qualityGrade?: string;
  status: BatchStatus;
  farmCity?: string;
  farmState?: string;
  storageType?: string;
  storageLocation?: string;
  expectedShelfLifeDays: number;
  currentShelfLifeDays: number;
  moistureLevel?: number;
  organic: boolean;
  gapCertified: boolean;
  certifications?: string;
  sowingDate?: string;
  harvestDate?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  basePrice?: number;
  marketPrice?: number;
}
