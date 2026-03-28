import type { CreateBatchFormData } from "../../../../types/dashboard.types";
import {
  CROP_TYPES,
  QUALITY_GRADES,
  CERTIFICATIONS,
} from "../../../../types/dashboard.types";
import styles from "./formFields.module.css";

interface Props {
  data: CreateBatchFormData;
  errors: Record<string, string>;
  onChange: (patch: Partial<CreateBatchFormData>) => void;
}

export default function StepCropDetails({ data, errors, onChange }: Props) {
  const toggleCert = (cert: string) => {
    const next = data.certifications.includes(cert)
      ? data.certifications.filter((c) => c !== cert)
      : [...data.certifications, cert];
    onChange({ certifications: next });
  };

  return (
    <div className={styles.stepSection}>
      <h3 className={styles.sectionTitle}>Crop Information</h3>
      <p className={styles.sectionSub}>
        Basic details about the crop being registered
      </p>

      <div className={styles.fieldGrid}>
        {/* Crop Type */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Crop Type<span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={data.cropType}
            onChange={(e) => onChange({ cropType: e.target.value })}
          >
            <option value="">Select crop type</option>
            {CROP_TYPES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.cropType && (
            <span className={styles.error}>{errors.cropType}</span>
          )}
        </div>

        {/* Crop Variety */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Crop Variety<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            placeholder="e.g. Sharbati, Basmati"
            value={data.cropVariety}
            onChange={(e) => onChange({ cropVariety: e.target.value })}
          />
          {errors.cropVariety && (
            <span className={styles.error}>{errors.cropVariety}</span>
          )}
        </div>

        {/* Quantity */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Quantity<span className={styles.required}>*</span>
          </label>
          <div className={styles.quantityRow}>
            <input
              className={styles.input}
              type="number"
              min={0}
              placeholder="e.g. 2400"
              value={data.quantity}
              onChange={(e) =>
                onChange({
                  quantity: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
            <select
              className={styles.select}
              value={data.quantityUnit}
              onChange={(e) =>
                onChange({
                  quantityUnit: e.target.value as "kg" | "ton" | "quintal",
                })
              }
            >
              <option value="kg">kg</option>
              <option value="ton">ton</option>
              <option value="quintal">quintal</option>
            </select>
          </div>
          {errors.quantity && (
            <span className={styles.error}>{errors.quantity}</span>
          )}
        </div>

        {/* Quality Grade */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Expected Quality Grade<span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={data.qualityGrade}
            onChange={(e) => onChange({ qualityGrade: e.target.value })}
          >
            <option value="">Select grade</option>
            {QUALITY_GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {errors.qualityGrade && (
            <span className={styles.error}>{errors.qualityGrade}</span>
          )}
        </div>

        {/* Harvest Date */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Harvest Date<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            type="date"
            value={data.harvestDate}
            onChange={(e) => onChange({ harvestDate: e.target.value })}
          />
          {errors.harvestDate && (
            <span className={styles.error}>{errors.harvestDate}</span>
          )}
        </div>

        {/* Sowing Date */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Sowing Date<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            type="date"
            value={data.sowingDate}
            onChange={(e) => onChange({ sowingDate: e.target.value })}
          />
          {errors.sowingDate && (
            <span className={styles.error}>{errors.sowingDate}</span>
          )}
        </div>

        {/* Certifications */}
        <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
          <label className={styles.label}>Certifications</label>
          <div className={styles.chipsWrap}>
            {CERTIFICATIONS.map((cert) => (
              <button
                key={cert}
                type="button"
                className={`${styles.chip} ${
                  data.certifications.includes(cert) ? styles.chipActive : ""
                }`}
                onClick={() => toggleCert(cert)}
              >
                {data.certifications.includes(cert) ? "✓ " : ""}
                {cert}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
          <label className={styles.label}>Notes</label>
          <textarea
            className={styles.textarea}
            placeholder="e.g. Harvested early morning to maintain moisture level"
            value={data.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
