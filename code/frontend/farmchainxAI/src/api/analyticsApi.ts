import apiClient from "./apiClient";

/**
 * Analytics API integration
 * Handles system analytics, reporting, and metrics
 */

// --- DASHBOARD SUMMARY ---

export const getDashboardSummary = async (token: string) => {
  try {
    const response = await apiClient.get("/analytics/dashboard-summary", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error;
  }
};

// --- CROP ANALYTICS ---

export const getCropAnalytics = async (token: string) => {
  try {
    const response = await apiClient.get("/analytics/crops", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching crop analytics:", error);
    throw error;
  }
};

// --- QUALITY TRENDS ---

export const getQualityTrends = async (token: string) => {
  try {
    const response = await apiClient.get("/analytics/quality-trends", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching quality trends:", error);
    throw error;
  }
};

// --- MONTHLY ANALYTICS ---

export const getMonthlyAnalytics = async (token: string) => {
  try {
    const response = await apiClient.get("/analytics/monthly", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching monthly analytics:", error);
    throw error;
  }
};

// --- SUPPLY CHAIN HEALTH ---

export const getSupplyChainHealth = async (token: string) => {
  try {
    const response = await apiClient.get("/analytics/supply-chain", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching supply chain health:", error);
    throw error;
  }
};

// --- SYSTEM HEALTH ---

export const getSystemHealth = async (token: string) => {
  try {
    const response = await apiClient.get("/analytics/system-health", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching system health:", error);
    throw error;
  }
};

// --- USER DISTRIBUTION ---

export const getUserDistribution = async (token: string) => {
  try {
    const response = await apiClient.get("/analytics/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching user distribution:", error);
    throw error;
  }
};

// --- BATCH STATUS BREAKDOWN ---

export const getBatchStatusBreakdown = async (token: string) => {
  try {
    const response = await apiClient.get("/analytics/batches", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching batch status breakdown:", error);
    throw error;
  }
};
