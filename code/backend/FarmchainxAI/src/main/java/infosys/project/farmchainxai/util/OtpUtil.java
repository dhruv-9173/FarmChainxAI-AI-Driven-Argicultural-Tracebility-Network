package infosys.project.farmchainxai.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
@Slf4j
public class OtpUtil {

    @Value("${otp.length:6}")
    private int otpLength;

    @Value("${otp.validity-minutes:10}")
    private int otpValidityMinutes;

    private static final SecureRandom random = new SecureRandom();

    public String generateOtp() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otp.append(random.nextInt(10));
        }
        log.debug("Generated OTP: {}", otp);
        return otp.toString();
    }

    public int getOtpValidityMinutes() {
        return otpValidityMinutes;
    }
}
