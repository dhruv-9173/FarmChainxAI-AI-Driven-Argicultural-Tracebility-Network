/**
 * authApi.ts
 *
 * Authentication API — login, register, logout, password reset, token refresh.
 * All functions call the Spring Boot backend via apiClient.
 *
 * Backend Base URL: http://localhost:8080/api/v1
 * Database: MySQL (ecommerce)
 *
 * Available Endpoints:
 * - POST /auth/login
 * - POST /auth/register
 * - POST /auth/logout
 * - POST /auth/forgot-password
 * - POST /auth/verify-otp
 * - POST /auth/reset-password
 * - POST /auth/refresh
 */

import type { AxiosResponse } from "axios";
import { isAxiosError } from "axios";
import apiClient from "./apiClient";
import type {
  AuthResponse,
  ForgotPasswordRequestPayload,
  ForgotPasswordResponse,
  LoginCredentials,
  MessageResponse,
  ResetPasswordPayload,
  VerifyOtpRequestPayload,
  VerifyOtpResponse,
  RegisterCredentials,
  LoginResponse,
  PostRegisterResponse,
} from "../types/auth.types";

// ── Type for API responses from backend ────────────────────────────────────────
interface ApiResponseWrapper<T> {
  message: string;
  data: T;
  success: boolean;
  timestamp: number;
}

type LoginPayloadShape = {
  user?: LoginResponse["user"];
  tokens?: LoginResponse["tokens"];
  accessToken?: string;
  refreshToken?: string;
  message?: string;
};

// ── Helper functions ──────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildIdentifierPayload(identifier: string) {
  const value = identifier.trim();
  return EMAIL_REGEX.test(value)
    ? { identifier: value, email: value }
    : { identifier: value };
}

function extractMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const errorData = error.response?.data as
      | Record<string, unknown>
      | undefined;
    const message =
      (errorData?.message as string | undefined) ??
      (errorData?.error as string | undefined) ??
      error.response?.statusText ??
      fallback;
    return typeof message === "string" ? message : fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

// ── Auth API Functions ─────────────────────────────────────────────────────────

/** POST /auth/login */
export const loginRequest = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<LoginPayloadShape>> =
      await apiClient.post("/auth/login", credentials);

    const payload = res.data.data;
    const user = payload.user;
    const tokens = payload.tokens ?? {
      accessToken: payload.accessToken ?? "",
      refreshToken: payload.refreshToken ?? "",
    };

    if (!user || !tokens.accessToken || !tokens.refreshToken) {
      throw new Error("Login response is missing required user/token data.");
    }

    return {
      user,
      tokens,
      message: payload.message,
    };
  } catch (error) {
    throw new Error(
      extractMessage(error, "Login failed. Please check your credentials.")
    );
  }
};

/** POST /auth/register */
export const registerRequest = async (
  payload: RegisterCredentials
): Promise<PostRegisterResponse> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<PostRegisterResponse>> =
      await apiClient.post("/auth/register", payload);
    // Extract data from wrapped response
    return res.data.data;
  } catch (error) {
    throw new Error(
      extractMessage(error, "Registration failed. Please try again.")
    );
  }
};

/** POST /auth/logout */
export const logoutRequest = async (): Promise<void> => {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    throw new Error(extractMessage(error, "Logout failed."));
  }
};

/** POST /auth/forgot-password */
export const forgotPasswordRequest = async (
  payload: ForgotPasswordRequestPayload
): Promise<ForgotPasswordResponse> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<ForgotPasswordResponse>> =
      await apiClient.post(
        "/auth/forgot-password",
        buildIdentifierPayload(payload.identifier)
      );
    return res.data.data;
  } catch (error) {
    throw new Error(
      extractMessage(
        error,
        "Failed to send OTP. Please check your details and try again."
      )
    );
  }
};

/** POST /auth/verify-otp */
export const verifyOtpRequest = async (
  payload: VerifyOtpRequestPayload
): Promise<VerifyOtpResponse> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<VerifyOtpResponse>> =
      await apiClient.post("/auth/verify-otp", {
        ...buildIdentifierPayload(payload.identifier),
        otp: payload.otp,
      });

    const responseData = res.data.data;
    if (!responseData.resetToken) {
      throw new Error("OTP verified, but reset token was not returned.");
    }

    return responseData;
  } catch (error) {
    throw new Error(extractMessage(error, "Invalid OTP. Please try again."));
  }
};

/** POST /auth/resend-otp (or fallback /auth/forgot-password) */
export const resendOtpRequest = async (
  payload: ForgotPasswordRequestPayload
): Promise<MessageResponse> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<MessageResponse>> =
      await apiClient.post(
        "/auth/forgot-password",
        buildIdentifierPayload(payload.identifier)
      );
    return res.data.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to resend OTP."));
  }
};

/** POST /auth/reset-password */
export const resetPasswordRequest = async (
  payload: ResetPasswordPayload
): Promise<MessageResponse> => {
  try {
    const res: AxiosResponse<ApiResponseWrapper<MessageResponse>> =
      await apiClient.post("/auth/reset-password", {
        resetToken: payload.resetToken,
        newPassword: payload.newPassword,
      });
    return res.data.data;
  } catch (error) {
    throw new Error(
      extractMessage(error, "Failed to reset password. Please try again.")
    );
  }
};

/**
 * POST /auth/refresh
 * Called automatically by the Axios response interceptor in apiClient.ts.
 * Expose here only if you need to call it manually (e.g. proactive refresh).
 */
export const refreshTokenRequest = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const res = await apiClient.post<{
      data: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      };
    }>("/auth/refresh", { refreshToken });
    return {
      accessToken: res.data.data.accessToken,
      refreshToken: res.data.data.refreshToken,
    };
  } catch (error) {
    throw new Error(
      extractMessage(error, "Failed to refresh token. Please login again.")
    );
  }
};

// ── Registration OTP Functions (for useVerifyOtp hook) ─────────────────────────

/** POST /auth/verify-otp — wrapper for registration OTP verification */
export const verifyRegistrationOtpRequest = async (
  email: string,
  otp: string
): Promise<VerifyOtpResponse> => {
  return verifyOtpRequest({ identifier: email, otp });
};

/** POST /auth/resend-otp — wrapper for registration OTP resend */
export const resendRegistrationOtpRequest = async (
  email: string
): Promise<{ message: string; otpExpirySeconds: number }> => {
  try {
    const res = await resendOtpRequest({ identifier: email });
    return {
      message: res.message,
      otpExpirySeconds: 300, // 5 minutes default
    };
  } catch (error) {
    throw new Error(
      extractMessage(error, "Failed to resend OTP. Please try again.")
    );
  }
};
