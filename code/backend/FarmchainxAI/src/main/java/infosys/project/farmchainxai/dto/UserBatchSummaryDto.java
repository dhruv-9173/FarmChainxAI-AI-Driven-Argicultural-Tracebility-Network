package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for displaying batch summary information in user browse profiles.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBatchSummaryDto {

    private Long batchId;
    private String batchCode;
    private String cropType;
    private String cropVariety;
    private BigDecimal quantity;
    private String quantityUnit;
    private String batchStatus;
    private String harvestDate;
    private String quality;
    private Integer qualityScore;
    private Boolean organic;
    private Boolean gapCertified;
    private BigDecimal rating;
}
