import { useState } from "react";
import type { FormikProps } from "formik";
import styles from "./PasswordField.module.css";

interface PasswordFieldProps<T extends object> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "form"> {
  formik: FormikProps<T>;
  name: keyof T & string;
  label: string;
}

function PasswordField<T extends object>({
  formik,
  name,
  label,
  placeholder,
  required = false,
  className,
  ...rest
}: PasswordFieldProps<T>) {
  const [visible, setVisible] = useState(false);
  const touched = formik.touched[name];
  const error = formik.errors[name] as string | undefined;
  const hasError = Boolean(touched && error);

  return (
    <div className={styles.fieldWrapper}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <div
        className={`${styles.inputWrapper} ${hasError ? styles.inputWrapperError : ""
          }`}
      >
        <input
          id={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          className={`${styles.input} ${className || ""}`.trim()}
          {...formik.getFieldProps(name)}
          {...rest}
        />
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {hasError && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export default PasswordField;
