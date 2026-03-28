package infosys.project.farmchainxai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InitiateBatchTransferRequest {

    @JsonProperty("batchId")
    private String batchId;

    @JsonProperty("recipientId")
    private Long recipientId;

    @JsonProperty("recipientRole")
    private String recipientRole;  // DISTRIBUTOR or RETAILER

    @JsonProperty("note")
    private String note;
}

