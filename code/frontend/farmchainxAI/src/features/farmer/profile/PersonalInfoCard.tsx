import { useState, useEffect } from "react";
import { useProfile } from "../../../contexts/ProfileContext";
import styles from "./profile.module.css";

interface Props {
  editMode: boolean;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

interface Errors {
  fullName?: string;
  phone?: string;
  form?: string;
}

function validatePersonal(data: { fullName: string; phone: string }): Errors {
  const e: Errors = {};
  if (!data.fullName.trim()) e.fullName = "Full name is required";
  if (!data.phone.trim()) e.phone = "Phone number is required";
  else if (!/^[+\d\s\-()]{7,}$/.test(data.phone))
    e.phone = "Enter a valid phone number";
  return e;
}

export default function PersonalInfoCard({
  editMode,
  onSave,
  onCancel,
  saving,
}: Props) {
  const { userProfile, updateUserProfile } = useProfile();
  const [draft, setDraft] = useState({
    fullName: userProfile.fullName,
    phone: userProfile.phone,
  });
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    setDraft({ fullName: userProfile.fullName, phone: userProfile.phone });
    setErrors({});
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }, [editMode, userProfile.fullName, userProfile.phone]);

  const handleChange = (field: keyof typeof draft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSave = async () => {
    const errs = validatePersonal(draft);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    try {
      await updateUserProfile({ fullName: draft.fullName, phone: draft.phone });
      onSave();
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        form:
          error instanceof Error
            ? error.message
            : "Failed to save personal information",
      }));
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIconWrap} style={{ background: "#EFF6FF" }}>
          <svg
            width="17"
            height="17"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#2563EB"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h3 className={styles.cardTitle}>Personal Information</h3>
      </div>

      <div className={styles.cardBody}>
        {editMode ? (
          <>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Full Name</label>
              <input
                className={`${styles.formInput} ${
                  errors.fullName ? styles.hasError : ""
                }`}
                value={draft.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Full name"
              />
              {errors.fullName && (
                <span className={styles.fieldError}>{errors.fullName}</span>
              )}
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Email</label>
              <input
                className={styles.formInputReadonly}
                value={userProfile.email}
                readOnly
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Phone Number</label>
              <input
                className={`${styles.formInput} ${
                  errors.phone ? styles.hasError : ""
                }`}
                value={draft.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+91 XXXXX XXXXX"
              />
              {errors.phone && (
                <span className={styles.fieldError}>{errors.phone}</span>
              )}
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Role</label>
              <input
                className={styles.formInputReadonly}
                value={userProfile.role}
                readOnly
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Member Since</label>
              <input
                className={styles.formInputReadonly}
                value={userProfile.memberSince}
                readOnly
              />
            </div>
            {errors.form && (
              <span className={styles.fieldError}>{errors.form}</span>
            )}
          </>
        ) : (
          <>
            <InfoRow label="Full Name" value={userProfile.fullName} />
            <InfoRow label="Email" value={userProfile.email} />
            <InfoRow label="Phone Number" value={userProfile.phone} />
            <InfoRow label="Role" value={userProfile.role} />
            <InfoRow label="Member Since" value={userProfile.memberSince} />
          </>
        )}
      </div>

      {editMode && (
        <div className={styles.editFooter}>
          <button className={styles.cancelBtn} onClick={onCancel} type="button">
            Cancel
          </button>
          <button
            className={styles.saveBtn}
            onClick={() => void handleSave()}
            type="button"
            disabled={saving}
          >
            {saving ? (
              <span className={styles.spinner} />
            ) : (
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}
