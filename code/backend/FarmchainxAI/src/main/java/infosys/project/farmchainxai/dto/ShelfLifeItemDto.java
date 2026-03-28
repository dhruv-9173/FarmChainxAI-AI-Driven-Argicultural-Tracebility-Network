package infosys.project.farmchainxai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShelfLifeItemDto {

    @JsonProperty("crop")
    private String crop;

    @JsonProperty("batchId")
    private String batchId;

    @JsonProperty("daysLeft")
    private Integer daysLeft;

    @JsonProperty("percent")
    private Integer percent;

    @JsonProperty("status")
    private String status; // Healthy, Warning, Critical
}

