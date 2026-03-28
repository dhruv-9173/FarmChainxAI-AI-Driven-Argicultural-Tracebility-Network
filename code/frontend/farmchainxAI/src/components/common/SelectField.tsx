import type { FormikProps } from "formik";
import styles from "./SelectField.module.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps<T extends object> {
  formik: FormikProps<T>;
  name: keyof T & string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
}

function SelectField<T extends object>({
  formik,
  name,
  label,
  options,
  placeholder,
  required = false,
}: SelectFieldProps<T>) {
  const touched = formik.touched[name];
  const error = formik.errors[name] as string | undefined;
  const hasError = Boolean(touched && error);

  return (
    <div className={styles.fieldWrapper}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <div className={styles.selectWrapper}>
        <select
          id={name}
          className={`${styles.select} ${hasError ? styles.selectError : ""}`}
          {...formik.getFieldProps(name)}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.arrow}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {hasError && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export default SelectField;
