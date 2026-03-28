package infosys.project.farmchainxai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationRequest {

    @JsonProperty("type")
    private String type;  // BATCH_TRANSFER, BATCH_ACCEPTED, BATCH_REJECTED, etc

    @JsonProperty("title")
    private String title;

    @JsonProperty("message")
    private String message;

    @JsonProperty("relatedBatchId")
    private String relatedBatchId;  // Optional: the batch ID this notification relates to
}

