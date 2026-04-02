import React from "react";
import { Link } from "react-router-dom";
import { useRegister } from "../../hooks/useRegister";
import InputField from "../../components/common/InputField";
import PasswordField from "../../components/common/PasswordField";
import SelectField from "../../components/common/SelectField";
import styles from "./RegisterPage.module.css";

const ROLE_OPTIONS = [
  { value: "FARMER", label: "🌾 Farmer" },
  { value: "DISTRIBUTOR", label: "🚛 Distributor" },
  { value: "RETAILER", label: "🛒 Retailer" },
  { value: "CONSUMER", label: "🧑 Consumer" },
];

const RegisterPage: React.FC = () => {
  const { formik, apiError } = useRegister();

  return (
    <div className={styles.root}>
      <div className={styles.bgImage} />
      <div className={styles.bgOverlay} />

      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🌾</span>
          <span className={styles.brandText}>FarmChainX</span>
          <span className={styles.brandAccent} />
        </div>
        <Link to="/login" className={styles.loginBtn}>
          LOGIN
        </Link>
      </header>

      <main className={styles.centerStage}>
        <div className={styles.card}>
          <div className={styles.cardTopAccent} />
          <h2 className={styles.cardTitle}>Create Account</h2>
          <p className={styles.cardSubtitle}>
            Join the agricultural traceability network
          </p>

          {apiError && (
            <div className={styles.apiError} role="alert">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {apiError}
            </div>
          )}

          <form
            onSubmit={formik.handleSubmit}
            noValidate
            className={styles.form}
          >
            <InputField
              formik={formik}
              name="fullName"
              label="Full Name"
              placeholder="John Doe"
              required
            />

            <InputField
              formik={formik}
              name="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              required
            />

            <div className={styles.row}>
              <SelectField
                formik={formik}
                name="role"
                label="Your Role"
                options={ROLE_OPTIONS}
                required
              />

              <InputField
                formik={formik}
                name="phone"
                label="Phone (optional)"
                type="tel"
                placeholder="+91 98765 43210"
              />
            </div>

            <PasswordField
              formik={formik}
              name="password"
              label="Password"
              placeholder="Min. 8 characters"
              required
            />

            <PasswordField
              formik={formik}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Re-enter your password"
              required
            />

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <span className={styles.spinner} />
              ) : (
                "CREATE ACCOUNT"
              )}
            </button>
          </form>

          <p className={styles.signupText}>
            Already have an account?{" "}
            <Link to="/login" className={styles.signupLink}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
