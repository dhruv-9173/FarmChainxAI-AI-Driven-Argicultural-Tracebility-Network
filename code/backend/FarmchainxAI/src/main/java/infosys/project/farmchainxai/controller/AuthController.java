package infosys.project.farmchainxai.controller;

import infosys.project.farmchainxai.dto.*;
import infosys.project.farmchainxai.service.AuthService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Slf4j
public class AuthController {

    @Autowired
    private AuthService authService;

    // ────────────────────────────────────────────────────────────────────────────
    // POST /auth/register
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * Register a new user
     *
     * @param request RegisterRequest with user details
     * @return RegisterResponse with registration status
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("Processing registration request for: {}", request.getEmail());
            RegisterResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>("User registered successfully. OTP sent to email.", response, true));
        } catch (RuntimeException e) {
            log.error("Registration error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null, false));
        } catch (Exception e) {
            log.error("Unexpected error during registration: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("An unexpected error occurred", null, false));
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // POST /auth/verify-registration-otp
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * Verify registration OTP and activate user account
     *
     * @param request VerifyRegistrationOtpRequest with email and OTP
     * @return VerifyRegistrationOtpResponse with verification status
     */
    @PostMapping("/verify-registration-otp")
    public ResponseEntity<?> verifyRegistrationOtp(@Valid @RequestBody VerifyRegistrationOtpRequest request) {
        try {
            log.info("Processing registration OTP verification for: {}", request.getEmail());
            VerifyRegistrationOtpResponse response = authService.verifyRegistrationOtp(request);
            return ResponseEntity.ok(new ApiResponse<>("Email verified successfully", response, true));
        } catch (RuntimeException e) {
            log.error("Registration OTP verification error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null, false));
        } catch (Exception e) {
            log.error("Unexpected error during registration OTP verification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("An unexpected error occurred", null, false));
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // POST /auth/resend-registration-otp
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * Resend registration OTP to user's email (if previous OTP expired)
     *
     * @param request ResendRegistrationOtpRequest with email
     * @return ResendRegistrationOtpResponse with OTP status
     */
    @PostMapping("/resend-registration-otp")
    public ResponseEntity<?> resendRegistrationOtp(@Valid @RequestBody ResendRegistrationOtpRequest request) {
        try {
            log.info("Processing resend registration OTP request for: {}", request.getEmail());
            ResendRegistrationOtpResponse response = authService.resendRegistrationOtp(request);
            return ResponseEntity.ok(new ApiResponse<>("OTP resent successfully", response, true));
        } catch (RuntimeException e) {
            log.error("Resend registration OTP error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null, false));
        } catch (Exception e) {
            log.error("Unexpected error during resend registration OTP: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("An unexpected error occurred", null, false));
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // POST /auth/login
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * Login user and return access & refresh tokens
     *
     * @param request LoginRequest with email and password
     * @return LoginResponse with user data and tokens
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("Processing login request for: {}", request.getEmail());
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(new ApiResponse<>("Login successful", response, true));
        } catch (RuntimeException e) {
            log.error("Login error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(e.getMessage(), null, false));
        } catch (Exception e) {
            log.error("Unexpected error during login: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("An unexpected error occurred", null, false));
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // POST /auth/logout
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * Logout user and invalidate refresh token
     *
     * @return ApiResponse indicating logout status
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        try {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>("Not authenticated", null, false));
            }
            String email = authentication.getName();
            log.info("Processing logout request for: {}", email);
            authService.logout(email);
            return ResponseEntity.ok(new ApiResponse<>("Logout successful", null, true));
        } catch (Exception e) {
            log.error("Logout error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null, false));
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // POST /auth/forgot-password
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * Send OTP to user's email/phone for password reset
     *
     * @param request ForgotPasswordRequest with user identifier
     * @return ForgotPasswordResponse with OTP status
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            log.info("Processing forgot password request for: {}", request.getIdentifier());
            ForgotPasswordResponse response = authService.forgotPassword(request);
            return ResponseEntity.ok(new ApiResponse<>("OTP sent successfully", response, true));
        } catch (RuntimeException e) {
            log.error("Forgot password error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(e.getMessage(), null, false));
        } catch (Exception e) {
            log.error("Unexpected error during forgot password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("An unexpected error occurred", null, false));
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // POST /auth/verify-otp
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * Verify OTP and return reset token
     *
     * @param request VerifyOtpRequest with identifier and OTP
     * @return VerifyOtpResponse with reset token
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            log.info("Processing OTP verification for: {}", request.getIdentifier());
            VerifyOtpResponse response = authService.verifyOtp(request);
            return ResponseEntity.ok(new ApiResponse<>("OTP verified successfully", response, true));
        } catch (RuntimeException e) {
            log.error("OTP verification error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null, false));
        } catch (Exception e) {
            log.error("Unexpected error during OTP verification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("An unexpected error occurred", null, false));
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // POST /auth/reset-password
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * Reset password using reset token and new password
     *
     * @param request ResetPasswordRequest with reset token and new password
     * @return ApiResponse indicating password reset status
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            log.info("Processing password reset");
            authService.resetPassword(request);
            return ResponseEntity.ok(new ApiResponse<>("Password reset successfully", null, true));
        } catch (RuntimeException e) {
            log.error("Password reset error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null, false));
        } catch (Exception e) {
            log.error("Unexpected error during password reset: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("An unexpected error occurred", null, false));
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // POST /auth/refresh
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * Refresh access token using refresh token
     *
     * @param request RefreshTokenRequest with refresh token
     * @return TokenResponse with new tokens
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            log.info("Processing token refresh");
            TokenResponse response = authService.refreshToken(request);
            return ResponseEntity.ok(new ApiResponse<>("Token refreshed successfully", response, true));
        } catch (RuntimeException e) {
            log.error("Token refresh error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(e.getMessage(), null, false));
        } catch (Exception e) {
            log.error("Unexpected error during token refresh: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("An unexpected error occurred", null, false));
        }
    }
}
