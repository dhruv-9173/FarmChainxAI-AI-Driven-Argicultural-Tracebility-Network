import apiClient from "./apiClient";

/**
 * Quality Check API integration
 * Handles quality inspection workflow for distributors and retailers
 */

// --- INITIATE QUALITY CHECK ---

export const initiateQualityCheck = async (
  token: string,
  batchId: string,
  request: {
    inspectorId?: string;
    notes?: string;
  }
) => {
  try {
    const response = await apiClient.post(
      `/quality-checks/batches/${batchId}/initiate`,
      request,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error initiating quality check:", error);
    throw error;
  }
};

// --- APPROVE QUALITY CHECK ---

export const approveQualityCheck = async (
  token: string,
  batchId: string,
  request: {
    colorQuality?: number;
    textureQuality?: number;
    smellQuality?: number;
    pestInfestation?: boolean;
    moldPresence?: boolean;
    foreignMatter?: boolean;
    notes?: string;
  }
) => {
  try {
    const response = await apiClient.post(
      `/quality-checks/batches/${batchId}/approve`,
      request,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error approving quality check:", error);
    throw error;
  }
};

// --- REJECT QUALITY CHECK ---

export const rejectQualityCheck = async (
  token: string,
  batchId: string,
  request: {
    rejectionReason: string;
    notes?: string;
  }
) => {
  try {
    const response = await apiClient.post(
      `/quality-checks/batches/${batchId}/reject`,
      request,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error rejecting quality check:", error);
    throw error;
  }
};

// --- GET PENDING QC ITEMS ---

export const getPendingQCItems = async (token: string) => {
  try {
    const response = await apiClient.get("/quality-checks/pending", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching pending QC items:", error);
    throw error;
  }
};

// --- GET QC HISTORY ---

export const getQCHistory = async (token: string, batchId: string) => {
  try {
    const response = await apiClient.get(
      `/quality-checks/batches/${batchId}/history`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching QC history:", error);
    throw error;
  }
};
