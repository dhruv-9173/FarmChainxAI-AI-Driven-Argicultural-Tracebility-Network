package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResendRegistrationOtpResponse {
    private String message;
    private String email;
    private String otpSentTo; // "EMAIL" or "PHONE"
    private Integer otpExpirySeconds; // OTP validity in seconds
}

