export type BatchStatus =
  | "PENDING"
  | "ACTIVE"
  | "TRANSFERRED"
  | "RECEIVED"
  | "SOLD"
  | "REJECTED"
  | "EXPIRED"
  // legacy values kept for compatibility with older mock/demo data
  | "Active"
  | "Transferred"
  | "Pending"
  | "Flagged";

export interface Batch {
  id: string;
  cropType: string;
  variety?: string;
  quantity: string;
  qualityScore: number;
  status: BatchStatus;
  farmerName: string;
  createdAt: string;
  shelfLifeDays: number;
  shelfLifePercent: number;
  location?: string;
  basePrice?: number;
  marketPrice?: number;
  organic?: boolean;
  gapCertified?: boolean;

  qrDataUrl?: string;
  cropImagePreview?: string;
  farmId?: string;
  farmCity?: string;
  farmState?: string;
  storageType?: string;
  certifications?: string[];
}

export interface KPICard {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  badge: string;
  badgeColor: string;
}

export interface QualityTrendPoint {
  month: string;
  wheat: number;
  rice: number;
}

export interface ShelfLifeItem {
  crop: string;
  batchId: string;
  daysLeft: number;
  percent: number;
  status: "Healthy" | "Moderate" | "Critical" | "Warning";
}

export interface SupplyChainEvent {
  title: string;
  timestamp: string;
  completed: boolean;
}

export type RecipientType = "Distributor" | "Retailer" | "Consumer";

export interface Recipient {
  id: string;
  name: string;
  type: RecipientType;
  city: string;
  state: string;
  phone: string;
  rating: number;
  batchesReceived: number;
  specialty: string;
  verified: boolean;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  memberSince: string;
  farmerId: string;
  avatarUrl?: string;
}

export interface FarmProfile {
  farmName: string;
  farmId: string;
  location: string;
  farmSize: string;
  primaryCrops: string;
  soilType: string;
  irrigationMethod: string;
}

/* ── Create Batch Form ── */

export interface CreateBatchFormData {
  /* Step 1 — Crop Details */
  cropType: string;
  cropVariety: string;
  quantity: number | "";
  quantityUnit: "kg" | "ton" | "quintal";
  harvestDate: string;
  sowingDate: string;
  qualityGrade: string;
  certifications: string[];
  notes: string;

  /* Step 2 — Farm Info */
  farmerName: string;
  farmId: string;
  farmCity: string;
  farmState: string;
  fieldArea: number | "";
  soilType: string;
  irrigationType: string;

  /* Step 3 — Storage & Quality */
  storageType: string;
  storageLocation: string;
  expectedShelfLife: number | "";
  moistureLevel: number | "";
  initialQualityScore: number | "";
  cropImage: File | null;
  cropImagePreview: string;
}

export const CROP_TYPES = [
  "Wheat",
  "Rice",
  "Maize",
  "Soybean",
  "Cotton",
  "Tomato",
  "Sugarcane",
] as const;

export const QUALITY_GRADES = ["A", "A1", "B", "C", "Premium"] as const;

export const CERTIFICATIONS = [
  "Organic",
  "GAP-Certified",
  "ISO 22000",
  "FSSAI Certified",
] as const;

export const SOIL_TYPES = [
  "Black soil",
  "Alluvial soil",
  "Red soil",
  "Sandy soil",
] as const;

export const IRRIGATION_TYPES = [
  "Drip irrigation",
  "Canal irrigation",
  "Rain-fed",
  "Tube well",
] as const;

export const STORAGE_TYPES = [
  "Warehouse",
  "Cold Storage",
  "Farm Storage",
  "Silo",
] as const;
