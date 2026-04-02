import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TopNavBar from "../components/TopNavBar";
import ProfileHeader from "./ProfileHeader";
import PersonalInfoCard from "./PersonalInfoCard";
import FarmInfoCard from "./FarmInfoCard";
import AccountSecurityCard from "./AccountSecurityCard";
import ActivitySummaryCard from "./ActivitySummaryCard";
import ChangePasswordModal from "./ChangePasswordModal";
import ProfileToast from "./ProfileToast";
import { useProfile } from "../../../contexts/ProfileContext";
import styles from "./profile.module.css";

export default function FarmerProfilePage() {
  const navigate = useNavigate();
  const { userProfile } = useProfile();

  const [editMode, setEditMode] = useState(false);
  const saving = false;
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (msg: string, type: "success" | "error" = "success") => {
      setToast({ msg, type });
    },
    []
  );

  const handleSave = useCallback(() => {
    setEditMode(false);
    showToast("Profile updated successfully");
  }, [showToast]);

  const handleCancel = useCallback(() => {
    setEditMode(false);
  }, []);

  const handleEditToggle = useCallback(() => {
    if (editMode) {
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  }, [editMode]);

  return (
    <div className={styles.page}>
      <TopNavBar
        userName={userProfile.fullName}
        userRole={userProfile.role}
        onNavigateToProfile={() => navigate("/farmer/profile")}
        avatarUrl={userProfile.avatarUrl}
      />

      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button
            className={styles.breadcrumbLink}
            onClick={() => navigate("/farmer/dashboard")}
          >
            Dashboard
          </button>
          <span className={styles.breadcrumbSep}>›</span>
          <span>My Profile</span>
        </div>

        {/* Page title */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My Profile</h1>
          <p className={styles.pageSubtitle}>
            Manage your personal and farm information
          </p>
        </div>

        {/* Profile header card */}
        <ProfileHeader
          editMode={editMode}
          onEditToggle={handleEditToggle}
          onChangePassword={() => setShowPwdModal(true)}
        />

        {/* Cards grid */}
        <div className={styles.grid}>
          <PersonalInfoCard
            editMode={editMode}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
          />
          <FarmInfoCard
            editMode={editMode}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
          />
          <AccountSecurityCard />
          <ActivitySummaryCard />
        </div>
      </div>

      {/* Change Password Modal */}
      {showPwdModal && (
        <ChangePasswordModal
          onClose={() => setShowPwdModal(false)}
          onSuccess={() => showToast("Password updated successfully")}
        />
      )}

      {/* Toast */}
      {toast && (
        <ProfileToast
          message={toast.msg}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
