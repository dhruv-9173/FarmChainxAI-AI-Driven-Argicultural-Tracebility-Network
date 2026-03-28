package infosys.project.farmchainxai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordResponse {

    private String message;

    @JsonProperty("deliveryChannel")
    private String deliveryChannel;

    @JsonProperty("expiresInSeconds")
    private Integer expiresInSeconds;
}
