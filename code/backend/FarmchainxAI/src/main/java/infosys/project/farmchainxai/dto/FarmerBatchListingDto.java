package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerBatchListingDto {

    private String id;
    private String cropType;
    private String variety;
    private String quantity;
    private Integer qualityScore;
    private String qualityGrade;
    private BigDecimal pricePerKg;
    private String availableUntil;
    private Boolean organic;
}
