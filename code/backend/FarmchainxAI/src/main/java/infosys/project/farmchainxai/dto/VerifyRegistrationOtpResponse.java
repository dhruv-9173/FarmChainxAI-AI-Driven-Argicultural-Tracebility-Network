package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyRegistrationOtpResponse {
    private String message;
    private String email;
    private Boolean isVerified;
}

