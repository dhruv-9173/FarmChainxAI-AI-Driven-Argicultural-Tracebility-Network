import * as Yup from "yup";

const passwordRules = Yup.string()
  .min(8, "Password must be at least 8 characters")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  .matches(/[a-z]/, "Password must contain at least one lowercase letter")
  .matches(/[0-9]/, "Password must contain at least one number")
  .required("Password is required");

const otpRules = Yup.string()
  .required("OTP is required")
  .matches(/^\d{6}$/, "OTP must be exactly 6 digits");

const strongPasswordRules = passwordRules.matches(
  /[^A-Za-z0-9]/,
  "Password must contain at least one special character"
);

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
  rememberMe: Yup.boolean(),
});

export const registerValidationSchema = Yup.object({
  fullName: Yup.string()
    .min(3, "Full name must be at least 3 characters")
    .max(60, "Full name must not exceed 60 characters")
    .required("Full name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: passwordRules,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
  role: Yup.string()
    .oneOf(
      ["FARMER", "DISTRIBUTOR", "RETAILER", "CONSUMER"],
      "Please select a valid role"
    )
    .required("Role is required"),
  phone: Yup.string()
    .matches(/^\+?[0-9\s\-()]{7,15}$/, "Please enter a valid phone number")
    .optional(),
});

export const forgotPasswordRequestValidationSchema = Yup.object({
  identifier: Yup.string()
    .trim()
    .required("Username, email, or mobile number is required")
    .test(
      "valid-identifier",
      "Enter a valid username, email, or mobile number",
      (value = "") => {
        const v = value.trim();
        if (!v) return false;
        if (v.includes("@")) {
          return Yup.string().email().isValidSync(v);
        }
        if (/^[+]?[-()\d\s]{7,15}$/.test(v)) {
          return true;
        }
        return /^[A-Za-z0-9._-]{3,60}$/.test(v);
      }
    ),
});

export const forgotPasswordOtpValidationSchema = Yup.object({
  otp: otpRules,
});

export const forgotPasswordResetValidationSchema = Yup.object({
  newPassword: strongPasswordRules,
  confirmPassword: Yup.string()
    .required("Please confirm your new password")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

