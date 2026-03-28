import type { CreateBatchFormData } from "../../../../types/dashboard.types";
import {
  SOIL_TYPES,
  IRRIGATION_TYPES,
} from "../../../../types/dashboard.types";
import styles from "./formFields.module.css";

interface Props {
  data: CreateBatchFormData;
  errors: Record<string, string>;
  onChange: (patch: Partial<CreateBatchFormData>) => void;
}

export default function StepFarmInfo({ data, errors, onChange }: Props) {
  return (
    <div className={styles.stepSection}>
      <h3 className={styles.sectionTitle}>Farm Details</h3>
      <p className={styles.sectionSub}>
        Information about the farm where crop was grown
      </p>

      <div className={styles.fieldGrid}>
        {/* Farmer Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Farmer Name<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            value={data.farmerName}
            readOnly
            style={{ background: "#f9fafb", color: "#6b7280" }}
          />
        </div>

        {/* Farm ID */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Farm ID<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            placeholder="e.g. FCX-FRM-2042"
            value={data.farmId}
            onChange={(e) => onChange({ farmId: e.target.value })}
          />
          {errors.farmId && (
            <span className={styles.error}>{errors.farmId}</span>
          )}
        </div>

        {/* Farm City */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            City<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            placeholder="e.g. Nagpur"
            value={data.farmCity}
            onChange={(e) => onChange({ farmCity: e.target.value })}
          />
          {errors.farmCity && (
            <span className={styles.error}>{errors.farmCity}</span>
          )}
        </div>

        {/* Farm State */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            State<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            placeholder="e.g. Maharashtra"
            value={data.farmState}
            onChange={(e) => onChange({ farmState: e.target.value })}
          />
          {errors.farmState && (
            <span className={styles.error}>{errors.farmState}</span>
          )}
        </div>

        {/* Field Area */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Field Area (acres)<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            type="number"
            min={0}
            placeholder="e.g. 12"
            value={data.fieldArea}
            onChange={(e) =>
              onChange({
                fieldArea: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
          {errors.fieldArea && (
            <span className={styles.error}>{errors.fieldArea}</span>
          )}
        </div>

        {/* Soil Type */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Soil Type<span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={data.soilType}
            onChange={(e) => onChange({ soilType: e.target.value })}
          >
            <option value="">Select soil type</option>
            {SOIL_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.soilType && (
            <span className={styles.error}>{errors.soilType}</span>
          )}
        </div>

        {/* Irrigation Type */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Irrigation Type<span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={data.irrigationType}
            onChange={(e) => onChange({ irrigationType: e.target.value })}
          >
            <option value="">Select irrigation type</option>
            {IRRIGATION_TYPES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          {errors.irrigationType && (
            <span className={styles.error}>{errors.irrigationType}</span>
          )}
        </div>
      </div>
    </div>
  );
}
