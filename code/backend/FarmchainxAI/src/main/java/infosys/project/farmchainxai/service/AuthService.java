package infosys.project.farmchainxai.service;

import infosys.project.farmchainxai.dto.*;
import infosys.project.farmchainxai.entity.FarmDetails;
import infosys.project.farmchainxai.entity.FarmerProfile;
import infosys.project.farmchainxai.entity.OtpToken;
import infosys.project.farmchainxai.entity.RefreshToken;
import infosys.project.farmchainxai.entity.User;
import infosys.project.farmchainxai.repository.FarmDetailsRepository;
import infosys.project.farmchainxai.repository.FarmerProfileRepository;
import infosys.project.farmchainxai.repository.OtpTokenRepository;
import infosys.project.farmchainxai.repository.RefreshTokenRepository;
import infosys.project.farmchainxai.repository.UserRepository;
import infosys.project.farmchainxai.util.JwtUtil;
import infosys.project.farmchainxai.util.OtpUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OtpUtil otpUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FarmerProfileRepository farmerProfileRepository;

    @Autowired
    private FarmDetailsRepository farmDetailsRepository;

    // ────────────────────────────────────────────────────────────────────────────
    // REGISTRATION
    // ────────────────────────────────────────────────────────────────────────────

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getEmail());

        // Validate email doesn't exist
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Email already registered: {}", request.getEmail());
            throw new RuntimeException("Email already registered");
        }

        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            log.warn("Password mismatch for registration");
            throw new RuntimeException("Passwords do not match");
        }

        // Create new user (not verified yet)
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phone(request.getPhone())
                .isVerified(false)
                .isEnabled(true)
                .build();

        user = userRepository.saveAndFlush(user);
        if (user.getId() == null) {
            throw new RuntimeException("Failed to create user id");
        }
        log.info("User registered successfully: {}", request.getEmail());

        if (User.UserRole.FARMER.equals(user.getRole())) {
            String farmId = "FARM-" + user.getId();
            FarmerProfile farmerProfile = new FarmerProfile();
            farmerProfile.setUser(user);
            farmerProfile.setFarmId(farmId);
            farmerProfile.setVerified(false);
            farmerProfile.setRating(null);
            farmerProfile = farmerProfileRepository.saveAndFlush(farmerProfile);
            log.info("Farmer profile created for user: {}", request.getEmail());

            FarmDetails farmDetails = FarmDetails.builder()
                    .farmerProfile(farmerProfile)
                    .farmId(farmId)
                    .build();
            farmerProfile.setFarmDetails(farmDetails);
            farmDetailsRepository.saveAndFlush(farmDetails);
            log.info("Farm details stub created for farmer: {} with farmId: {}", request.getEmail(), farmId);
        }

        // Generate and send OTP for email verification
        String otp = otpUtil.generateOtp();
        OtpToken otpToken = OtpToken.builder()
                .identifier(request.getEmail())
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(otpUtil.getOtpValidityMinutes()))
                .isUsed(false)
                .build();
        otpTokenRepository.save(otpToken);

        log.info("Registration OTP generated and sent to: {}", request.getEmail());
        log.debug("Registration OTP (for development): {}", otp);

        return new RegisterResponse(
                "Registration successful. OTP sent to your email. Please verify your email.",
                request.getEmail(),
                "EMAIL",
                otpUtil.getOtpValidityMinutes() * 60
        );
    }

    // ────────────────────────────────────────────────────────────────────────────
    // VERIFY REGISTRATION OTP
    // ────────────────────────────────────────────────────────────────────────────

    @Transactional
    public VerifyRegistrationOtpResponse verifyRegistrationOtp(VerifyRegistrationOtpRequest request) {
        log.info("Registration OTP verification attempt for: {}", request.getEmail());

        // Verify user exists
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("User not found: {}", request.getEmail());
                    return new RuntimeException("User not found");
                });

        // Check if already verified
        if (user.getIsVerified()) {
            log.warn("User already verified: {}", request.getEmail());
            throw new RuntimeException("User email is already verified");
        }

        // Verify OTP
        OtpToken otpToken = otpTokenRepository.findValidOtp(
                request.getEmail(),
                request.getOtp(),
                LocalDateTime.now()
        ).orElseThrow(() -> {
            log.warn("Invalid or expired registration OTP for: {}", request.getEmail());
            return new RuntimeException("Invalid or expired OTP");
        });

        // Mark OTP as used
        otpToken.setIsUsed(true);
        otpTokenRepository.save(otpToken);

        // Mark user as verified
        user.setIsVerified(true);
        userRepository.save(user);

        log.info("Registration OTP verified and email confirmed for: {}", request.getEmail());

        return new VerifyRegistrationOtpResponse(
                "Email verified successfully. You can now login.",
                request.getEmail(),
                true
        );
    }

    // ────────────────────────────────────────────────────────────────────────────
    // RESEND REGISTRATION OTP
    // ────────────────────────────────────────────────────────────────────────────

    @Transactional
    public ResendRegistrationOtpResponse resendRegistrationOtp(ResendRegistrationOtpRequest request) {
        log.info("Resend registration OTP request for: {}", request.getEmail());

        // Verify user exists
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("User not found: {}", request.getEmail());
                    return new RuntimeException("User not found");
                });

        // Check if already verified
        if (user.getIsVerified()) {
            log.warn("User already verified, cannot resend OTP: {}", request.getEmail());
            throw new RuntimeException("User email is already verified. Please login.");
        }

        // Invalidate any existing OTPs for this email
        otpTokenRepository.findLatestValidOtpByIdentifier(request.getEmail(), LocalDateTime.now())
                .ifPresent(otpToken -> {
                    otpToken.setIsUsed(true);
                    otpTokenRepository.save(otpToken);
                });

        // Generate new OTP
        String otp = otpUtil.generateOtp();
        OtpToken otpToken = OtpToken.builder()
                .identifier(request.getEmail())
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(otpUtil.getOtpValidityMinutes()))
                .isUsed(false)
                .build();
        otpTokenRepository.save(otpToken);

        log.info("New registration OTP generated and sent to: {}", request.getEmail());
        log.debug("New registration OTP (for development): {}", otp);

        return new ResendRegistrationOtpResponse(
                "New OTP sent successfully to your email.",
                request.getEmail(),
                "EMAIL",
                otpUtil.getOtpValidityMinutes() * 60
        );
    }

    // ────────────────────────────────────────────────────────────────────────────
    // LOGIN
    // ────────────────────────────────────────────────────────────────────────────

    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("User not found: {}", request.getEmail());
                    return new RuntimeException("User not found");
                });

        // Check if email is verified
        if (!user.getIsVerified()) {
            log.warn("User email not verified: {}", request.getEmail());
            throw new RuntimeException("Email not verified. Please verify your email using the OTP sent during registration.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid password for user: {}", request.getEmail());
            throw new RuntimeException("Invalid password");
        }

        // Generate tokens
        String accessToken = jwtUtil.generateAccessToken(request.getEmail(), "ROLE_" + user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(request.getEmail());

        // Save refresh token
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .isRevoked(false)
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Login successful for: {}", request.getEmail());

        return new LoginResponse(
                convertUserToDto(user),
                new TokenResponse(accessToken, refreshToken, 3600000),
                "Login successful"
        );
    }

    // ────────────────────────────────────────────────────────────────────────────
    // LOGOUT
    // ────────────────────────────────────────────────────────────────────────────

    @Transactional
    public void logout(String email) {
        log.info("Logout request for: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RefreshToken refreshToken = refreshTokenRepository.findByUserAndIsRevokedFalse(user)
                .orElse(null);

        if (refreshToken != null) {
            refreshToken.setIsRevoked(true);
            refreshTokenRepository.save(refreshToken);
        }

        log.info("Logout successful for: {}", email);
    }

    // ────────────────────────────────────────────────────────────────────────────
    // FORGOT PASSWORD - REQUEST OTP
    // ────────────────────────────────────────────────────────────────────────────

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        log.info("Forgot password request for: {}", request.getIdentifier());

        userRepository.findByEmail(request.getIdentifier())
                .or(() -> userRepository.findByPhone(request.getIdentifier()))
                .orElseThrow(() -> {
                    log.warn("User not found: {}", request.getIdentifier());
                    return new RuntimeException("User not found");
                });

        // Generate OTP
        String otp = otpUtil.generateOtp();
        OtpToken otpToken = OtpToken.builder()
                .identifier(request.getIdentifier())
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(otpUtil.getOtpValidityMinutes()))
                .isUsed(false)
                .build();
        otpTokenRepository.save(otpToken);

        log.info("OTP generated and sent for: {}", request.getIdentifier());
        log.debug("OTP (for development): {}", otp);

        return new ForgotPasswordResponse(
                "OTP sent successfully",
                "EMAIL",
                otpUtil.getOtpValidityMinutes() * 60
        );
    }

    // ────────────────────────────────────────────────────────────────────────────
    // VERIFY OTP
    // ────────────────────────────────────────────────────────────────────────────

    @Transactional
    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request) {
        log.info("OTP verification attempt for: {}", request.getIdentifier());

        OtpToken otpToken = otpTokenRepository.findValidOtp(
                request.getIdentifier(),
                request.getOtp(),
                LocalDateTime.now()
        ).orElseThrow(() -> {
            log.warn("Invalid or expired OTP for: {}", request.getIdentifier());
            return new RuntimeException("Invalid or expired OTP");
        });

        // Mark OTP as used
        otpToken.setIsUsed(true);
        otpTokenRepository.save(otpToken);

        // If a user exists for this identifier, mark them verified (handles cases where frontend uses /verify-otp for registration)
        userRepository.findByEmail(request.getIdentifier())
                .or(() -> userRepository.findByPhone(request.getIdentifier()))
                .ifPresent(user -> {
                    if (!Boolean.TRUE.equals(user.getIsVerified())) {
                        user.setIsVerified(true);
                        userRepository.save(user);
                        log.info("User marked as verified via verify-otp: {}", request.getIdentifier());
                    }
                });

        // Generate reset token
        String resetToken = jwtUtil.generateResetToken(request.getIdentifier());

        log.info("OTP verified successfully for: {}", request.getIdentifier());

        return new VerifyOtpResponse(
                "OTP verified successfully",
                resetToken,
                600 // 10 minutes
        );
    }

    // ────────────────────────────────────────────────────────────────────────────
    // RESET PASSWORD
    // ────────────────────────────────────────────────────────────────────────────

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Password reset request");

        if (!jwtUtil.isTokenValid(request.getResetToken())) {
            log.warn("Invalid or expired reset token");
            throw new RuntimeException("Invalid or expired reset token");
        }

        String identifier = jwtUtil.extractEmail(request.getResetToken());

        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByPhone(identifier))
                .orElseThrow(() -> {
                    log.warn("User not found: {}", identifier);
                    return new RuntimeException("User not found");
                });

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password reset successfully for: {}", identifier);
    }

    // ────────────────────────────────────────────────────────────────────────────
    // REFRESH TOKEN
    // ────────────────────────────────────────────────────────────────────────────

    @Transactional
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        log.info("Token refresh request");

        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndIsRevokedFalse(request.getRefreshToken())
                .orElseThrow(() -> {
                    log.warn("Invalid refresh token");
                    return new RuntimeException("Invalid refresh token");
                });

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Refresh token expired");
            throw new RuntimeException("Refresh token expired");
        }

        User user = refreshToken.getUser();

        // Generate new tokens
        String newAccessToken = jwtUtil.generateAccessToken(user.getEmail(), "ROLE_" + user.getRole().name());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        // Update refresh token
        refreshToken.setToken(newRefreshToken);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(refreshToken);

        log.info("Token refreshed successfully for: {}", user.getEmail());

        return new TokenResponse(newAccessToken, newRefreshToken, 3600000);
    }

    // ────────────────────────────────────────────────────────────────────────────
    // HELPER METHODS
    // ────────────────────────────────────────────────────────────────────────────

    private UserDto convertUserToDto(User user) {
        return new UserDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getPhone(),
                user.getCreatedAt().toString()
        );
    }
}
