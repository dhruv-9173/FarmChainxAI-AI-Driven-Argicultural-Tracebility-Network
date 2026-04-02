package infosys.project.farmchainxai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBatchRequest {

    @JsonProperty("cropType")
    private String cropType;

    @JsonProperty("cropVariety")
    private String cropVariety;

    @JsonProperty("quantity")
    private BigDecimal quantity;

    @JsonProperty("quantityUnit")
    private String quantityUnit;

    @JsonProperty("qualityGrade")
    private String qualityGrade;

    @JsonProperty("certifications")
    private String[] certifications;

    @JsonProperty("harvestDate")
    private String harvestDate;

    @JsonProperty("sowingDate")
    private String sowingDate;

    @JsonProperty("farmId")
    private String farmId;

    @JsonProperty("farmCity")
    private String farmCity;

    @JsonProperty("farmState")
    private String farmState;

    @JsonProperty("fieldArea")
    private BigDecimal fieldArea;

    @JsonProperty("soilType")
    private String soilType;

    @JsonProperty("irrigationType")
    private String irrigationType;

    @JsonProperty("storageType")
    private String storageType;

    @JsonProperty("storageLocation")
    private String storageLocation;

    @JsonProperty("expectedShelfLife")
    private Integer expectedShelfLife;

    @JsonProperty("moistureLevel")
    private BigDecimal moistureLevel;

    @JsonProperty("initialQualityScore")
    private Integer initialQualityScore;

    @JsonProperty("notes")
    private String notes;

    @JsonProperty("organic")
    private Boolean organic;

    @JsonProperty("gapCertified")
    private Boolean gapCertified;

    @JsonProperty("cropImageUrl")
    private String cropImageUrl;

    @JsonProperty("cropImageBase64")
    private String cropImageBase64;

}

