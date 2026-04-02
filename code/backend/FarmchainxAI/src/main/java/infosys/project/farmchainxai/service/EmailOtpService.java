package infosys.project.farmchainxai.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@Slf4j
public class EmailOtpService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String fromAddress;

    public void sendOtpEmail(String toEmail, String otp, int otpValidityMinutes, String purposeLabel) {
        if (!StringUtils.hasText(toEmail)) {
            throw new RuntimeException("Unable to send OTP: destination email is missing");
        }
        if (!StringUtils.hasText(fromAddress)) {
            throw new RuntimeException("Email sender is not configured. Set app.mail.from in application.properties");
        }

        String subject = "FarmChainX OTP for " + purposeLabel;
        String body = String.format(
                "Hello,%n%n" +
                        "Your OTP for %s is: %s%n%n" +
                        "This OTP is valid for %d minutes.%n" +
                        "Do not share this OTP with anyone.%n%n" +
                        "Regards,%nFarmChainX Team",
                purposeLabel,
                otp,
                otpValidityMinutes
        );

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
            log.info("OTP email sent successfully to: {} for {}", toEmail, purposeLabel);
        } catch (MailException ex) {
            log.error("Failed to send OTP email to {}: {}", toEmail, ex.getMessage(), ex);
            throw new RuntimeException("Failed to send OTP email. Please verify email SMTP configuration.");
        }
    }
}
