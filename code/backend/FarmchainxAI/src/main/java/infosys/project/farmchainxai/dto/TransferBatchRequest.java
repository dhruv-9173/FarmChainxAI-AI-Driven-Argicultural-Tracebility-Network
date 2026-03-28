package infosys.project.farmchainxai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransferBatchRequest {

    @JsonProperty("recipientId")
    private Long recipientId;

    @JsonProperty("note")
    private String note;
}


