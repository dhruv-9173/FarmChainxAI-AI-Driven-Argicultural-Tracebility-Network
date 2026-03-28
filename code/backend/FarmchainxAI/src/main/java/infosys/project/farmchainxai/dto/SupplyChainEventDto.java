package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * SupplyChainEventDto
 * Data Transfer Object for supply chain events
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplyChainEventDto {
    private String id;
    private String batchId;
    private String stage; // SupplyChainStage as string
    private Long actorId;
    private String actorName;
    private String actorRole;
    private String location;
    private Double latitude;
    private Double longitude;
    private Integer temperatureC;
    private Integer humidityPercent;
    private Integer qualityScore;
    private String notes;
    private String eventType;
    private LocalDateTime timestamp;
    private String deviceId;
    private String eventHash; // SHA-256 hash
    private String previousEventHash; // Creates chain
    private String actorSignature; // Digital signature
    private Boolean isVerified;
    
    // Timeline specific fields
    private Integer totalEvents;
    private LocalDateTime firstEventTime;
    private LocalDateTime lastEventTime;
    private String currentStage;
}
