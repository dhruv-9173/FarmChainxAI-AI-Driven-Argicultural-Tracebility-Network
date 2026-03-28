import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { UserProfile, FarmProfile } from "../types/dashboard.types";
import {
  getFarmerProfile,
  updateFarmerProfile,
  updateFarmDetails,
} from "../features/farmer/api/farmerApi";
import { useAuth } from "../hooks/useAuth";

interface ProfileContextValue {
  userProfile: UserProfile;
  farmProfile: FarmProfile;
  updateUserProfile: (patch: Partial<UserProfile>) => Promise<void>;
  updateFarmProfile: (patch: Partial<FarmProfile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: user?.fullName || "Farmer",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "Farmer",
    memberSince: "",
    farmerId: "",
    avatarUrl: "",
  });

  const [farmProfile, setFarmProfile] = useState<FarmProfile>({
    farmName: "My Farm",
    farmId: "",
    location: "",
    farmSize: "",
    primaryCrops: "",
    soilType: "",
    irrigationMethod: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      if (user.role !== "FARMER") return;
      try {
        const data = await getFarmerProfile();

        setUserProfile((prev) => ({
          ...prev,
          fullName: data.fullName || prev.fullName,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
          role: data.role || prev.role,
          memberSince: data.memberSince || prev.memberSince,
          farmerId: data.userId ? `USR-${data.userId}` : prev.farmerId,
          avatarUrl:
            data.profileImageUrl || data.profileImageBase64 || prev.avatarUrl,
        }));

        setFarmProfile((prev) => ({
          ...prev,
          farmName: data.farmName || prev.farmName,
          farmId: data.farmId || prev.farmId,
          location: data.location || prev.location,
          farmSize: data.farmSize ? `${data.farmSize} Acres` : prev.farmSize,
          primaryCrops: data.primaryCrops || prev.primaryCrops,
          soilType: data.soilType || prev.soilType,
          irrigationMethod: data.irrigationType || prev.irrigationMethod,
        }));
      } catch (err) {
        console.error("Failed to fetch farmer profile:", err);
      }
    };
    fetchProfile();
  }, [user]);

  const updateUserProfile = async (patch: Partial<UserProfile>) => {
    // Attempt backend update if specific fields are changed
    if (patch.fullName || patch.phone || patch.avatarUrl) {
      const payload: Record<string, unknown> = {};
      if (patch.fullName) payload.fullName = patch.fullName;
      if (patch.phone) payload.phone = patch.phone;
      if (patch.avatarUrl) {
        if (patch.avatarUrl.startsWith("data:")) {
          payload.profileImageBase64 = patch.avatarUrl;
        } else {
          payload.profileImageUrl = patch.avatarUrl;
        }
      }

      try {
        await updateFarmerProfile(payload);
      } catch (err) {
        console.error("Failed to update user profile on backend:", err);
        throw err;
      }
    }
    // Update local state if backend update succeeds
    setUserProfile((prev) => ({ ...prev, ...patch }));
  };

  const updateFarmProfile = async (patch: Partial<FarmProfile>) => {
    // Map Context fields to Backend DTO fields
    const payload: Record<string, unknown> = {};
    if (patch.farmName) payload.farmName = patch.farmName;
    if (patch.location) payload.farmLocation = patch.location;
    if (patch.farmSize) {
      // Backend expects a number for farmSize (BigDecimal).
      // User inputs "12 Acres" or "12.5"
      const numericStr = patch.farmSize.replace(/[^0-9.]/g, "");
      payload.farmSize = parseFloat(numericStr) || 0;
    }
    if (patch.primaryCrops) payload.primaryCrops = patch.primaryCrops;
    if (patch.soilType) payload.soilType = patch.soilType;
    if (patch.irrigationMethod) payload.irrigationType = patch.irrigationMethod;

    if (Object.keys(payload).length > 0) {
      try {
        await updateFarmDetails(payload);
      } catch (err) {
        console.error("Failed to update farm profile on backend:", err);
        throw err;
      }
    }
    // Update local state
    setFarmProfile((prev) => ({ ...prev, ...patch }));
  };

  return (
    <ProfileContext.Provider
      value={{ userProfile, farmProfile, updateUserProfile, updateFarmProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
}
