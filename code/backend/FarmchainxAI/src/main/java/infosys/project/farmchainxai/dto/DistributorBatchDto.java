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
public class DistributorBatchDto {

    private String id;
    private String cropType;
    private String variety;
    private String quantity; // e.g., "2,400 kg"
    private Integer qualityScore;
    private String status; // Incoming, Accepted, In Transit, Transferred, Rejected
    private String farmerName;
    private String farmerId;
    private String farmLocation;
    private String receivedAt; // Date as String
    private String transferredTo;
    private String transferredAt;
    private String recipientType; // Retailer or Consumer
    private Integer shelfLifeDays;
    private Integer shelfLifePercent;
    private BigDecimal basePrice;
    private BigDecimal marketPrice;
    private String qualityGrade;
    private Boolean organic;
    private String inspectionNote;
}
