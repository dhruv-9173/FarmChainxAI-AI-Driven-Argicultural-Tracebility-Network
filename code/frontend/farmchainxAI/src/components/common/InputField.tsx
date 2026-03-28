import type { FormikProps } from "formik";
import styles from "./InputField.module.css";

interface InputFieldProps<T extends object> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "form"> {
  formik: FormikProps<T>;
  name: keyof T & string;
  label: string;
}

function InputField<T extends object>({
  formik,
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  className,
  ...rest
}: InputFieldProps<T>) {
  const touched = formik.touched[name];
  const error = formik.errors[name] as string | undefined;
  const hasError = Boolean(touched && error);

  return (
    <div className={styles.fieldWrapper}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className={`${styles.input} ${hasError ? styles.inputError : ""} ${className || ""}`.trim()}
        {...formik.getFieldProps(name)}
        {...rest}
      />
      {hasError && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export default InputField;
