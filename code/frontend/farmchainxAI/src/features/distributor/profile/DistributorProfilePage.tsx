import { useState, useEffect } from "react";
import ProfilePageLayout from "../../../components/common/ProfilePage";
import type { ProfileSection } from "../../../components/common/ProfilePage";
import { useAuth } from "../../../hooks/useAuth";
import type { UserRole } from "../../../types/auth.types";
import {
  getDistributorProfile,
  updateDistributorProfile,
  changePassword,
  getDistributorKpis,
  getPendingBatches,
  getDistributorActivities,
} from "../api/distributorApi";
import type {
  KpiCard,
  DistributorActivityItem,
} from "../types/distributor.types";

type DistributorKpiApi = KpiCard & {
  title?: string;
  value?: string;
  subtitle?: string;
};

export default function DistributorProfilePage() {
  const { user: authUser } = useAuth();

  const [user, setUser] = useState({
    fullName: authUser?.fullName ?? "",
    email: authUser?.email ?? "",
    phone: authUser?.phone ?? "",
    role: authUser?.role ?? "DISTRIBUTOR",
    distributorId: authUser?.id ?? "",
    memberSince: "",
    avatarUrl: "",
  });

  const [biz, setBiz] = useState({
    companyName: "",
    companyId: "",
    warehouseLocation: "",
    gstNumber: "",
    licenseNumber: "",
    operationalArea: "",
    warehouseCapacity: "",
    establishedYear: "",
  });

  const [activities, setActivities] = useState<DistributorActivityItem[]>([]);
  const [stats, setStats] = useState({
    batchesReceived: "0",
    batchesTransferred: "0",
    pendingBatches: "0",
    qualityScore: "—",
  });

  useEffect(() => {
    // Fetch profile data
    getDistributorProfile()
      .then((data) => {
        if (data) {
          setUser((u) => ({
            ...u,
            fullName: data.fullName ?? u.fullName,
            email: data.email ?? u.email,
            phone: data.phone ?? u.phone,
            role: (data.role as UserRole) ?? u.role,
            distributorId: data.distributorId ?? u.distributorId,
            memberSince: data.memberSince ?? u.memberSince,
            avatarUrl: data.avatarUrl ?? u.avatarUrl,
          }));
          setBiz((b) => ({
            ...b,
            companyName: data.companyName ?? b.companyName,
            companyId: data.companyId ?? b.companyId,
            warehouseLocation: data.warehouseLocation ?? b.warehouseLocation,
            gstNumber: data.gstNumber ?? b.gstNumber,
            licenseNumber: data.licenseNumber ?? b.licenseNumber,
            operationalArea: data.operationalArea ?? b.operationalArea,
            warehouseCapacity: data.warehouseCapacity ?? b.warehouseCapacity,
            establishedYear: data.establishedYear ?? b.establishedYear,
          }));
        }
      })
      .catch(console.error);

    // Fetch KPIs
    getDistributorKpis()
      .then((data: DistributorKpiApi[]) => {
        // Extract stats from backend KPI titles
        const batchesReceivedCard = data.find(
          (k) => k.title === "Total Batches Received"
        );
        const batchesTransferredCard = data.find(
          (k) => k.title === "Batches Transferred"
        );
        const qualityCard = data.find((k) => k.title === "Quality Score");

        setStats((prev) => ({
          ...prev,
          batchesReceived: batchesReceivedCard?.value ?? "0",
          batchesTransferred: batchesTransferredCard?.value ?? "0",
          qualityScore: qualityCard?.value ?? "—",
        }));
      })
      .catch(console.error);

    // Fetch pending batches count
    getPendingBatches()
      .then((data) => {
        setStats((prev) => ({
          ...prev,
          pendingBatches: String(data.length),
        }));
      })
      .catch(console.error);

    // Fetch activities
    getDistributorActivities()
      .then((data: DistributorActivityItem[]) => {
        setActivities(data);
      })
      .catch(console.error);
  }, []);
  function buildSections(): ProfileSection[] {
    return [
      {
        icon: "👤",
        title: "Personal Information",
        subtitle: "Your contact and login details",
        fields: [
          {
            key: "fullName",
            label: "Full Name",
            value: user.fullName,
            editable: true,
          },
          {
            key: "email",
            label: "Email Address",
            value: user.email,
            editable: true,
            type: "email",
          },
          {
            key: "phone",
            label: "Phone Number",
            value: user.phone,
            editable: true,
            type: "tel",
          },
          { key: "role", label: "Role", value: user.role, editable: false },
          {
            key: "memberId",
            label: "Distributor ID",
            value: user.distributorId,
            editable: false,
            mono: true,
          },
          {
            key: "since",
            label: "Member Since",
            value: user.memberSince,
            editable: false,
          },
        ],
      },
      {
        icon: "🏭",
        title: "Business Information",
        subtitle: "Distributor company and warehouse details",
        fields: [
          {
            key: "companyName",
            label: "Company Name",
            value: biz.companyName,
            editable: true,
          },
          {
            key: "companyId",
            label: "Company ID",
            value: biz.companyId,
            editable: false,
            mono: true,
          },
          {
            key: "warehouseLoc",
            label: "Warehouse Location",
            value: biz.warehouseLocation,
            editable: true,
          },
          {
            key: "gstNumber",
            label: "GST Number",
            value: biz.gstNumber,
            editable: false,
            mono: true,
          },
          {
            key: "licenseNumber",
            label: "License Number",
            value: biz.licenseNumber,
            editable: false,
            mono: true,
          },
          {
            key: "operationalArea",
            label: "Operational Area",
            value: biz.operationalArea,
            editable: true,
          },
          {
            key: "capacity",
            label: "Warehouse Capacity",
            value: biz.warehouseCapacity,
            editable: false,
          },
          {
            key: "established",
            label: "Established",
            value: biz.establishedYear ?? "—",
            editable: false,
          },
        ],
      },
    ];
  }

  const sections = buildSections();

  const handleSave = async (draft: ProfileSection[]) => {
    const personal = draft[0].fields;
    const bizFields = draft[1].fields;
    const payload = {
      fullName:
        personal.find((f) => f.key === "fullName")?.value ?? user.fullName,
      phone: personal.find((f) => f.key === "phone")?.value ?? user.phone,
      companyName:
        bizFields.find((f) => f.key === "companyName")?.value ??
        biz.companyName,
      warehouseLocation:
        bizFields.find((f) => f.key === "warehouseLoc")?.value ??
        biz.warehouseLocation,
      operationalArea:
        bizFields.find((f) => f.key === "operationalArea")?.value ??
        biz.operationalArea,
    };

    const updated = await updateDistributorProfile(payload);

    setUser((u) => ({
      ...u,
      fullName: updated.fullName ?? u.fullName,
      email: updated.email ?? u.email,
      phone: updated.phone ?? u.phone,
      role: (updated.role as UserRole) ?? u.role,
      distributorId: updated.distributorId ?? u.distributorId,
      memberSince: updated.memberSince ?? u.memberSince,
      avatarUrl: updated.avatarUrl ?? u.avatarUrl,
    }));
    setBiz((b) => ({
      ...b,
      companyName: updated.companyName ?? b.companyName,
      companyId: updated.companyId ?? b.companyId,
      warehouseLocation: updated.warehouseLocation ?? b.warehouseLocation,
      gstNumber: updated.gstNumber ?? b.gstNumber,
      licenseNumber: updated.licenseNumber ?? b.licenseNumber,
      operationalArea: updated.operationalArea ?? b.operationalArea,
      warehouseCapacity: updated.warehouseCapacity ?? b.warehouseCapacity,
      establishedYear: updated.establishedYear ?? b.establishedYear,
    }));
  };

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    await changePassword({ currentPassword, newPassword });
  };

  return (
    <ProfilePageLayout
      user={{
        fullName: user.fullName,
        role: user.role,
        roleId: user.distributorId,
        memberSince: user.memberSince,
        avatarUrl: user.avatarUrl,
        bizName: biz.companyName,
      }}
      sections={sections}
      stats={[
        {
          label: "Batches Received",
          value: stats.batchesReceived,
          color: "#2563EB",
        },
        {
          label: "Batches Transferred",
          value: stats.batchesTransferred,
          color: "#7C3AED",
        },
        {
          label: "Pending Batches",
          value: stats.pendingBatches,
          color: "#F59E0B",
        },
        { label: "Quality Score", value: stats.qualityScore, color: "#16A34A" },
        {
          label: "Activity Records",
          value: String(activities.length),
          color: "#0891B2",
        },
        { label: "Status", value: "Active", color: "#16A34A" },
      ]}
      dashboardPath="/distributor/dashboard"
      profilePath="/distributor/profile"
      accentCss="--accent: #2563eb; --accent-bg: #eff6ff;"
      onSave={handleSave}
      onChangePassword={handleChangePassword}
    />
  );
}
