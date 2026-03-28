import { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { loginValidationSchema } from "../utils/validation/authValidation";
import { loginRequest } from "../api/authApi";
import { useAuth } from "./useAuth";
import type { LoginCredentials, UserRole } from "../types/auth.types";

const ROLE_DASHBOARD: Record<UserRole, string> = {
  FARMER: "/farmer/dashboard",
  DISTRIBUTOR: "/distributor/dashboard",
  RETAILER: "/retailer/dashboard",
  CONSUMER: "/dashboard",
  ADMIN: "/admin/dashboard",
};

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const formik = useFormik<LoginCredentials>({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError(null);
      try {
        const response = await loginRequest(values);
        login(response.user, response.tokens, values.rememberMe);
        navigate(ROLE_DASHBOARD[response.user.role] ?? "/dashboard", {
          replace: true,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Login failed. Please try again.";
            
        if (message.includes("Email not verified")) {
          navigate("/verify-registration-otp", {
            state: {
              email: values.email,
              fromLogin: true,
            },
          });
        } else {
          setApiError(message);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return { formik, apiError };
};
