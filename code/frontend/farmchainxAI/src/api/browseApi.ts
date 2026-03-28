/**
 * browseApi.ts
 *
 * API calls for browsing user profiles across all roles.
 * Provides methods to fetch all browsable users, search for specific users,
 * and retrieve detailed user profiles with batch information.
 */

import apiClient from "./apiClient";

/**
 * User browse data structure matching backend UserBrowseDto
 */
export interface UserProfile {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  role: "FARMER" | "DISTRIBUTOR" | "RETAILER";
  profileImageUrl?: string;

  // Farmer-specific
  farmId?: string;
  farmName?: string;
  location?: string;
  farmSize?: number;
  primaryCrops?: string;
  soilType?: string;
  farmVerified?: boolean;

  // Distributor-specific
  businessName?: string;
  businessRegistration?: string;

  // Shared stats
  rating?: number;
  totalBatches?: number;
  activeBatches?: number;
  completedBatches?: number;

  // Batch list
  batches?: BatchSummary[];

  // Metadata
  createdAt?: string;
  verificationStatus?: string;
}

export interface BatchSummary {
  batchId: number;
  batchCode: string;
  cropType: string;
  cropVariety?: string;
  quantity: number;
  quantityUnit: string;
  batchStatus: string;
  harvestDate?: string;
  quality?: string;
  qualityScore?: number;
  organic?: boolean;
  gapCertified?: boolean;
  rating?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

/**
 * Get all users that the current user can browse.
 * Access control is handled by the backend based on user role.
 */
export async function getAllBrowsableUsers(): Promise<UserProfile[]> {
  try {
    const response = await apiClient.get<ApiResponse<UserProfile[]>>(
      "/browse/users"
    );
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch browsable users:", error);
    throw error;
  }
}

/**
 * Get a specific user's profile by their ID.
 * Includes full details about their farm/business and batches.
 */
export async function getUserProfile(userId: number): Promise<UserProfile> {
  try {
    const response = await apiClient.get<ApiResponse<UserProfile>>(
      `/browse/users/${userId}`
    );
    if (!response.data?.data) {
      throw new Error("User profile not found");
    }
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch user profile for ID ${userId}:`, error);
    throw error;
  }
}

/**
 * Search for users by name or email.
 * Only returns users that the current user has access to browse.
 */
export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  try {
    const response = await apiClient.get<ApiResponse<UserProfile[]>>(
      "/browse/search",
      {
        params: { q: searchTerm },
      }
    );
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to search users:", error);
    throw error;
  }
}

/**
 * Get users by role type.
 * Filters the browsable users list by a specific role.
 */
export async function getUsersByRole(
  role: "FARMER" | "DISTRIBUTOR" | "RETAILER"
): Promise<UserProfile[]> {
  try {
    const allUsers = await getAllBrowsableUsers();
    return allUsers.filter((user) => user.role === role);
  } catch (error) {
    console.error(`Failed to fetch ${role}s:`, error);
    throw error;
  }
}
