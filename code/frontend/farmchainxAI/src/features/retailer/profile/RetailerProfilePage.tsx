import { useState, useEffect } from "react";
import ProfilePageLayout from "../../../components/common/ProfilePage";
import type { ProfileSection } from "../../../components/common/ProfilePage";
import { useAuth } from "../../../hooks/useAuth";
import { getRetailerProfile } from "../api/retailerApi";

export default function RetailerProfilePage() {
  const { user: authUser } = useAuth();

  const [user, setUser] = useState({
    fullName: authUser?.fullName ?? "",
    email: authUser?.email ?? "",
    phone: authUser?.phone ?? "",
    role: authUser?.role ?? "RETAILER",
    retailerId: authUser?.id ?? "",
    memberSince: "",
    avatarUrl: "",
  });

  const [biz, setBiz] = useState({
    storeName: "",
    storeId: "",
    storeType: "",
    storeAddress: "",
    storeCity: "",
    gstNumber: "",
    fssaiLicenseNo: "",
    establishedYear: "",
  });

  useEffect(() => {
    getRetailerProfile()
      .then((data: typeof user & { biz?: typeof biz }) => {
        if (data) {
          setUser((u) => ({ ...u, ...data }));
          if (data.biz) setBiz((b) => ({ ...b, ...data.biz }));
        }
      })
      .catch(console.error);
  }, []);
  // TODO: call updateRetailerProfile(payload) in handleSave once API is ready

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
            key: "retailerId",
            label: "Retailer ID",
            value: user.retailerId,
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
        icon: "🛒",
        title: "Store Information",
        subtitle: "Business and store location details",
        fields: [
          {
            key: "storeName",
            label: "Store Name",
            value: biz.storeName,
            editable: true,
          },
          {
            key: "storeId",
            label: "Store ID",
            value: biz.storeId,
            editable: false,
            mono: true,
          },
          {
            key: "storeType",
            label: "Store Type",
            value: biz.storeType,
            editable: false,
          },
          {
            key: "storeAddress",
            label: "Address",
            value: biz.storeAddress,
            editable: true,
          },
          {
            key: "storeCity",
            label: "City",
            value: biz.storeCity,
            editable: false,
          },
          {
            key: "gstNumber",
            label: "GST Number",
            value: biz.gstNumber,
            editable: false,
            mono: true,
          },
          {
            key: "licenseNo",
            label: "FSSAI License",
            value: biz.fssaiLicenseNo,
            editable: false,
            mono: true,
          },
          {
            key: "established",
            label: "Established",
            value: biz.establishedYear,
            editable: false,
          },
        ],
      },
    ];
  }

  const sections = buildSections();

  const handleSave = async (draft: ProfileSection[]) => {
    const personal = draft[0].fields;
    const storeFields = draft[1].fields;
    setUser((u) => ({
      ...u,
      fullName: personal.find((f) => f.key === "fullName")?.value ?? u.fullName,
      email: personal.find((f) => f.key === "email")?.value ?? u.email,
      phone: personal.find((f) => f.key === "phone")?.value ?? u.phone,
    }));
    setBiz((b) => ({
      ...b,
      storeName:
        storeFields.find((f) => f.key === "storeName")?.value ?? b.storeName,
      storeAddress:
        storeFields.find((f) => f.key === "storeAddress")?.value ??
        b.storeAddress,
    }));
  };

  return (
    <ProfilePageLayout
      user={{
        fullName: user.fullName,
        role: user.role,
        roleId: user.retailerId,
        memberSince: user.memberSince,
        avatarUrl: user.avatarUrl,
        bizName: biz.storeName,
      }}
      sections={sections}
      stats={[
        { label: "Batches in Stock", value: "23", color: "#16A34A" },
        { label: "Batches Sold", value: "87", color: "#2563EB" },
        { label: "Revenue (Month)", value: "₹1.2L", color: "#7C3AED" },
        { label: "Rating", value: "4.5⭐", color: "#F59E0B" },
        { label: "Low Stock Items", value: "4", color: "#EA580C" },
        { label: "Customer Visits", value: "320", color: "#0891B2" },
      ]}
      dashboardPath="/retailer/dashboard"
      profilePath="/retailer/profile"
      accentCss="--accent: #16a34a; --accent-bg: #f0fdf4;"
      onSave={handleSave}
    />
  );
}
