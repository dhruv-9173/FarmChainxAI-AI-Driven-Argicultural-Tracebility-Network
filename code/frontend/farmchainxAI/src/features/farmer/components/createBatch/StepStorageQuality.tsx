import { useState, useRef, useCallback } from "react";
import type { CreateBatchFormData } from "../../../../types/dashboard.types";
import { STORAGE_TYPES } from "../../../../types/dashboard.types";
import styles from "./formFields.module.css";

interface Props {
  data: CreateBatchFormData;
  errors: Record<string, string>;
  onChange: (patch: Partial<CreateBatchFormData>) => void;
}

export default function StepStorageQuality({ data, errors, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        onChange({
          cropImage: file,
          cropImagePreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  return (
    <div className={styles.stepSection}>
      <h3 className={styles.sectionTitle}>Storage &amp; Quality Information</h3>
      <p className={styles.sectionSub}>
        Details about crop storage and expected shelf life
      </p>

      <div className={styles.fieldGrid}>
        {/* Storage Type */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Storage Type<span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={data.storageType}
            onChange={(e) => onChange({ storageType: e.target.value })}
          >
            <option value="">Select storage type</option>
            {STORAGE_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.storageType && (
            <span className={styles.error}>{errors.storageType}</span>
          )}
        </div>

        {/* Storage Location */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Storage Location<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            placeholder="e.g. Nagpur Storage Facility"
            value={data.storageLocation}
            onChange={(e) => onChange({ storageLocation: e.target.value })}
          />
          {errors.storageLocation && (
            <span className={styles.error}>{errors.storageLocation}</span>
          )}
        </div>

        {/* Expected Shelf Life */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Expected Shelf Life (days)<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            type="number"
            min={1}
            placeholder="e.g. 45"
            value={data.expectedShelfLife}
            onChange={(e) =>
              onChange({
                expectedShelfLife:
                  e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
          {errors.expectedShelfLife && (
            <span className={styles.error}>{errors.expectedShelfLife}</span>
          )}
        </div>

        {/* Moisture Level */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Moisture Level (%)<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            type="number"
            min={0}
            max={100}
            placeholder="e.g. 12"
            value={data.moistureLevel}
            onChange={(e) =>
              onChange({
                moistureLevel:
                  e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
          {errors.moistureLevel && (
            <span className={styles.error}>{errors.moistureLevel}</span>
          )}
        </div>

        {/* Initial Quality Score */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Initial Quality Score (0-100)</label>
          <input
            className={styles.input}
            type="number"
            min={0}
            max={100}
            placeholder="e.g. 92 (defaults to 75 if blank)"
            value={data.initialQualityScore}
            onChange={(e) =>
              onChange({
                initialQualityScore:
                  e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
          {errors.initialQualityScore && (
            <span className={styles.error}>{errors.initialQualityScore}</span>
          )}
        </div>

        {/* Crop Image Upload */}
        <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
          <label className={styles.label}>Upload Crop Image</label>

          {data.cropImagePreview ? (
            <div className={styles.imagePreview}>
              <img src={data.cropImagePreview} alt="Crop preview" />
              <button
                type="button"
                className={styles.removeImage}
                onClick={() =>
                  onChange({ cropImage: null, cropImagePreview: "" })
                }
                title="Remove image"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              className={`${styles.dropZone} ${
                dragOver ? styles.dropZoneDragOver : ""
              }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <svg
                className={styles.dropZoneIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className={styles.dropZoneText}>
                Drag &amp; drop your crop image here, or <strong>browse</strong>
              </p>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>
                PNG, JPG up to 5 MB
              </span>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </div>
    </div>
  );
}
