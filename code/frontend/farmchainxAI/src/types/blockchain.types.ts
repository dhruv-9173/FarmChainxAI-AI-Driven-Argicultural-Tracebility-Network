/**
 * blockchain.types.ts
 * Types for blockchain-based supply chain tracking
 */

export type SupplyChainStage =
  | "CREATED"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "QUALITY_CHECK"
  | "STORED"
  | "SOLD"
  | "REJECTED"
  | "EXPIRED";

export interface SupplyChainEventBlockchain {
  id: string;
  batchId: string;
  stage: SupplyChainStage;
  timestamp: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  eventHash: string; // SHA-256 hash - immutable
  previousEventHash?: string; // Creates chain
  actorSignature: string; // Digital signature
  isVerified: boolean;
  actorId: number;
  actorName?: string;
  actorRole: string;
  temperatureC?: number;
  humidityPercent?: number;
  qualityScore?: number;
  unitPrice?: number;
  notes?: string;
  eventType?: string;
  deviceId?: string;
}

export interface HashChainLink {
  stage: string;
  timestamp: string;
  hash: string;
  previousHash: string;
  actorId: string;
  actorRole: string;
  location: string;
}

export interface SupplyChainVerification {
  status: "success" | "error";
  batchId: string;
  isValid: boolean;
  eventCount: number;
  events: SupplyChainEventBlockchain[];
  merkleRoot?: string;
  message: string;
}

export interface SupplyChainTimeline {
  batchId: string;
  totalEvents: number;
  firstEventTime: string;
  lastEventTime: string;
  currentStage: SupplyChainStage;
}

export interface BatchSupplyChainStatus {
  batchId: string;
  completionPercentage: string;
  status: "IN_PROGRESS" | "COMPLETE";
}

export interface SupplyChainAnalytics {
  batchId: string;
  timeInStages: Record<string, number>; // stage -> hours
  unit: "hours";
  totalHandlers: number;
  chainVerified: boolean;
}

export interface PublicTrackingData {
  status: "success" | "error";
  batchId: string;
  verified: boolean;
  journey: {
    stage: string;
    timestamp: string;
    location: string;
    actorRole: string;
    qualityScore: number;
    unitPrice?: number;
  }[];
}
