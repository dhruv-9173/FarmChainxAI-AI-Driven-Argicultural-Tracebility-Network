/**
 * blockchainApi.ts
 * API service for blockchain-based supply chain tracking
 */

import apiClient from "./apiClient";
import type {
  SupplyChainEventBlockchain,
  SupplyChainVerification,
  HashChainLink,
  SupplyChainTimeline,
  BatchSupplyChainStatus,
  PublicTrackingData,
} from "../types/blockchain.types";

const API_BASE = "/supply-chain";

export const blockchainApi = {
  /**
   * Log a new supply chain event
   * Creates immutable record with blockchain hashing
   */
  logSupplyChainEvent: async (event: any) => {
    const response = await apiClient.post(`${API_BASE}/event`, event);
    return response.data;
  },

  /**
   * Get verified supply chain history
   * Verifies hash chain integrity
   */
  getVerifiedSupplyChain: async (
    batchId: string
  ): Promise<SupplyChainVerification> => {
    const response = await apiClient.get(
      `${API_BASE}/batch/${batchId}/verified`
    );
    return response.data;
  },

  /**
   * Get complete supply chain history
   * Returns all events with verification
   */
  getSupplyChainHistory: async (
    batchId: string
  ): Promise<SupplyChainEventBlockchain[]> => {
    const response = await apiClient.get(
      `${API_BASE}/batch/${batchId}/history`
    );
    return response.data.events;
  },

  /**
   * Get hash chain only (lightweight)
   * Quick verification without full event data
   */
  getHashChain: async (batchId: string): Promise<HashChainLink[]> => {
    const response = await apiClient.get(
      `${API_BASE}/batch/${batchId}/hash-chain`
    );
    return response.data.hashChain;
  },

  /**
   * Get supply chain timeline
   * Summary of batch journey
   */
  getTimeline: async (batchId: string): Promise<SupplyChainTimeline> => {
    const response = await apiClient.get(
      `${API_BASE}/batch/${batchId}/timeline`
    );
    return response.data.timeline;
  },

  /**
   * Get events by stage
   * Filter events at specific supply chain stage
   */
  getEventsByStage: async (
    batchId: string,
    stage: string
  ): Promise<SupplyChainEventBlockchain[]> => {
    const response = await apiClient.get(
      `${API_BASE}/batch/${batchId}/stage/${stage}`
    );
    return response.data.events;
  },

  /**
   * Get events by actor
   * All events handled by specific user
   */
  getEventsByActor: async (
    actorId: number
  ): Promise<SupplyChainEventBlockchain[]> => {
    const response = await apiClient.get(`${API_BASE}/actor/${actorId}/events`);
    return response.data.events;
  },

  /**
   * Verify specific event authenticity
   * Checks signature validity
   */
  verifyEvent: async (
    eventId: string
  ): Promise<{ isValid: boolean; message: string }> => {
    const response = await apiClient.get(`${API_BASE}/event/${eventId}/verify`);
    return response.data;
  },

  /**
   * Get supply chain completion percentage
   * Progress of batch through supply chain
   */
  getCompletion: async (batchId: string): Promise<BatchSupplyChainStatus> => {
    const response = await apiClient.get(
      `${API_BASE}/batch/${batchId}/completion`
    );
    return response.data;
  },

  /**
   * Get time spent in each stage
   * Analytics on duration per stage
   */
  getTimeAnalysis: async (batchId: string) => {
    const response = await apiClient.get(
      `${API_BASE}/batch/${batchId}/time-analysis`
    );
    return response.data;
  },

  /**
   * Public tracking endpoint (no auth required)
   * Accessible via QR code for consumers
   */
  publicTrack: async (batchId: string): Promise<PublicTrackingData> => {
    const response = await apiClient.get(`${API_BASE}/public/track/${batchId}`);
    return response.data;
  },
};
