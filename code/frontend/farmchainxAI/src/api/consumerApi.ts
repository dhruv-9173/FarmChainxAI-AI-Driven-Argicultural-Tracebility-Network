import apiClient from "./apiClient";

/**
 * Consumer API integration
 * Handles consumer operations: product viewing, reviews, traceability
 */

// --- PROFILE ENDPOINTS ---

export const getConsumerProfile = async (token: string) => {
  try {
    const response = await apiClient.get("/consumer/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching consumer profile:", error);
    throw error;
  }
};

export const updateConsumerProfile = async (
  token: string,
  profile: Record<string, any>
) => {
  try {
    const response = await apiClient.patch("/consumer/profile", profile, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error updating consumer profile:", error);
    throw error;
  }
};

// --- PRODUCT ENDPOINTS ---

export const getConsumerProducts = async (token: string) => {
  try {
    const response = await apiClient.get("/consumer/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const receiveProduct = async (
  token: string,
  batchId: string,
  quantity: number
) => {
  try {
    const response = await apiClient.post(
      `/consumer/products/${batchId}/receive`,
      { quantity },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error receiving product:", error);
    throw error;
  }
};

export const markProductAsConsumed = async (token: string, batchId: string) => {
  try {
    const response = await apiClient.post(
      `/consumer/products/${batchId}/consume`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error marking product as consumed:", error);
    throw error;
  }
};

// --- REVIEW ENDPOINTS ---

export const leaveReview = async (
  token: string,
  batchId: string,
  review: {
    rating: number;
    comment?: string;
  }
) => {
  try {
    const response = await apiClient.post(
      `/consumer/products/${batchId}/review`,
      review,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error leaving review:", error);
    throw error;
  }
};

export const getMyReviews = async (token: string) => {
  try {
    const response = await apiClient.get("/consumer/reviews", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching my reviews:", error);
    throw error;
  }
};

export const getBatchReviews = async (token: string, batchId: string) => {
  try {
    const response = await apiClient.get(
      `/consumer/products/${batchId}/reviews`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching batch reviews:", error);
    throw error;
  }
};

// --- TRACEABILITY ENDPOINTS ---

export const getProductJourney = async (token: string, batchId: string) => {
  try {
    const response = await apiClient.get(
      `/consumer/products/${batchId}/journey`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching product journey:", error);
    throw error;
  }
};

export const verifyProductAuthenticity = async (
  token: string,
  batchId: string
) => {
  try {
    const response = await apiClient.get(
      `/consumer/products/${batchId}/verify`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error verifying product:", error);
    throw error;
  }
};
