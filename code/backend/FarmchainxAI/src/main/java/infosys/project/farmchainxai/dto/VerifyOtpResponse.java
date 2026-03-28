package infosys.project.farmchainxai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpResponse {

    private String message;

    @JsonProperty("resetToken")
    private String resetToken;

    @JsonProperty("expiresInSeconds")
    private Integer expiresInSeconds;
}
