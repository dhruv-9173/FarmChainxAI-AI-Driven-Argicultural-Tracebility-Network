package infosys.project.farmchainxai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "supply_chain_events", indexes = {
        @Index(name = "idx_batch_id", columnList = "batch_id"),
        @Index(name = "idx_stage", columnList = "stage"),
        @Index(name = "idx_timestamp", columnList = "timestamp"),
        @Index(name = "idx_actor_id", columnList = "actor_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplyChainEvent {

    @Id
    private String id;

    @Column(nullable = false)
    private String batchId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SupplyChainStage stage;

    @Column(nullable = false)
    private Long actorId;

    @Column
    private String actorName;

    @Column
    private String actorRole;

    // Location tracking
    @Column
    private String location;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    // Quality & Environmental conditions
    @Column
    private Integer temperatureC;

    @Column
    private Integer humidityPercent;

    @Column
    private Integer qualityScore; // 0-100

    @Column(precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column
    private String eventType; // SCANNED, RECEIVED, INSPECTED, STORED, TRANSFERRED, SOLD, etc.

    @Column
    private LocalDateTime timestamp;

    @Column
    private String deviceId; // IoT sensor ID or mobile device ID

    @Column(columnDefinition = "JSON")
    private String metadata; // Additional flexible fields

    // Blockchain/Hashing fields
    @Column(length = 256)
    private String eventHash;

    @Column(length = 256)
    private String previousEventHash;

    @Column(columnDefinition = "TEXT")
    private String actorSignature;

    @Column
    @Default
    private Boolean isVerified = false;

    @Column(length = 256)
    private String merkleRoot;

    @Column
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        // Generate ID if not provided
        if (this.id == null || this.id.isEmpty()) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        
        // Set timestamp if not provided
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        
        // Set created timestamp
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        createdAt = LocalDateTime.now();
        if (isVerified == null) {
            isVerified = false;
        }
    }

    public enum SupplyChainStage {
        CREATED,        // Batch created by farmer
        IN_TRANSIT,     // Batch in transit to next actor
        RECEIVED,       // Received by next actor
        QUALITY_CHECK,  // Quality inspection in progress
        STORED,         // In storage/warehouse
        SOLD,           // Sold to end customer
        REJECTED,       // Rejected/returned
        EXPIRED         // Expired/discarded
    }
}
