import React from "react";
import { Link } from "react-router-dom";
import { useVerifyOtp } from "../../hooks/useVerifyOtp";
import InputField from "../../components/common/InputField";
import styles from "./LoginPage.module.css"; // Reusing login styles for consistency

const VerifyOtpPage: React.FC = () => {
  const {
    email,
    formik,
    apiError,
    message,
    isLoading,
    timeLeft,
    handleResend,
  } = useVerifyOtp();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={styles.root}>
      <div className={styles.bgImage} />
      <div className={styles.bgOverlay} />

      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandText}>FarmChainX</span>
          <span className={styles.brandAccent} />
        </div>
        <Link to="/login" className={styles.registerBtn}>
          LOGIN
        </Link>
      </header>

      <main className={styles.centerStage}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Verify Email</h2>
          <p className={styles.cardSubtitle}>
            Please enter the OTP sent to <strong>{email}</strong>
          </p>

          {apiError && (
            <div className={styles.apiError} role="alert">
              {apiError}
            </div>
          )}
          
          {message && (
            <div className={styles.apiError} role="alert" style={{ background: 'rgba(52, 168, 83, 0.1)', color: '#34A853', borderLeftColor: '#34A853'}}>
              {message}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} noValidate className={styles.form}>
            <InputField
              formik={formik}
              name="otp"
              label="OTP Code"
              type="text"
              placeholder="Enter OTP"
              required
            />

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={isLoading || timeLeft <= 0 || formik.isSubmitting}
            >
              {isLoading ? <span className={styles.spinner} /> : "VERIFY"}
            </button>
          </form>

          <div className={styles.dividerRow}>
            <span className={styles.dividerLine} />
          </div>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            {timeLeft > 0 ? (
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                OTP expires in {formatTime(timeLeft)}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <p style={{ color: "#ef4444", fontSize: "0.875rem" }}>OTP has expired</p>
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Resend OTP
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyOtpPage;
