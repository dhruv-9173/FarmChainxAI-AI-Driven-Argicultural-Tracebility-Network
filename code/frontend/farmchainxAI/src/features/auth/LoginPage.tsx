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
      {/* Full-screen blurred background */}
      <div className={styles.bgImage} />
      <div className={styles.bgOverlay} />

      {/* Top header bar */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandText}>FarmChainX</span>
          <span className={styles.brandAccent} />
        </div>
        <Link to="/register" className={styles.registerBtn}>
          REGISTER
        </Link>
      </header>

      {/* Centered glassmorphism card */}
      <main className={styles.centerStage}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Login</h2>
          <p className={styles.cardSubtitle}>
            Welcome back! Please sign in to continue.
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
              label="Username"
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

            {/* Remember me + Forgot password */}
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

            {/* LOGIN button */}
            <button
              type="submit"
              className={styles.loginBtn}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <span className={styles.spinner} />
              ) : (
                "LOGIN"
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className={styles.dividerRow}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>Or continue with</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Social buttons */}
          <div className={styles.socialRow}>
            <button type="button" className={styles.socialBtn}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              Google
            </button>

            <button type="button" className={styles.socialBtn}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="#1877F2"
              >
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.932-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          {/* Sign up text */}
          <p className={styles.signupText}>
            Don&apos;t have an account?{" "}
            <Link to="/register" className={styles.signupLink}>
              Sign up
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
