import { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { registerValidationSchema } from "../utils/validation/authValidation";
import { registerRequest } from "../api/authApi";
import type { RegisterCredentials } from "../types/auth.types";

export const useRegister = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const formik = useFormik<RegisterCredentials>({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "FARMER",
      phone: "",
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError(null);
      try {
        const response = await registerRequest(values);
        // User needs to verify OTP before login, redirect to OTP page
        navigate("/verify-registration-otp", { state: { email: response.email } });
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Registration failed. Please try again.";
        setApiError(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return { formik, apiError };
};
