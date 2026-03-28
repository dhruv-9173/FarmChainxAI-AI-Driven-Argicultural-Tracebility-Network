package infosys.project.farmchainxai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {

    @JsonProperty("id")
    private String id;

    @JsonProperty("userId")
    private Long userId;

    @JsonProperty("type")
    private String type;  // BATCH_TRANSFER, BATCH_ACCEPTED, etc

    @JsonProperty("title")
    private String title;

    @JsonProperty("message")
    private String message;

    @JsonProperty("relatedBatchId")
    private String relatedBatchId;

    @JsonProperty("isRead")
    private Boolean isRead;

    @JsonProperty("createdAt")
    private String createdAt;  // Formatted: "20 Mar 2026, 14:30"

    // For sorting and filtering
    private LocalDateTime createdAtDateTime;
}

