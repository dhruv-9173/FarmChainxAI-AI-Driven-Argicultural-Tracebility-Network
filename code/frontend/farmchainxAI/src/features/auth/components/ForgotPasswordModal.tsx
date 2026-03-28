import React, { useEffect, useRef } from "react";
import { useForgotPassword } from "../../../hooks/useForgotPassword";
import InputField from "../../../components/common/InputField";
import PasswordField from "../../../components/common/PasswordField";
import styles from "./ForgotPasswordModal.module.css";

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
    isOpen,
    onClose,
}) => {
    const {
        step,
        apiError,
        apiMessage,
        isLoading,
        registeredIdentifier,
        requestOtpFormik,
        verifyOtpFormik,
        resetPasswordFormik,
        handleResendOtp,
        resetFlow,
    } = useForgotPassword();

    const modalRef = useRef<HTMLDivElement>(null);

    // Reset flow when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(resetFlow, 300); // Wait for transition before resetting
        }
    }, [isOpen, resetFlow]);

    // Click outside to close (only if not loading)
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                isOpen &&
                !isLoading &&
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [isOpen, isLoading, onClose]);

    // Escape key to close
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen && !isLoading) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <h2 className={styles.modalTitle}>Forgot Password</h2>
                        <p className={styles.modalSubtitle}>
                            Enter your username, email, or mobile number and we will send you an
                            OTP to reset your password.
                        </p>

                        <form
                            onSubmit={requestOtpFormik.handleSubmit}
                            noValidate
                            className={styles.form}
                        >
                            <InputField
                                formik={requestOtpFormik}
                                name="identifier"
                                label="Identifier"
                                type="text"
                                placeholder="Username, Email, or Mobile No"
                                autoFocus
                                required
                            />

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={isLoading || requestOtpFormik.isSubmitting}
                            >
                                {isLoading ? <span className={styles.spinner} /> : "SEND OTP"}
                            </button>
                        </form>
                    </>
                );

            case 2:
                return (
                    <>
                        <h2 className={styles.modalTitle}>Verify OTP</h2>
                        <p className={styles.modalSubtitle}>
                            Please enter the 6-digit OTP sent to {registeredIdentifier}.
                        </p>

                        <form
                            onSubmit={verifyOtpFormik.handleSubmit}
                            noValidate
                            className={styles.form}
                        >
                            <InputField
                                formik={verifyOtpFormik}
                                name="otp"
                                label="One-Time Password"
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                autoComplete="one-time-code"
                                required
                            />

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={isLoading || verifyOtpFormik.isSubmitting}
                            >
                                {isLoading ? <span className={styles.spinner} /> : "VERIFY OTP"}
                            </button>
                        </form>

                        <div className={styles.resendContainer}>
                            <span>Didn't receive the OTP?</span>
                            <button
                                type="button"
                                className={styles.resendBtn}
                                onClick={handleResendOtp}
                                disabled={isLoading}
                            >
                                Resend
                            </button>
                        </div>
                    </>
                );

            case 3:
                return (
                    <>
                        <h2 className={styles.modalTitle}>Reset Password</h2>
                        <p className={styles.modalSubtitle}>
                            Create a new secure password for your account.
                        </p>

                        <form
                            onSubmit={resetPasswordFormik.handleSubmit}
                            noValidate
                            className={styles.form}
                        >
                            <PasswordField
                                formik={resetPasswordFormik}
                                name="newPassword"
                                label="New Password"
                                placeholder="Enter new password"
                                required
                            />

                            <PasswordField
                                formik={resetPasswordFormik}
                                name="confirmPassword"
                                label="Confirm Password"
                                placeholder="Confirm new password"
                                required
                            />

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={isLoading || resetPasswordFormik.isSubmitting}
                            >
                                {isLoading ? (
                                    <span className={styles.spinner} />
                                ) : (
                                    "UPDATE PASSWORD"
                                )}
                            </button>
                        </form>
                    </>
                );

            case 4:
                return (
                    <div className={styles.successMessage}>
                        <svg
                            className={styles.successIcon}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h2 className={styles.modalTitle}>Password Reset!</h2>
                        <p className={styles.modalSubtitle}>
                            Your password has been successfully reset. You can now use your
                            new password to log in.
                        </p>
                        <button
                            onClick={onClose}
                            className={styles.backToLoginBtn}
                            type="button"
                        >
                            BACK TO LOGIN
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={modalRef}>
                {!isLoading && step !== 4 && (
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label="Close modal"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}

                {apiError && (
                    <div className={styles.apiError} role="alert">
                        <svg
                            width="16"
                            height="16"
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

                {apiMessage && !apiError && step !== 4 && (
                    <div className={styles.apiInfo} role="status">
                        {apiMessage}
                    </div>
                )}

                {renderStep()}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
