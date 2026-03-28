export type UserRole =
  | "FARMER"
  | "DISTRIBUTOR"
  | "RETAILER"
  | "CONSUMER"
  | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  phone?: string;
}

export interface PostRegisterResponse {
  message: string;
  email: string;
  otpSentTo: string;
  otpExpirySeconds: number;
}

export interface VerifyRegistrationOtpResponse {
  message: string;
  email: string;
  isVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface MessageResponse {
  message: string;
}

export interface ForgotPasswordRequestPayload {
  identifier: string;
}

export interface ForgotPasswordResponse extends MessageResponse {
  deliveryChannel?: string;
  expiresInSeconds?: number;
}

export interface VerifyOtpRequestPayload {
  identifier: string;
  otp: string;
}

export interface VerifyOtpResponse extends MessageResponse {
  resetToken: string;
  expiresIn?: number;
}

export interface ResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
