package infosys.project.farmchainxai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmailOtpService {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.mail.from:}")
    private String fromAddress;

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.api.url:https://api.resend.com/emails}")
    private String resendApiUrl;

    public void sendOtpEmail(String toEmail, String otp, int otpValidityMinutes, String purposeLabel) {
        if (!StringUtils.hasText(toEmail)) {
            throw new RuntimeException("Unable to send OTP: destination email is missing");
        }
        if (!StringUtils.hasText(fromAddress)) {
            throw new RuntimeException("Email sender is not configured. Set app.mail.from in application.properties");
        }
        if (!StringUtils.hasText(resendApiKey)) {
            throw new RuntimeException("Resend API key is not configured. Set resend.api.key in application.properties");
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

        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "from", fromAddress,
                    "to", List.of(toEmail),
                    "subject", subject,
                    "text", body
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(resendApiUrl))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.error("Resend API responded with status {} and body: {}", response.statusCode(), response.body());
                throw new RuntimeException("Failed to send OTP email via Resend API.");
            }

            log.info("OTP email sent successfully to: {} for {}", toEmail, purposeLabel);
        } catch (IOException ex) {
            log.error("Failed to serialize Resend payload for {}: {}", toEmail, ex.getMessage(), ex);
            throw new RuntimeException("Failed to prepare OTP email request.");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            log.error("Resend request interrupted for {}: {}", toEmail, ex.getMessage(), ex);
            throw new RuntimeException("OTP email request was interrupted.");
        }
    }
}
