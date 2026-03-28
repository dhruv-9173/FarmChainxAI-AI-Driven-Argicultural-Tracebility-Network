package infosys.project.farmchainxai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ActivityItemDto {

    @JsonProperty("id")
    private String id;

    @JsonProperty("actionType")
    private String actionType;

    @JsonProperty("title")
    private String title;

    @JsonProperty("description")
    private String description;

    @JsonProperty("time")
    private String time;

    @JsonProperty("badge")
    private String badge;

    @JsonProperty("badgeColor")
    private String badgeColor;

    @JsonProperty("batchId")
    private String batchId;
}

