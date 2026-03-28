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
  farmName?: string;
  location?: string;
  farmSize?: string;
  primaryCrops?: string;
}

function validateFarm(data: {
  farmName: string;
  location: string;
  farmSize: string;
  primaryCrops: string;
}): Errors {
  const e: Errors = {};
  if (!data.farmName.trim()) e.farmName = "Farm name is required";
  if (!data.location.trim()) e.location = "Location is required";
  if (!data.farmSize.trim()) e.farmSize = "Farm size is required";
  if (!data.primaryCrops.trim()) e.primaryCrops = "Primary crops are required";
  return e;
}

export default function FarmInfoCard({
  editMode,
  onSave,
  onCancel,
  saving,
}: Props) {
  const { farmProfile, updateFarmProfile } = useProfile();
  const [draft, setDraft] = useState({
    farmName: farmProfile.farmName,
    location: farmProfile.location,
    farmSize: farmProfile.farmSize,
    primaryCrops: farmProfile.primaryCrops,
    soilType: farmProfile.soilType,
    irrigationMethod: farmProfile.irrigationMethod,
  });
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    setDraft({
      farmName: farmProfile.farmName,
      location: farmProfile.location,
      farmSize: farmProfile.farmSize,
      primaryCrops: farmProfile.primaryCrops,
      soilType: farmProfile.soilType,
      irrigationMethod: farmProfile.irrigationMethod,
    });
    setErrors({});
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }, [editMode, farmProfile]);

  const handleChange = (field: keyof typeof draft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field as keyof Errors];
      return next;
    });
  };

  const handleSave = () => {
    const errs = validateFarm(draft);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    updateFarmProfile(draft);
    onSave();
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIconWrap} style={{ background: "#F0FDF4" }}>
          <svg
            width="17"
            height="17"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#16A34A"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <h3 className={styles.cardTitle}>Farm Details</h3>
      </div>

      <div className={styles.cardBody}>
        {editMode ? (
          <>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Farm Name</label>
              <input
                className={`${styles.formInput} ${
                  errors.farmName ? styles.hasError : ""
                }`}
                value={draft.farmName}
                onChange={(e) => handleChange("farmName", e.target.value)}
              />
              {errors.farmName && (
                <span className={styles.fieldError}>{errors.farmName}</span>
              )}
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Farm ID</label>
              <input
                className={styles.formInputReadonly}
                value={farmProfile.farmId}
                readOnly
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Location</label>
              <input
                className={`${styles.formInput} ${
                  errors.location ? styles.hasError : ""
                }`}
                value={draft.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="City, State"
              />
              {errors.location && (
                <span className={styles.fieldError}>{errors.location}</span>
              )}
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Farm Size</label>
              <input
                className={`${styles.formInput} ${
                  errors.farmSize ? styles.hasError : ""
                }`}
                value={draft.farmSize}
                onChange={(e) => handleChange("farmSize", e.target.value)}
                placeholder="e.g. 12 Acres"
              />
              {errors.farmSize && (
                <span className={styles.fieldError}>{errors.farmSize}</span>
              )}
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Primary Crops</label>
              <input
                className={`${styles.formInput} ${
                  errors.primaryCrops ? styles.hasError : ""
                }`}
                value={draft.primaryCrops}
                onChange={(e) => handleChange("primaryCrops", e.target.value)}
                placeholder="e.g. Wheat, Rice, Soybean"
              />
              {errors.primaryCrops && (
                <span className={styles.fieldError}>{errors.primaryCrops}</span>
              )}
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Soil Type</label>
              <input
                className={styles.formInput}
                value={draft.soilType}
                onChange={(e) => handleChange("soilType", e.target.value)}
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Irrigation Method</label>
              <input
                className={styles.formInput}
                value={draft.irrigationMethod}
                onChange={(e) =>
                  handleChange("irrigationMethod", e.target.value)
                }
              />
            </div>
          </>
        ) : (
          <>
            <InfoRow label="Farm Name" value={farmProfile.farmName} />
            <InfoRow label="Farm ID" value={farmProfile.farmId} />
            <InfoRow label="Location" value={farmProfile.location} />
            <InfoRow label="Farm Size" value={farmProfile.farmSize} />
            <InfoRow label="Primary Crops" value={farmProfile.primaryCrops} />
            <InfoRow label="Soil Type" value={farmProfile.soilType} />
            <InfoRow
              label="Irrigation Method"
              value={farmProfile.irrigationMethod}
            />
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
            onClick={handleSave}
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
