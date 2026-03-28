import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  verifyRegistrationOtpRequest,
  resendRegistrationOtpRequest,
} from "../api/authApi";

interface LocationState {
  email?: string;
  fromLogin?: boolean;
}

export const useVerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState) || {};
  const email = state.email ?? "";
  const fromLogin = (state.fromLogin as boolean) || false;

  const [apiError, setApiError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    } else if (fromLogin) {
      // Auto-resend OTP when an unverified user arrives from the login page
      handleResend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, navigate, fromLogin]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .required("OTP is required")
        .matches(/^\d{6}$/, "OTP must be exactly 6 digits"),
    }),
    onSubmit: async (values) => {
      setApiError(null);
      setIsLoading(true);
      try {
        await verifyRegistrationOtpRequest(email, values.otp);
        setMessage("Email verified successfully! You can now log in.");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      } catch (err: unknown) {
        setApiError(
          err instanceof Error ? err.message : "Verification failed."
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleResend = useCallback(async () => {
    setApiError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const res = await resendRegistrationOtpRequest(email);
      setTimeLeft(res.otpExpirySeconds || 300);
      setMessage("A new OTP has been sent to your email.");
      formik.resetForm();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  }, [email, formik]);

  return {
    email,
    formik,
    apiError,
    message,
    isLoading,
    timeLeft,
    handleResend,
  };
};
