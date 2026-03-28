package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualityCheckDto {
    private String id;
    private String batchId;
    private Long inspectorId;
    private String inspectorName;
    private LocalDateTime inspectionDate;
    private String status; // IN_PROGRESS, APPROVED, REJECTED
    private Integer qualityScore;
    private String certificateNumber;
    private Double moistureLevel;
    private Integer temperature;
    private Double phLevel;
    private String color;
    private String texture;
    private String smell;
    private Boolean pestInfestation;
    private Boolean moldPresence;
    private Boolean foreignMatter;
    private String notes;
    private String cropType;
    private Double quantity;
}