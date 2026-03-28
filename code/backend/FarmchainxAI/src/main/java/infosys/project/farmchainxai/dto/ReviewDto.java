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
public class ReviewDto {

    private String id;
    private String batchId;
    private Long userId;

    @JsonProperty("user")
    private String userDisplayName;

    private Integer rating;
    private String comment;
    private String userRole;

    @JsonProperty("date")
    private String formattedDate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
