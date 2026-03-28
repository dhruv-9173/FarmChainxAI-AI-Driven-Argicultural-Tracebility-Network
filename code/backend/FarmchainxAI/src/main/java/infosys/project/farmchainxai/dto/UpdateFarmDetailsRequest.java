package infosys.project.farmchainxai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * UpdateFarmDetailsRequest - Request DTO for updating comprehensive farm details
 * Contains all technical and operational information for a farm
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateFarmDetailsRequest {

    @JsonProperty("farmName")
    private String farmName;

    @JsonProperty("farmLocation")
    private String farmLocation;

    @JsonProperty("farmSize")
    private java.math.BigDecimal farmSize;

    @JsonProperty("primaryCrops")
    private String primaryCrops;

    @JsonProperty("soilType")
    private String soilType;

    @JsonProperty("irrigationType")
    private String irrigationType;
}
