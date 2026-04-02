import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../../hooks/useLogin";
import InputField from "../../components/common/InputField";
import PasswordField from "../../components/common/PasswordField";
import ForgotPasswordModal from "./components/ForgotPasswordModal";
import styles from "./LoginPage.module.css";

const LoginPage: React.FC = () => {
  const { formik, apiError } = useLogin();
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

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
        <Link to="/register" className={styles.registerBtn}>
          REGISTER
        </Link>
      </header>

      <main className={styles.centerStage}>
        <div className={styles.card}>
          <div className={styles.cardTopAccent} />
          <h2 className={styles.cardTitle}>Welcome Back</h2>
          <p className={styles.cardSubtitle}>
            Sign in to your FarmChainX account
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
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              required
            />

            <PasswordField
              formik={formik}
              name="password"
              label="Password"
              placeholder="Enter your password"
              required
            />

            <div className={styles.optionsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  {...formik.getFieldProps("rememberMe")}
                  checked={!!formik.values.rememberMe}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className={styles.forgotLink}
                onClick={() => setIsForgotPasswordOpen(true)}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <span className={styles.spinner} />
              ) : (
                "SIGN IN"
              )}
            </button>
          </form>

          <p className={styles.signupText}>
            Don&apos;t have an account?{" "}
            <Link to="/register" className={styles.signupLink}>
              Create account
            </Link>
          </p>
        </div>
      </main>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default LoginPage;
