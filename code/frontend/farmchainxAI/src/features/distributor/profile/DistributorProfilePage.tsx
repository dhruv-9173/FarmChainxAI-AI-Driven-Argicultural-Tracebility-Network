import { useState, useEffect } from "react";
import ProfilePageLayout from "../../../components/common/ProfilePage";
import type { ProfileSection } from "../../../components/common/ProfilePage";
import { useAuth } from "../../../hooks/useAuth";
import {
  getDistributorProfile,
  getDistributorKpis,
  getReceivedBatches,
  getPendingBatches,
  getDistributorActivities,
} from "../api/distributorApi";
import type {
  KpiCard,
  DistributorActivityItem,
} from "../types/distributor.types";

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

  const [kpis, setKpis] = useState<KpiCard[]>([]);
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
      .then((data: typeof user & { biz?: typeof biz }) => {
        if (data) {
          setUser((u) => ({ ...u, ...data }));
          if (data.biz) setBiz((b) => ({ ...b, ...data.biz }));
        }
      })
      .catch(console.error);

    // Fetch KPIs
    getDistributorKpis()
      .then((data: KpiCard[]) => {
        setKpis(data);
        // Extract stats from KPIs
        const batchesReceivedCard = data.find(
          (k) => k.title === "Total Batches Received"
        );
        const batchesTransferredCard = data.find(
          (k) => k.title === "Batches Transferred"
        );
        const qualityCard = data.find(
          (k) => k.title === "Quality Score Average"
        );

        setStats((prev) => ({
          ...prev,
          batchesReceived: batchesReceivedCard?.subtitle ?? "0",
          batchesTransferred: batchesTransferredCard?.subtitle ?? "0",
          qualityScore: qualityCard?.subtitle ?? "—",
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
  // TODO: call updateDistributorProfile(payload) in handleSave once API is ready

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
    setUser((u) => ({
      ...u,
      fullName: personal.find((f) => f.key === "fullName")?.value ?? u.fullName,
      email: personal.find((f) => f.key === "email")?.value ?? u.email,
      phone: personal.find((f) => f.key === "phone")?.value ?? u.phone,
    }));
    setBiz((b) => ({
      ...b,
      companyName:
        bizFields.find((f) => f.key === "companyName")?.value ?? b.companyName,
      warehouseLocation:
        bizFields.find((f) => f.key === "warehouseLoc")?.value ??
        b.warehouseLocation,
      operationalArea:
        bizFields.find((f) => f.key === "operationalArea")?.value ??
        b.operationalArea,
    }));
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
    />
  );
}
