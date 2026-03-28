export type DistributorBatchStatus =
  | "Incoming"
  | "Accepted"
  | "In Transit"
  | "Transferred"
  | "Rejected";

export interface DistributorBatch {
  id: string;
  cropType: string;
  variety?: string;
  quantity: string;
  qualityScore: number;
  status: DistributorBatchStatus;
  farmerName: string;
  farmerId: string;
  farmLocation: string;
  receivedAt: string;
  transferredTo?: string;
  transferredAt?: string;
  recipientType?: "Retailer" | "Consumer";
  shelfLifeDays: number;
  shelfLifePercent: number;
  basePrice?: number;
  marketPrice?: number;
  qualityGrade?: string;
  organic?: boolean;
  inspectionNote?: string;
}

export interface DistributorNotification {
  id: string;
  type: "incoming_batch" | "transfer_confirmed" | "quality_alert" | "system";
  title: string;
  message: string;
  batchId?: string;
  from?: string;
  timestamp: string;
  read: boolean;
  icon: string;
}

export interface DistributorAnalyticsPoint {
  month: string;
  received: number;
  transferred: number;
  rejected: number;
}

export interface RetailRecipient {
  id: string;
  name: string;
  type: "Retailer" | "Consumer";
  city: string;
  state: string;
  phone: string;
  rating: number;
  batchesReceived: number;
  specialty: string;
  verified: boolean;
}

export interface DistributorUserProfile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  memberSince: string;
  distributorId: string;
  avatarUrl?: string;
}

export interface DistributorBusinessProfile {
  companyName: string;
  licenseNumber: string;
  location: string;
  coverageArea: string;
  storageCapacity: string;
  vehicleFleet: string;
  specialization: string;
}

export interface DistributorActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  badge: string;
  badgeColor: string;
}

export interface FarmerBatchListing {
  id: string;
  cropType: string;
  variety?: string;
  quantity: string;
  qualityScore: number;
  qualityGrade: string;
  pricePerKg: number;
  availableUntil: string;
  organic: boolean;
}

export interface FarmerListing {
  id: string;
  name: string;
  farmName: string;
  location: string;
  state: string;
  phone: string;
  email: string;
  specialization: string;
  rating: number;
  totalBatchesSent: number;
  activeBatches: number;
  organic: boolean;
  joinedDate: string;
  availableBatches: FarmerBatchListing[];
}
