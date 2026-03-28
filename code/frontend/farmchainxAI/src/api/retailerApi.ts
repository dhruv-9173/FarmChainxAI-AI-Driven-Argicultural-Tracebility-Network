import apiClient from "./apiClient";

/**
 * Retailer API integration
 * Handles all retailer-related operations: inventory, sales, QC
 */

// --- PROFILE ENDPOINTS ---

export const getRetailerProfile = async (token: string) => {
  try {
    const response = await apiClient.get("/retailer/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching retailer profile:", error);
    throw error;
  }
};

export const updateRetailerProfile = async (
  token: string,
  profile: {
    fullName?: string;
    phone?: string;
  }
) => {
  try {
    const response = await apiClient.patch("/retailer/profile", profile, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error updating retailer profile:", error);
    throw error;
  }
};

// --- INVENTORY ENDPOINTS ---

export const getRetailerInventory = async (token: string) => {
  try {
    const response = await apiClient.get("/retailer/inventory", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }
};

export const getInventorySummary = async (token: string) => {
  try {
    const response = await apiClient.get("/retailer/inventory/summary", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    throw error;
  }
};

export const getReceivedBatches = async (token: string) => {
  try {
    const response = await apiClient.get("/retailer/batches/received", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching received batches:", error);
    throw error;
  }
};

// --- SALES ENDPOINTS ---

export const markBatchAsSold = async (
  token: string,
  batchId: string,
  request: {
    quantitySold: number;
    sellingPrice?: number;
  }
) => {
  try {
    const response = await apiClient.post(
      `/retailer/batches/${batchId}/mark-sold`,
      request,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error marking batch as sold:", error);
    throw error;
  }
};

export const getSalesAnalytics = async (token: string) => {
  try {
    const response = await apiClient.get("/retailer/analytics/sales", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    throw error;
  }
};

// --- QUALITY ALERTS ENDPOINTS ---

export const getQualityAlerts = async (token: string) => {
  try {
    const response = await apiClient.get("/retailer/batches/quality-alerts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching quality alerts:", error);
    throw error;
  }
};

export const getExpiringBatches = async (token: string) => {
  try {
    const response = await apiClient.get("/retailer/batches/expiring", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching expiring batches:", error);
    throw error;
  }
};

// --- BATCH OPERATIONS ---

export const acceptBatch = async (
  token: string,
  batchId: string,
  notes: string
) => {
  try {
    const response = await apiClient.post(
      `/retailer/batches/${batchId}/accept`,
      { notes },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error accepting batch:", error);
    throw error;
  }
};

export const rejectBatch = async (
  token: string,
  batchId: string,
  rejectionReason: string
) => {
  try {
    const response = await apiClient.post(
      `/retailer/batches/${batchId}/reject`,
      { rejectionReason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error rejecting batch:", error);
    throw error;
  }
};
